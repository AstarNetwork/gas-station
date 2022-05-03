import express from 'express'
const app = express()
const port = 3000
import { db }  from './db.js';

import { main } from './harvester.js';

app.get('/api/gasNow', (req, res, next) => {
    let gasPredictor = {"Rapid": null, "Average": null, "Slow": null, "timestamp": Date.now()};
    db.all("SELECT gas, blockNumber FROM astar_gas_predictor order by blockNumber desc limit 10000",
    (error, rows) => {
        if (error){
            return next(error);
        } 
        if (rows) {
            rows.sort((a, b) => b.gas - a.gas);
            gasPredictor["Rapid"] = rows[0]['gas'];
            gasPredictor["Average"] = rows[Math.floor(rows.length / 2)]['gas'];
            gasPredictor["Slow"] = rows[rows.length - 1]['gas'];
        }
        res.json(gasPredictor);
    
    });
})

app.listen(port, () => {
    main();
  console.log(`Example app listening on port ${port}`)
})