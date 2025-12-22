const InputHistoryService = require("./inputHistoryService");

async function triggerImport(req, res, next) {
  try {
    const { datasetUUID, filesName, append = false } = req.body;
    const userId = req.user?.id || null;

    if (!datasetUUID) {
      return res.status(400).json({
        message: "datasetUUID is required",
      });
    }

    if (!Array.isArray(filesName) || filesName.length === 0) {
      return res.status(400).json({
        message: "filesName must be a non-empty array",
      });
    }

    const records = await InputHistoryService.createImportRecordsFromBlobFiles({
      datasetUUID,
      filesName,
      append,
      userId,
    });

    res.status(201).json({
      message: "Import triggered successfully",
      records,
    });
  } catch (err) {
    next(err);
  }
}


async function getAllImportRecords(req, res, next) {
  try {
    const records = await InputHistoryService.getAllImportRecords();
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function getImportRecordsByDataset(req, res, next) {
  try {
    const { datasetUUID } = req.params;

    const records = await InputHistoryService.getImportRecordsByDataset(datasetUUID);

    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  triggerImport,
  getAllImportRecords,
  getImportRecordsByDataset
};
