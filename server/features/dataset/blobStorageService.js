const { BlobServiceClient } = require("@azure/storage-blob");

function createBlobClient(connectionString) {
    console.log(connectionString)
  if (!connectionString) {
    throw new Error("Missing connection string for Blob endpoint");
  }

  return BlobServiceClient.fromConnectionString(connectionString);
}

async function createContainerIfNotExists(connectionString, containerName) {
  const normalized = containerName.toLowerCase();

  const client = createBlobClient(connectionString);
  const containerClient = client.getContainerClient(normalized);

  const response = await containerClient.createIfNotExists();

  return {
    created: !!response.requestId,
    name: normalized,
  };
}

module.exports = {
  createContainerIfNotExists,
};
