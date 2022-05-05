import express from 'express'

import { harvest, estimate } from './harvester.js';

const BLOCK_INTERVAL = 12000;

const app = express()
const port = 3000

app.get('/api/:network/gasNow', (req, res, next) => {
    const network = req.params.network;
    if (['shibuya', 'shiden', 'astar'].includes(network) === false) {
        return next(new Error('Invalid network'));
    }
   
    res.json({
        code: 200,
        data: estimate[network],
    });
});

app.listen(port, () => {
    setInterval(() => {
        harvest('shibuya');
        harvest('shiden');
        harvest('astar');
    }, BLOCK_INTERVAL);
    console.log(`App listening on port ${port}`)
});