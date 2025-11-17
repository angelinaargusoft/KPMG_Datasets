const DataEndpointService = require("./dataEndpointService");

async function createDataEndpoint(req, res, next) {
  try {
    const dataEndpoint = await DataEndpointService.createDataEndpoint(req.body);
    res.status(201).json({ message: "DataEndpoint created", dataEndpoint });
  } catch (err) {
    next(err);
  }
}

async function getAllDataEndpoints(req, res, next) {
  try {
    const dataEndpoints = await DataEndpointService.getAllDataEndpoints();
    res.json(dataEndpoints);
  } catch (err) {
    next(err);
  }
}


async function getDataEndpointByUUID(req, res, next) {
  try {
    const dataEndpoint = await DataEndpointService.getDataEndpointByUUID(req.params.uuid);
    if (!dataEndpoint) return res.status(404).json({ message: "DataEndpoint not found" });
    res.json(dataEndpoint);
  } catch (err) {
    next(err);
  }
}

async function updateDataEndpoint(req, res, next) {
  try {
    const updated = await DataEndpointService.updateDataEndpoint(req.params.id, req.body);
    res.json({ message: "DataEndpoint updated", updated });
  } catch (err) {
    next(err);
  }
}

async function deleteDataEndpoint(req, res, next) {
  try {
    await DataEndpointService.deleteDataEndpoint(req.params.id);
    res.json({ message: "DataEndpoint deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDataEndpoint,
  getAllDataEndpoints,
  getDataEndpointByUUID,
  updateDataEndpoint,
  deleteDataEndpoint,
};
