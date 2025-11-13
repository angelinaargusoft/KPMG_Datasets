const express = require('express');
const router = express.Router();
const {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
}  = require("./datasetController");


router.post("/", createDataset);

router.get("/", getAllDatasets);

router.get("/:id", getDatasetById);

router.get("/uuid/:uuid", getDatasetByUUID);

router.put("/:id", updateDataset);

router.delete("/:id", deleteDataset);

module.exports = router;















