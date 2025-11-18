// datasetUploadController.js
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Make sure this matches the actual file: datasetUploadService.js
const DatasetUploadService = require("./datasetUploadHistoryService");

async function uploadDatasetFile(req, res, next) {
  try {
    const datasetUUID = req.params.uuid;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const result = await DatasetUploadService.uploadFileForDataset(
      datasetUUID,
      file
    );

    res.status(201).json({
      message: "File uploaded successfully",
      upload: result,
    });
  } catch (err) {
    next(err);
  }
}

// List uploaded files for a dataset
async function getDatasetFiles(req, res, next) {
  try {
    const datasetUUID = req.params.uuid;

    const files = await DatasetUploadService.getFilesForDataset(datasetUUID);

    res.json({ files });
  } catch (err) {
    next(err);
  }
}

// 🔥 NEW: delete an uploaded file (blob + history record)
async function deleteDatasetFile(req, res, next) {
  try {
    const { id } = req.params; // this is the upload history record ID

    const result = await DatasetUploadService.deleteUploadedFile(id);

    res.json(result); // e.g. { message: "File and upload record deleted successfully" }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upload,
  uploadDatasetFile,
  getDatasetFiles,
  deleteDatasetFile,
};