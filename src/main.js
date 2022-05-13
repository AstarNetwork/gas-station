import express from 'express';
import cors from 'cors';

import { harvest, estimate } from './harvester.js';

const BLOCK_INTERVAL = 5000;

const app = express()

app.use(cors())

const port = process.env.PORT || 3000;

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