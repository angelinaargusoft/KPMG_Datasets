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

router.post("/", createEndpointServer);
router.get("/", getAllEndpointServers);
router.get("/uuid/:uuid", getEndpointServerByUUID);
router.get("/:id", getEndpointServerById);
router.put("/:uuid", updateEndpointServer);
router.delete("/:id", deleteEndpointServer);

module.exports = router;
