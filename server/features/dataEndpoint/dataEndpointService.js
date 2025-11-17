const { v4: uuidv4 } = require("uuid");
const DataEndpointRepository = require("./dataEndpointRepository");

async function createDataEndpoint(data) {
  if (!data.name) {
    throw new Error("DataEndpoint name is required");
  }
  if (!["blob", "sftp"].includes(data.type)) {
    throw new Error("Invalid type. Allowed: blob, sftp");
  }
  if (!data.hostname) {
    throw new Error("hostname is required");
  }

  const newEndpoint = {
    uuid: uuidv4(),
    name: data.name.trim(),
    type: data.type,
    hostname: data.hostname.trim(),
  };

  const endpointId = await DataEndpointRepository.createDataEndpoint(newEndpoint);
  return { id: endpointId, uuid: newEndpoint.uuid };
}

async function getAllDataEndpoints() {
  return DataEndpointRepository.getAllDataEndpoints();
}


async function getDataEndpointByUUID(uuid) {
  const endpoint = await DataEndpointRepository.getDataEndpointByUUID(uuid);
  if (!endpoint) throw new Error(`DataEndpoint with UUID ${uuid} not found`);
  return endpoint;
}

async function updateDataEndpoint(id, data) {
  const allowedFields = ["name", "type", "hostname"];

  const cleanUpdates = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) cleanUpdates[key] = data[key];
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No valid fields to update");
  }

  const affected = await DataEndpointRepository.updateDataEndpoint(id, cleanUpdates);
  if (!affected) throw new Error(`DataEndpoint with id ${id} not found`);

  return { message: "DataEndpoint updated successfully" };
}

async function deleteDataEndpoint(id) {
  const affected = await DataEndpointRepository.deleteDataEndpoint(id);
  if (!affected) throw new Error(`DataEndpoint with id ${id} not found`);
  return { message: "DataEndpoint deleted successfully" };
}

module.exports = {
  createDataEndpoint,
  getAllDataEndpoints,
  getDataEndpointByUUID,
  updateDataEndpoint,
  deleteDataEndpoint,
};
