const { v4: uuidv4 } = require("uuid");
const DatasetRepository = require("./datasetRepository");
const DataEndpointService = require("../dataEndpoint/dataEndpointService");  // <-- added
const { createContainerIfNotExists, deleteContainer } = require("./blobStorageService");

async function ensureEndpointExists(endpointUUID) {
  if (!endpointUUID) return; 
  
  const endpoint = await DataEndpointService.getDataEndpointByUUID(endpointUUID);
  if (!endpoint) {
    throw new Error(`DataEndpoint with UUID ${endpointUUID} does not exist`);
  }
}

async function createDataset(data) {
  if (!data.name) throw new Error("Dataset name is required");
  if (!data.applicationPackageId) throw new Error("ApplicationPackageId is required");

  if (!["Blob", "SFTP"].includes(data.storageType)) {
    throw new Error("Invalid storageType. Allowed: Blob, SFTP");
  }

  let endpoint = null;

  if (data.endpointServerUUID) {
    endpoint = await DataEndpointService.getDataEndpointByUUID(
      data.endpointServerUUID
    );

    if (!endpoint) {
      throw new Error(`DataEndpoint with UUID ${data.endpointServerUUID} does not exist`);
    }
  }

  const newDataset = {
    uuid: uuidv4(),
    name: data.name.trim(),
    description: data.description || null,
    applicationPackageId: data.applicationPackageId,
    storageType: data.storageType,
    enablev3: data.enablev3 ?? false,
    tablePrefix: data.tablePrefix || null,
    createdBy: data.createdBy || null,
    endpointServerUUID: data.endpointServerUUID || null,
  };

  const createdDataset = await DatasetRepository.createDataset(newDataset);

  if (createdDataset.storageType === "Blob" && endpoint) {
    try {
      await createContainerIfNotExists(endpoint.hostname, createdDataset.uuid);
    } catch (err) {
      console.error("Blob creation error:", err);
      throw new Error("Failed to provision blob container for dataset");
    }
  }

  return createdDataset;
}

async function getAllDatasets() {
  return DatasetRepository.getAllDatasets();
}

async function getDatasetById(id) {
  return DatasetRepository.getDatasetById(id);
}

async function getDatasetByUUID(uuid) {
  return DatasetRepository.getDatasetByUUID(uuid);
}

async function updateDataset(id, data) {
  const allowedFields = [
    "description",
    "applicationPackageId",
    "enablev3",
    "tablePrefix",
  ];

  const cleanUpdates = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      cleanUpdates[key] = data[key];
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No valid fields to update");
  }

  // 👉 SIMPLE: ensure endpoint exists before updating
  if (cleanUpdates.endpointServerUUID) {
    await ensureEndpointExists(cleanUpdates.endpointServerUUID);
  }

  const updatedDataset = await DatasetRepository.updateDataset(id, cleanUpdates);
  return updatedDataset;
}

async function deleteDataset(id) {
  // 1. Load dataset first (before deleting DB record)
  const dataset = await DatasetRepository.getDatasetById(id);
  if (!dataset) throw new Error("Dataset not found");

  // 2. If Blob → delete Azure container
  if (dataset.storageType === "Blob" && dataset.endpointServerUUID) {
    const endpoint = await DataEndpointService.getDataEndpointByUUID(
      dataset.endpointServerUUID
    );

    if (!endpoint) {
      console.warn("Dataset endpoint not found — skipping container deletion.");
    } else {
      try {
        const connectionString = endpoint.hostname; // adjust if column differs
        const containerName = dataset.uuid.toLowerCase();

        await deleteContainer(connectionString, containerName);

        console.log(`Deleted container: ${containerName}`);
      } catch (err) {
        console.error("Failed to delete container:", err);
      }
    }
  }

  // 3. Delete dataset from database
  const deletedDataset = await DatasetRepository.deleteDataset(id);
  return deletedDataset;
}

module.exports = {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
};











