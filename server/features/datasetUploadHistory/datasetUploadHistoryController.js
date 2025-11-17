// datasetUploadController.js
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
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

module.exports = {
  upload,
  uploadDatasetFile,
};
