const { v4: uuidv4 } = require("uuid");
const DatasetRepository = require("./datasetRepository");
const EndpointServerService = require("../endpointServer/endpointServerService")
const { createContainerIfNotExists, deleteContainer } = require("./blobStorageService");

const { SecretClient } = require("@azure/keyvault-secrets");
const { ClientSecretCredential } = require("@azure/identity");

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

function extractStorageAccountName(resourceId) {
  if (!resourceId) return null;
  const parts = resourceId.split("/").filter(Boolean);
  // last segment after "storageAccounts/"
  return parts[parts.length - 1] || null;
}

async function getSecretValueFromKeyVault(secretUri) {
  if (!secretUri) return null;

  const url = new URL(secretUri);
  const segments = url.pathname.split("/").filter(Boolean);
  // ["secrets", "<name>", "<version>"]
  const secretName = segments[1];
  const version = segments[2];
  const vaultUrl = `${url.protocol}//${url.host}`;

  const client = new SecretClient(vaultUrl, credential);
  const secret = await client.getSecret(secretName, version);
  return secret.value;
}

async function buildBlobConnectionStringFromEndpoint(endpoint) {
  if (!endpoint) throw new Error("Endpoint is required to build connection string");
  if (endpoint.type !== "blob") {
    throw new Error("Endpoint type must be 'blob' to build blob connection string");
  }

  const accountName = extractStorageAccountName(endpoint.hostname);
  if (!accountName) {
    throw new Error("Invalid endpoint hostname/resourceId: cannot extract storage account name");
  }

  // Add fallback to key2 later
  const accountKey = await getSecretValueFromKeyVault(endpoint.key1);
  if (!accountKey) {
    throw new Error("Could not resolve account key from Key Vault (key1)");
  }

  return (
    "DefaultEndpointsProtocol=https;" +
    `AccountName=${accountName};` +
    `AccountKey=${accountKey};` +
    "EndpointSuffix=core.windows.net"
  );
}

async function ensureEndpointExists(endpointUUID) {
  if (!endpointUUID) return;

  const endpoint = await EndpointServerService.getEndpointServerByUUID(endpointUUID);
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
    endpoint = await EndpointServerService.getEndpointServerByUUID(
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

  // If Blob + endpoint provided - create container
  if (createdDataset.storageType === "Blob" && endpoint) {
    try {
      const connectionString = await buildBlobConnectionStringFromEndpoint(endpoint);
      const containerName = createdDataset.uuid.toLowerCase();

      await createContainerIfNotExists(connectionString, containerName);
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

async function getDatasetsPaginated(page = 1, pageSize = 10) {
  return DatasetRepository.getDatasetsPaginated(page, pageSize);
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

  const updatedDataset = await DatasetRepository.updateDataset(id, cleanUpdates);
  return updatedDataset;
}

async function deleteDataset(id) {
  const dataset = await DatasetRepository.getDatasetById(id);
  if (!dataset) throw new Error("Dataset not found");

  //If Blob - delete Azure container
  if (dataset.storageType === "Blob" && dataset.endpointServerUUID) {
    const endpoint = await EndpointServerService.getEndpointServerByUUID(
      dataset.endpointServerUUID
    );

    if (!endpoint) {
      console.warn("Dataset endpoint not found — skipping container deletion.");
    } else {
      try {
        const connectionString = await buildBlobConnectionStringFromEndpoint(endpoint);
        const containerName = dataset.uuid.toLowerCase();

        await deleteContainer(connectionString, containerName);

        console.log(`Deleted container: ${containerName}`);
      } catch (err) {
        console.error("Failed to delete container:", err);
      }
    }
  }

  //Delete dataset from database
  const deletedDataset = await DatasetRepository.deleteDataset(id);
  return deletedDataset;
}

module.exports = {
  createDataset,
  getAllDatasets,
  getDatasetsPaginated,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
  buildBlobConnectionStringFromEndpoint
};












