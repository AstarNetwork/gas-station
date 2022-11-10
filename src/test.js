import { GasPriceOracle } from 'gas-price-oracle';

const defaultRpc = 'https://evm.astar.network';
const oracle = new GasPriceOracle({ defaultRpc, chainId: 592 })

const fallbackGasPrices = {
  gasPrices: {
    instant: 28,
    fast: 22,
    standard: 17,
    low: 11,
  },
  estimated: {
    maxFeePerGas: 20,
    maxPriorityFeePerGas: 3,
  },
}

oracle.gasPricesWithEstimate({ fallbackGasPrices, shouldGetMedian: true }).then((gasPrices) => {
  console.log(gasPrices);
})