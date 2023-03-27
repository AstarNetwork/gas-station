import {GasPriceOracle} from 'gas-price-oracle';

const oracle = new GasPriceOracle({
  defaultRpc: 'https://evm.astar.network',
  blocksCount: 200,
  chainId: 592,
});


oracle.legacy.gasPrices({shouldGetMedian: true}).then((gasPrices) => {
  console.log(gasPrices) // { instant: 21.5, fast: 19, standard: 17, low: 15 }
})