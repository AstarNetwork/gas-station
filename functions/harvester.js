/* eslint-disable require-jsdoc */
const ethers = require('ethers');
const Web3 = require('web3');

const endpoints = {
  astar: 'wss://rpc.astar.network',
  shibuya: 'wss://rpc.shibuya.astar.network',
  shiden: 'wss://rpc.shiden.astar.network',
};

const calculatePriorityFeeToTip = (fee) => {
  // Rate: https://stakesg.slack.com/archives/C028YNW1PED/p1652343972144359?thread_ts=1652338487.358459&cid=C028YNW1PED
  const rate = 15;
  const eth = ethers.utils.formatUnits(fee, rate);
  const wei = ethers.utils.parseEther(eth).toString();
  return wei;
};

const historicalBlocks = 200;

const timestamp = Date.now();

const estimate = {
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

exports.harvest = function(network, cb) {
  const endpoint = endpoints[network];

  if (!endpoint) {
    return cb(new Error(`No web3 instance for ${network}`));
  }

  const web3 = new Web3(endpoint);
  web3.eth
      .getFeeHistory(historicalBlocks, 'latest', [10, 70, 90])
      .then((feeHistory) => {
        const blocks = formatFeeHistory(feeHistory);

        if (blocks.length) {
          const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
          const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
          const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));

          web3.eth
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
                if (cb) {
                  cb(null, estimate[network]);
                }
              })
              .catch((err) => {
                console.error(err);
                if (cb) {
                  cb(err);
                }
              });
        }
      })
      .catch((err) => {
        console.error(err);
        if (cb) {
          cb(err);
        }
      });
};

if (require.main === module) {
  exports.harvest('astar', console.log);
}
