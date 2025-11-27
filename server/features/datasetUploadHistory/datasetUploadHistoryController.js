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


async function deleteDatasetFile(req, res, next) {
  try {
    const { uploadUUID } = req.params;
    const result = await DatasetUploadService.deleteUploadedFile(uploadUUID);

    res.json(result); 
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
