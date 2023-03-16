import web3 from './web3.js';
import percentile from 'percentile';


export async function harvest(network) {
  const latest = await web3[network].eth.getBlock('latest')
  // .getFeeHistory(10, 'latest', [35, 60, 90])
  const gasPrices = [];

  let block;
  let txn;

  console.log(latest);

  for (let i = latest.number; i > latest.number - 20; i--) {
    block =  await web3[network].eth.getBlock(i);
    for (let j = 0; j < block.transactions.length; j++) {
      txn = await web3[network].eth.getTransaction(block.transactions[j]);
      console.log(txn.hash, txn.gasPrice);
      gasPrices.push(Number(txn.gasPrice));
    }
  }

  console.log(percentile([35, 60, 99], gasPrices));

}

harvest('astar').catch(console.error);
