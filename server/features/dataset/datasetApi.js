const express = require("express");
const router = express.Router();

const {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
} = require("./datasetController");

const {
  upload,
  uploadDatasetFile,
  getDatasetFiles,
  deleteDatasetFile,
} = require("../datasetUploadHistory/datasetUploadHistoryController");

// Create dataset
router.post("/", createDataset);

// Get all datasets
router.get("/", getAllDatasets);

// Get dataset by UUID
router.get("/uuid/:uuid", getDatasetByUUID);

// Get dataset by numeric ID
router.get("/:id", getDatasetById);

// Upload file for dataset (by dataset UUID)
router.post("/:uuid/upload", upload.single("file"), uploadDatasetFile);

// Get files for dataset (paginated: ?page=&pageSize=)
router.get("/:uuid/files", getDatasetFiles);

// Update dataset by numeric ID
router.put("/:id", updateDataset);

// Delete uploaded file (by dataset UUID + upload UUID)
router.delete("/:uuid/files/:uploadUUID", deleteDatasetFile);

// Delete dataset by numeric ID
router.delete("/:id", deleteDataset);

module.exports = router;
















