// blobStorageService.js
const { BlobServiceClient } = require("@azure/storage-blob");

function createBlobClient(connectionString) {
  if (!connectionString) {
    throw new Error("Missing connection string for Blob endpoint");
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

async function createContainerIfNotExists(connectionString, containerName) {
  const normalized = containerName.toLowerCase();
  const client = createBlobClient(connectionString);
  const containerClient = client.getContainerClient(normalized);
  await containerClient.createIfNotExists();
  return containerClient;
}

async function uploadBufferToContainer(connectionString, containerName, buffer, blobName, mimeType) {
  const containerClient = await createContainerIfNotExists(
    connectionString,
    containerName
  );

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType || "application/octet-stream" },
  });

  return {
    url: blockBlobClient.url,
    container: containerClient.containerName,
    blobName,
  };
}

async function deleteBlobFromContainer(connectionString, containerName, blobName) {
  const blobService = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobService.getContainerClient(containerName);
  const blobClient = containerClient.getBlockBlobClient(blobName);

  const response = await blobClient.deleteIfExists();
  return response.succeeded;
}

module.exports = {
  createContainerIfNotExists,
  uploadBufferToContainer,
  deleteBlobFromContainer
};

