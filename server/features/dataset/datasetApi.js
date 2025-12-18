const express = require("express");
const router = express.Router();

const {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
  listDatasetBlobFiles,
  deleteDatasetBlobFiles,
  downloadDatasetBlobFiles
} = require("./datasetController");

const {
  upload,
  uploadDatasetFile,
  getDatasetFiles,
} = require("../datasetUploadHistory/datasetUploadHistoryController");

router.post("/", createDataset);
router.get("/", getAllDatasets);
router.get("/uuid/:uuid", getDatasetByUUID);
router.get("/uuid/:uuid/blob-files", listDatasetBlobFiles);
router.delete("/uuid/:uuid/blob-files", deleteDatasetBlobFiles);
router.post("/uuid/:uuid/blob-files/download", downloadDatasetBlobFiles);
router.get("/:id", getDatasetById);
router.post("/:uuid/upload", upload.single("file"), uploadDatasetFile);
router.get("/:uuid/files", getDatasetFiles);
router.put("/:id", updateDataset);
router.delete("/:id", deleteDataset);

module.exports = router;
















