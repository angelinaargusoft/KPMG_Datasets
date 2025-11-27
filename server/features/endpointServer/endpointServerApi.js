const express = require("express");
const router = express.Router();

const {
  createEndpointServer,
  getAllEndpointServers,
  getEndpointServerById,
  getEndpointServerByUUID,
  updateEndpointServer,
  deleteEndpointServer,
} = require("./endpointServerController");

// CREATE endpoint server
router.post("/", createEndpointServer);

// GET all endpoint servers (with pagination ?page=&pageSize=)
router.get("/", getAllEndpointServers);

// GET endpoint server by UUID
router.get("/uuid/:uuid", getEndpointServerByUUID);

// GET endpoint server by numeric ID
router.get("/:id", getEndpointServerById);

// UPDATE endpoint server by UUID
router.put("/:uuid", updateEndpointServer);

// DELETE endpoint server by numeric ID
router.delete("/:id", deleteEndpointServer);

module.exports = router;
