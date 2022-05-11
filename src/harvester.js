import web3 from './web3.js';

const historicalBlocks = 200;

export const estimate = {
    shibuya: {},
    shiden: {},
    astar: {},
};

function avg(arr) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum/arr.length);
}

function formatFeeHistory(result) {

    let blockNum = Number(result.oldestBlock);
    let index = 0;
    const blocks = [];

    while ((blockNum < Number(result.oldestBlock) + historicalBlocks) && result.reward[index]) {
      blocks.push({
        number: blockNum,
        baseFeePerGas: Number(result.baseFeePerGas[index]),
        gasUsedRatio: Number(result.gasUsedRatio[index]),
        priorityFeePerGas: result.reward[index].map(x => Number(x)),
      });
      blockNum += 1;
      index += 1;
    }

    return blocks;
}

export function harvest(network) {
    if (!web3[network]) {
        return console.error(`No web3 instance for ${network}`);
    }
    web3[network].eth.getFeeHistory(historicalBlocks, "latest", [10, 70, 90]).then((feeHistory) => {
        const blocks = formatFeeHistory(feeHistory);
        
        const slow    = avg(blocks.map(b => b.priorityFeePerGas[0]));
        const average = avg(blocks.map(b => b.priorityFeePerGas[1]));
        const fast    = avg(blocks.map(b => b.priorityFeePerGas[2]));

        web3[network].eth.getBlock("latest").then((block) => {
            const baseFeePerGas = Number(block.baseFeePerGas) || (blocks[0] && blocks[0].baseFeePerGas) || 1000000000;
            estimate[network] = {
                slow: slow + baseFeePerGas,
                average: average + baseFeePerGas,
                fast: fast + baseFeePerGas,
                timestamp: Date.now(),
                eip1559: {
                    priorityFeePerGas: {
                        slow: slow,
                        average: average,
                        fast: fast,
                    },
                    baseFeePerGas: baseFeePerGas,
                }
            };
            console.log("estimate:", network, estimate[network]);
        });
    });
}
