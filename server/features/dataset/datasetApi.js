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

const { upload, uploadDatasetFile } = require("../datasetUploadHistory/datasetUploadHistoryController");


router.post("/", createDataset);

router.get("/", getAllDatasets);

router.get("/:id", getDatasetById);

router.get("/uuid/:uuid", getDatasetByUUID);

router.post("/:uuid/upload", upload.single("file"), uploadDatasetFile);

router.put("/:id", updateDataset);

router.delete("/:id", deleteDataset);

module.exports = router;















