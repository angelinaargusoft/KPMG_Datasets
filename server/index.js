require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8000;

const datasetApi = require('./features/dataset/datasetApi');
const endpointServerApi = require('./features/endpointServer/endpointServerApi');
const inputHistoryApi = require('./features/inputHistory/inputHistoryApi');

const app = express();

app.use(cors())
app.use(express.json());

app.use('/api/datasets', datasetApi);
app.use('/api/endpointServers', endpointServerApi);
app.use('/api/inputHistory', inputHistoryApi)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});