import { triggerImport } from "../api/inputHistoryService";

const actions = {
  async triggerImportFromBlobFiles(
    { commit },
    { datasetUUID, filesName, append = false }
  ) {
    commit("setLoading", true);
    commit("setError", null);

    try {
      const records = await triggerImport({
        datasetUUID,
        filesName,
        append,
      });

      return records;
    } catch (err) {
      commit(
        "setError",
        err.message || "Failed to trigger import"
      );
      throw err;
    } finally {
      commit("setLoading", false);
    }
  },
};

export default actions;
