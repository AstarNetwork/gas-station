/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const ethers = require('ethers');
const {GasPriceOracle} = require('gas-price-oracle');
const Web3 = require('web3');
const percentile = require('percentile');

const web3 = {
  astar: new Web3('wss://rpc.astar.network'),
  shibuya: new Web3('wss://rpc.shibuya.astar.network'),
  shiden: new Web3('wss://rpc.shiden.astar.network'),
  rocstar: new Web3('wss://rocstar.astar.network'),
};

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

const rocstarOracle = new GasPriceOracle({
  defaultRpc: 'https://evm.rocstar.astar.network',
  blocksCount: 200,
  chainId: 692,
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
  shibuya: shibuyaOracle,
  shiden: shidenOracle,
  rocstar: rocstarOracle,
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
  rocstar: {
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

  oracle.gasPricesWithEstimate(options).then(async (result) => {
    const latest = await web3[network].eth.getBlock('latest');
    const gasPrices = [];

    let block;
    let txn;

    for (let i = latest.number; i > latest.number - 20; i--) {
      block = await web3[network].eth.getBlock(i);
      for (let j = 0; j < block.transactions.length; j++) {
        txn = await web3[network].eth.getTransaction(block.transactions[j]);
        gasPrices.push(Number(txn.gasPrice));
      }
    }

    const percentiles = percentile([35, 60, 90, 99], gasPrices);
    console.log('gasPrices', gasPrices);
    console.log('percentiles', percentiles);

    const gwei = ethers.BigNumber.from(10).pow(ethers.BigNumber.from(9));

    const baseFeePerGas = ethers.BigNumber.from(parseInt(result.estimate && result.estimate.baseFee) || 1).mul(gwei);
    const maxFeePerGas = ethers.BigNumber.from(parseInt(result.estimate && result.estimate.maxFeePerGas) || 20).mul(gwei);
    const maxPriorityFeePerGas = ethers.BigNumber.from(parseInt(result.estimate && result.estimate.maxPriorityFeePerGas) || 30).mul(gwei);
    const slow = ethers.BigNumber.from(percentiles[0] || result.gasPrices.low * Math.pow(10, 9));
    const average = ethers.BigNumber.from(percentiles[1] || result.gasPrices.standard * Math.pow(10, 9));
    const fast = ethers.BigNumber.from(percentiles[2] || result.gasPrices.fast * Math.pow(10, 9));
    const fastest = ethers.BigNumber.from(percentiles[3] || result.gasPrices.instant * Math.pow(10, 9));

    estimate[network] = {
      slow: slow.toString(),
      average: average.toString(),
      fast: fast.toString(),
      fastest: fastest.toString(),
      timestamp: Date.now(),
      eip1559: {
        priorityFeePerGas: {
          slow: slow.toString(),
          average: average.toString(),
          fast: fast.toString(),
          fastest: fastest.toString(),
        },
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        baseFeePerGas: baseFeePerGas.toString(),
      },
      tip: {
        slow: calculatePriorityFeeToTip(slow.toString()),
        average: calculatePriorityFeeToTip(average.toString()),
        fast: calculatePriorityFeeToTip(fast.toString()),
        fastest: calculatePriorityFeeToTip(fastest.toString()),
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
