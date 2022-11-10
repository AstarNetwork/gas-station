/* eslint-disable require-jsdoc */
const ethers = require('ethers');
const {GasPriceOracle} = require('gas-price-oracle');

const astarOracle = new GasPriceOracle({
  defaultRpc: 'https://evm.astar.network',
  blocksCount: 200,
  chainId: 592,
});

const shidenOracle = new GasPriceOracle({
  defaultRpc: 'https://evm.shiden.astar.network',
  blocksCount: 200,
  chainId: 336,
});

const shibuyaOracle = new GasPriceOracle({
  defaultRpc: 'https://evm.shibuya.astar.network',
  blocksCount: 200,
  chainId: 81,
});

const fallbackGasPrices = {
  gasPrices: {
    instant: 30,
    fast: 20,
    standard: 15,
    low: 10,
  },
  estimated: {
    maxFeePerGas: 20,
    maxPriorityFeePerGas: 3,
  },
};

const oracles = {
  astar: astarOracle,
  shibuya: shidenOracle,
  shiden: shibuyaOracle,
};

const calculatePriorityFeeToTip = (fee) => {
  // Rate: https://stakesg.slack.com/archives/C028YNW1PED/p1652343972144359?thread_ts=1652338487.358459&cid=C028YNW1PED
  const rate = 15;
  const eth = ethers.utils.formatUnits(fee, rate);
  const wei = ethers.utils.parseEther(eth).toString();
  return wei;
};

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

exports.harvest = function(network, cb) {
  const oracle = oracles[network];

  if (!oracle) {
    return cb(new Error(`No web3 instance for ${network}`));
  }

  const options = {fallbackGasPrices, shouldGetMedian: true};

  oracle.gasPricesWithEstimate(options).then((result) => {
    const baseFeePerGas = result.estimate.baseFee * Math.pow(10, 9);
    const maxFeePerGas = result.estimate.maxFeePerGas * Math.pow(10, 9);
    const maxPriorityFeePerGas = result.estimate.maxPriorityFeePerGas * Math.pow(10, 9); // eslint-disable-line
    const slow = result.gasPrices.standard * Math.pow(10, 9);
    const average = result.gasPrices.fast * Math.pow(10, 9);
    const fast = result.gasPrices.instant * Math.pow(10, 9);

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
        maxFeePerGas: String(maxFeePerGas),
        maxPriorityFeePerGas: String(maxPriorityFeePerGas),
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
  }).catch((err) => {
    console.error(err);
    if (cb) {
      cb(err);
    }
  });
};

if (require.main === module) {
  exports.harvest('astar', console.log);
}
