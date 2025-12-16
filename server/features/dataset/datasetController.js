const DatasetService = require("./datasetService");
async function createDataset(req, res, next) {
  try {
    const dataset = await DatasetService.createDataset(req.body);
    res.status(201).json({ message: "Dataset created", dataset });
  } catch (err) {
    next(err);
  }
}
async function getAllDatasets(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = null,
      sortDirection = null,
      search = null
    } = req.query;

    const result = await DatasetService.getDatasetsPaginated(
      Number(page),
      Number(pageSize),
      sortBy,
      sortDirection,
      search
    );
    res.json(result); // { data, pagination }
  } catch (err) {
    next(err);
  }
}
async function getDatasetById(req, res, next) {
  try {
    const dataset = await DatasetService.getDatasetById(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json(dataset);
  } catch (err) {
    next(err);
  }
}
async function getDatasetByUUID(req, res, next) {
  try {
    const dataset = await DatasetService.getDatasetByUUID(req.params.uuid);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json(dataset);
  } catch (err) {
    next(err);
  }
}
async function updateDataset(req, res, next) {
  try {
    const updated = await DatasetService.updateDataset(req.params.id, req.body);
    res.json({ message: "Dataset updated", updated });
  } catch (err) {
    next(err);
  }
}
async function deleteDataset(req, res, next) {
  try {
    await DatasetService.deleteDataset(req.params.id);
    res.json({ message: "Dataset deleted" });
  } catch (err) {
    next(err);
  }
}

async function listDatasetBlobFiles(req, res, next) {
  try {
    const { uuid } = req.params;

    const files = await DatasetService.listDatasetBlobFiles({
      datasetUUID: uuid,
    });

    res.json({
      data: files,
      totalItems: files.length,
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
  listDatasetBlobFiles
};