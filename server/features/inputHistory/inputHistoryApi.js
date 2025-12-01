const express = require("express");
const router = express.Router();
const { triggerImport, getAllImportRecords, getImportRecordsByDataset } = require('./inputHistoryController')

router.post("/trigger-import", triggerImport);
router.get("/", getAllImportRecords);
router.get("/dataset/:datasetUUID", getImportRecordsByDataset);

module.exports = router;
