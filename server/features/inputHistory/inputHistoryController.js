const InputHistoryService = require("./inputHistoryService");

async function triggerImport(req, res, next) {
  try {
    const { datasetUUID, uploadUUID } = req.body;
    const userId = req.user?.id || null;

    const record = await InputHistoryService.createImportRecord(
      datasetUUID,
      uploadUUID,
      userId
    );

    res.status(201).json({
      message: "Import triggered successfully",
      record
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
