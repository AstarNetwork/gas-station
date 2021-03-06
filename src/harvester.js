import web3 from './web3.js';
import { calculatePriorityFeeToTip } from './utils/index.js';

const historicalBlocks = 200;

const timestamp = Date.now();

export const estimate = {
  shibuya: {
    slow: '3535532476',
    average: '4504034937',
    fast: '58799450137',
    timestamp: timestamp,
    eip1559: {
      priorityFeePerGas: {
        slow: '2535532476',
        average: '3504034937',
        fast: '57799450137',
      },
      baseFeePerGas: '1000000000',
    },
    tip: {
      slow: calculatePriorityFeeToTip('2535532476'),
      average: calculatePriorityFeeToTip('3504034937'),
      fast: calculatePriorityFeeToTip('57799450137'),
    },
  },
  shiden: {
    slow: '3535532476',
    average: '4504034937',
    fast: '58799450137',
    timestamp: timestamp,
    eip1559: {
      priorityFeePerGas: {
        slow: '2535532476',
        average: '3504034937',
        fast: '57799450137',
      },
      baseFeePerGas: '1000000000',
    },
    tip: {
      slow: calculatePriorityFeeToTip('2535532476'),
      average: calculatePriorityFeeToTip('3504034937'),
      fast: calculatePriorityFeeToTip('57799450137'),
    },
  },
  astar: {
    slow: '3535532476',
    average: '4504034937',
    fast: '58799450137',
    timestamp: timestamp,
    eip1559: {
      priorityFeePerGas: {
        slow: '2535532476',
        average: '3504034937',
        fast: '57799450137',
      },
      baseFeePerGas: '1000000000',
    },
    tip: {
      slow: calculatePriorityFeeToTip('2535532476'),
      average: calculatePriorityFeeToTip('3504034937'),
      fast: calculatePriorityFeeToTip('57799450137'),
    },
  },
};

function avg(arr) {
  const sum = arr.reduce((a, v) => a + v);
  return Math.round(sum / arr.length);
}

function formatFeeHistory(result) {
  try {
    let blockNum = Number(result.oldestBlock);
    let index = 0;
    const blocks = [];

    while (
      blockNum < Number(result.oldestBlock) + historicalBlocks &&
      result.reward &&
      result.reward[index]
    ) {
      blocks.push({
        number: blockNum,
        baseFeePerGas: Number(result.baseFeePerGas[index]),
        gasUsedRatio: Number(result.gasUsedRatio[index]),
        priorityFeePerGas: result.reward[index].map((x) => Number(x)),
      });
      blockNum += 1;
      index += 1;
    }

    return blocks;
  } catch (error) {
    return [];
  }
}

export function harvest(network) {
  if (!web3[network]) {
    return console.error(`No web3 instance for ${network}`);
  }
  web3[network].eth
    .getFeeHistory(historicalBlocks, 'latest', [10, 70, 90])
    .then((feeHistory) => {
      const blocks = formatFeeHistory(feeHistory);

      if (blocks.length) {
        const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
        const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
        const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));

        web3[network].eth
          .getBlock('latest')
          .then((block) => {
            const baseFeePerGas =
              Number(block.baseFeePerGas) ||
              (blocks[0] && blocks[0].baseFeePerGas) ||
              1000000000;
            estimate[network] = {
              slow: String(slow + baseFeePerGas),
              average: String(average + baseFeePerGas),
              fast: String(fast + baseFeePerGas),
              timestamp: Date.now(),
              eip1559: {
                priorityFeePerGas: {
                  slow: String(slow),
                  average: String(average),
                  fast: String(fast),
                },
                baseFeePerGas: String(baseFeePerGas),
              },
              tip: {
                slow: calculatePriorityFeeToTip(String(slow)),
                average: calculatePriorityFeeToTip(String(average)),
                fast: calculatePriorityFeeToTip(String(fast)),
              },
            };
            console.log('estimate:', network, estimate[network]);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
