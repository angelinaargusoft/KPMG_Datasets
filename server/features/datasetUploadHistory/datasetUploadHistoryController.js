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

// List uploaded files for a dataset (paginated)
async function getDatasetFiles(req, res, next) {
  try {
    const datasetUUID = req.params.uuid;
    const { page = 1, pageSize = 10 } = req.query;

    const { data, pagination } =
      await DatasetUploadService.getFilesForDataset(
        datasetUUID,
        Number(page),
        Number(pageSize)
      );

    res.json({
      files: data,
      pagination,
    });
  } catch (err) {
    next(err);
  }
}

// 🔥 Delete an uploaded file (blob + history record) by upload UUID
async function deleteDatasetFile(req, res, next) {
  try {
    // route should be something like: DELETE /datasets/:uuid/files/:uploadUUID
    const { uploadUUID } = req.params;

    const result = await DatasetUploadService.deleteUploadedFile(uploadUUID);

    res.json(result); // { message: "File and upload record deleted successfully" }
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
