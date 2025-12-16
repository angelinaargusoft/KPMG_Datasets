const { v4: uuidv4 } = require("uuid");
const DatasetRepository = require("./datasetRepository");
const EndpointServerService = require("../endpointServer/endpointServerService");
const {
  createContainerIfNotExists,
  deleteContainer,
  listBlobMetadataInContainer
} = require("./blobStorageService");

const { SecretClient } = require("@azure/keyvault-secrets");
const { ClientSecretCredential } = require("@azure/identity");

//Azure credentials
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

function extractStorageAccountName(resourceId) {
  if (!resourceId) return null;
  const parts = resourceId.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

async function getSecretValueFromKeyVault(secretUri) {
  if (!secretUri) return null;

  const url = new URL(secretUri);
  const segments = url.pathname.split("/").filter(Boolean);
  const secretName = segments[1];
  const version = segments[2];
  const vaultUrl = `${url.protocol}//${url.host}`;

  const client = new SecretClient(vaultUrl, credential);
  const secret = await client.getSecret(secretName, version);

  return secret.value;
}

async function buildBlobConnectionStringFromEndpoint(endpoint) {
  if (!endpoint) {
    throw new Error("Endpoint is required to build connection string");
  }

  if (endpoint.type !== "blob") {
    throw new Error("Endpoint type must be 'blob'");
  }

  const accountName = extractStorageAccountName(endpoint.hostname);
  if (!accountName) {
    throw new Error("Unable to extract storage account name from endpoint");
  }

  let accountKey = null;

  try {
    accountKey = await getSecretValueFromKeyVault(endpoint.key1);
  } catch (err) {
    console.warn("Failed to fetch key1, trying key2:", err.message);
  }

  if (!accountKey && endpoint.key2) {
    try {
      accountKey = await getSecretValueFromKeyVault(endpoint.key2);
    } catch (err) {
      console.error("Failed to fetch key2:", err.message);
    }
  }

  if (!accountKey) {
    throw new Error("Could not resolve storage account key");
  }

  return (
    "DefaultEndpointsProtocol=https;" +
    `AccountName=${accountName};` +
    `AccountKey=${accountKey};` +
    "EndpointSuffix=core.windows.net"
  );
}

async function getDataset(datasetUUID) {
  const dataset = await DatasetRepository.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");
  return dataset;
}

async function getEndpoint(endpointUUID) {
  const endpoint =
    await EndpointServerService.getEndpointServerByUUID(endpointUUID);

  if (!endpoint) throw new Error("Endpoint server not found");

  return endpoint;
}

async function resolveDatasetBlobContext(datasetUUID) {
  const dataset = await getDataset(datasetUUID);

  if (dataset.storageType !== "Blob") {
    throw new Error("Dataset is not backed by Blob storage");
  }

  if (!dataset.endpointServerUUID) {
    throw new Error("Dataset has no endpoint server configured");
  }

  const endpoint = await getEndpoint(dataset.endpointServerUUID);

  const connectionString =
    await buildBlobConnectionStringFromEndpoint(endpoint);

  const containerName = dataset.uuid.toLowerCase();

  return {
    dataset,
    endpoint,
    connectionString,
    containerName,
  };
}

async function createDataset(data) {
  if (!data.name) throw new Error("Dataset name is required");
  if (!data.applicationPackageId)
    throw new Error("ApplicationPackageId is required");

  if (!["Blob", "SFTP"].includes(data.storageType)) {
    throw new Error("Invalid storageType. Allowed: Blob, SFTP");
  }

  let endpoint = null;
  if (data.endpointServerUUID) {
    endpoint = await getEndpoint(data.endpointServerUUID);
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

  if (newDataset.storageType === "Blob" && endpoint) {
    try {
      const connectionString =
        await buildBlobConnectionStringFromEndpoint(endpoint);

      await createContainerIfNotExists(
        connectionString,
        newDataset.uuid.toLowerCase()
      );
    } catch (err) {
      console.error("Blob creation error:", err);
      throw new Error("Failed to provision blob container for dataset");
    }
  }

  return DatasetRepository.createDataset(newDataset);
}

async function getAllDatasets() {
  return DatasetRepository.getAllDatasets();
}

async function getDatasetsPaginated(
  page = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = null,
  search = null
) {
  return DatasetRepository.getDatasetsPaginated(
    page,
    pageSize,
    sortBy,
    sortDirection,
    search
  );
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

  if (!Object.keys(cleanUpdates).length) {
    throw new Error("No valid fields to update");
  }

  return DatasetRepository.updateDataset(id, cleanUpdates);
}

async function deleteDataset(id) {
  const dataset = await DatasetRepository.getDatasetById(id);
  if (!dataset) throw new Error("Dataset not found");

  if (dataset.storageType === "Blob" && dataset.endpointServerUUID) {
    try {
      const { connectionString, containerName } =
        await resolveDatasetBlobContext(dataset.uuid);

      await deleteContainer(connectionString, containerName);
    } catch (err) {
      console.error("Failed to delete container:", err);
    }
  }

  return DatasetRepository.deleteDataset(id);
}

async function listDatasetBlobFiles({ datasetUUID }) {
  const { connectionString, containerName } =
    await resolveDatasetBlobContext(datasetUUID);

  return listBlobMetadataInContainer({
    connectionString,
    containerName,
  });
}

module.exports = {
  createDataset,
  getAllDatasets,
  getDatasetsPaginated,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
  buildBlobConnectionStringFromEndpoint,
  listDatasetBlobFiles,
};
