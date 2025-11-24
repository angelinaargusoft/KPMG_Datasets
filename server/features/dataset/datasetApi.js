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

const { upload, uploadDatasetFile, getDatasetFiles, deleteDatasetFile } = require("../datasetUploadHistory/datasetUploadHistoryController");


router.post("/", createDataset);

router.get("/", getAllDatasets);

router.get("/uuid/:uuid", getDatasetByUUID);

router.get("/:id", getDatasetById);

router.post("/:uuid/upload", upload.single("file"), uploadDatasetFile);

router.get("/:uuid/files", getDatasetFiles);

router.put("/:id", updateDataset);

router.delete("/uploads/:id", deleteDatasetFile);

router.delete("/:id", deleteDataset);

module.exports = router;















