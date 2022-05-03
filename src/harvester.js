import { WsProvider, ApiPromise } from '@polkadot/api';
import { db }  from './db.js';

const RPC_NODE_ENDPOINT = 'wss://rpc.astar.network';

export async function main() {
 
  // Other public RPC endpoints listed above
    const wsProvider = new WsProvider(RPC_NODE_ENDPOINT);

    const api = await ApiPromise.create({
        provider: wsProvider
    });

    await api.isReady;

    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    console.log(`Connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

    api.rpc.chain.subscribeNewHeads(async (header) => {
        console.log(`Chain is at #${header.number}`);
        const signedBlock = await api.rpc.chain.getBlock(header.hash);

        // the information for each of the contained extrinsics
        signedBlock.block.extrinsics.forEach((ex, index) => {
            // the extrinsics are decoded by the API, human-like view
            console.log(index, ex.toHuman());
        
            const { method: { args, method, section } } = ex;
        
            // explicit display of name, args & documentation
            console.log(`${section}.${method}`);
            const params = args.map((a) => a.toString()).join(', ');
            try {
                const paramsJson = JSON.parse(params);
                const gas = paramsJson.legacy.gasPrice;
                if (gas != null) {
                    db.run('INSERT INTO astar_gas_predictor(gas, blockNumber) VALUES(?, ?)', [Number(gas), header.number.toString()], (err) => {
                        if(err) {
                            return console.log(err.message); 
                        }
                        console.log('Row was added to the table astar_gas_predictor:', gas, ' ' ,header.number.toString());
                    })
                }
                
            } catch (error) {
                console.log(error);
            }
        });

    });
}