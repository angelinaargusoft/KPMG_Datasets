require("dotenv").config();

const { tableClient } = require("../services/azureTableClient");

(async () => {
  console.log("Listing ImportControl rows...\n");

  for await (const e of tableClient.listEntities()) {
    console.log(e)
  }

  process.exit(0);
})();


