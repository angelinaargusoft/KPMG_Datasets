const EndpointServerService = require("./endpointServerService");

// --------------------------------------------------
// CREATE
// --------------------------------------------------
async function createEndpointServer(req, res, next) {
  try {
    const endpoint = await EndpointServerService.createEndpointServer(req.body);
    res.status(201).json({ message: "Endpoint server created", endpoint });
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// GET ALL (Paginated)
// --------------------------------------------------
async function getAllEndpointServers(req, res, next) {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);

    const result = await EndpointServerService.getEndpointServersPaginated(
      parsedPage,
      parsedPageSize
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// GET BY ID
// --------------------------------------------------
async function getEndpointServerById(req, res, next) {
  try {
    const server = await EndpointServerService.getEndpointServerById(
      req.params.id
    );

    if (!server)
      return res.status(404).json({ message: "Endpoint server not found" });

    res.json(server);
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// GET BY UUID
// --------------------------------------------------
async function getEndpointServerByUUID(req, res, next) {
  try {
    const server = await EndpointServerService.getEndpointServerByUUID(
      req.params.uuid
    );

    if (!server)
      return res.status(404).json({ message: "Endpoint server not found" });

    res.json(server);
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------
async function updateEndpointServer(req, res, next) {
  try {
    const updated = await EndpointServerService.updateEndpointServer(
      req.params.uuid,
      req.body
    );

    res.json({ message: "Endpoint server updated", updated });
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// DELETE
// --------------------------------------------------
async function deleteEndpointServer(req, res, next) {
  try {
    await EndpointServerService.deleteEndpointServer(req.params.id);
    res.json({ message: "Endpoint server deleted" });
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------

module.exports = {
  createEndpointServer,
  getAllEndpointServers,
  getEndpointServerById,
  getEndpointServerByUUID,
  updateEndpointServer,
  deleteEndpointServer,
};
