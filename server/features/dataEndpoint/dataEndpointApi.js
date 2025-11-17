const express = require("express");
const router = express.Router();
const {
  createDataEndpoint,
  getAllDataEndpoints,
  getDataEndpointByUUID,
  updateDataEndpoint,
  deleteDataEndpoint,
} = require("./dataEndpointController");

router.post("/", createDataEndpoint);

router.get("/", getAllDataEndpoints);

router.get("/:uuid", getDataEndpointByUUID);

router.put("/:id", updateDataEndpoint);

router.delete("/:id", deleteDataEndpoint);

module.exports = router;

