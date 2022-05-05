import Web3 from 'web3';

const web3 = {
    astar: new Web3('wss://rpc.astar.network'),
    shibuya: new Web3('wss://rpc.shibuya.astar.network'),
    shiden: new Web3('wss://rpc.shiden.astar.network'),
};

export default web3;