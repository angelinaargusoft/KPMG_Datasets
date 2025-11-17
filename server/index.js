require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8000;

const datasetApi = require('./features/dataset/datasetApi');
const dataEndpointApi = require('./features/dataEndpoint/dataEndpointApi');

const app = express();

app.use(cors())
app.use(express.json());

app.use('/api/datasets', datasetApi);
app.use('/api/dataEndpoint', dataEndpointApi);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});