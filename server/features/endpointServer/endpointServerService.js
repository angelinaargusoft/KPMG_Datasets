// services/endpointServer/endpointServerService.js
const { v4: uuidv4 } = require("uuid");
const EndpointServerRepository = require("./endpointServerRepository");

function validateType(type) {
  if (!["blob", "sftp"].includes(type)) {
    throw new Error("Invalid type. Allowed: blob, sftp");
  }
}

async function createEndpointServer(data) {
  if (!data.name) throw new Error("Endpoint name is required");
  if (!data.type) throw new Error("Endpoint type is required"); // blob | sftp
  validateType(data.type);

  const newEndpoint = {
    uuid: uuidv4(),
    name: data.name.trim(),
    active: data.active ?? 1,
    type: data.type,                                  // 'blob' or 'sftp'
    hostname: data.hostname || null,                  // e.g. connection string / host
    apiKey: data.apiKey || null,                      // SAS / password / etc.
    key1: data.key1 || null,                          // e.g. Key Vault URI
    key2: data.key2 || null,                          // e.g. Key Vault URI
    isKeyEncrypted: data.isKeyEncrypted ?? 1,
    useAzureFunction: data.useAzureFunction ?? 0,
  };

  const createdEndpoint = await EndpointServerRepository.createEndpointServer(
    newEndpoint
  );
  return createdEndpoint;
}

async function getAllEndpointServers() {
  return EndpointServerRepository.getAllEndpointServers();
}

async function getEndpointServersPaginated(page = 1, pageSize = 10) {
  return EndpointServerRepository.getEndpointServersPaginated(page, pageSize);
}

async function getEndpointServerById(id) {
  return EndpointServerRepository.getEndpointServerById(id);
}

async function getEndpointServerByUUID(uuid) {
  return EndpointServerRepository.getEndpointServerByUUID(uuid);
}

async function updateEndpointServer(uuid, data) {
  // only allow specific fields to be updated
  const allowedFields = [
    "name",
    "active",
    "type",
    "hostname",
    "apiKey",
    "key1",
    "key2",
    "isKeyEncrypted",
    "useAzureFunction",
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

  // validate type if being changed
  if (cleanUpdates.type) {
    validateType(cleanUpdates.type);
  }

  const updated = await EndpointServerRepository.updateEndpointServer(
    uuid,
    cleanUpdates
  );
  return updated;
}

async function deleteEndpointServer(id) {
  // ensure it exists first
  const existing = await EndpointServerRepository.getEndpointServerById(id);
  if (!existing) throw new Error("Endpoint server not found");

  const deleted = await EndpointServerRepository.deleteEndpointServer(id);
  return deleted;
}

module.exports = {
  createEndpointServer,
  getAllEndpointServers,
  getEndpointServersPaginated,
  getEndpointServerById,
  getEndpointServerByUUID,
  updateEndpointServer,
  deleteEndpointServer,
};
