import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

dayjs.extend(relativeTime);

function shortenHash(hash: string): string {
	return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`;
}

interface Transaction {
  time: string;
  hash: string;
  from: string;
  tip: number;
  gasPrice: number;
  gasUsed: number;
}

interface GasListProps {
  network: string;
}

const TipList: React.FC<GasListProps> = ({ network }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setError] = useState('');

  useEffect(() => {
    if (!network) {
      return;
    }

    const client = new ApolloClient({
      uri: `https://squid.subsquid.io/gs-explorer-${network}/graphql`,
      cache: new InMemoryCache(),
    });

    const query = gql`
    query MyQuery {
      extrinsics(limit: 30, where: {tip_gt: "0"}, orderBy: id_DESC) {
        fee
        id
        tip
        success
        indexInBlock
        timestamp
        signerPublicKey
        blockNumber
        extrinsicHash
        mainCall {
          callName
        }
      }
    }
    `;

    const ecdsaPubKeyToSs58 = (publicKey: string, networkPrefix?: number): string => {
      const ss58PubKey = hexToU8a(publicKey);
      const ss58Address = encodeAddress(ss58PubKey, networkPrefix);
      return ss58Address;
    };

    const getData = async () => {
      try {
        const response = await client.query({
          query,
        });

        setTransactions([]);
        const result: Transaction[] = [];

        const data = response?.data;
        console.log('graphql', data);

        if (data?.extrinsics?.length) {
          // eslint-disable-next-line no-loop-func
          data.extrinsics.forEach(async (txn: any) => {
            const transaction: Transaction = {
              time: dayjs(txn.timestamp).fromNow(),
              hash: txn.extrinsicHash,
              from: ecdsaPubKeyToSs58(txn.signerPublicKey, 5),
              tip: Math.round(txn.tip/Math.pow(10, 10))/Math.pow(10, 8),
              gasPrice: Math.round(txn.fee/Math.pow(10, 10))/Math.pow(10, 8),
              gasUsed: 0,
            };
            result.push(transaction);
          });
        }

        setTransactions(result);

      } catch (error: any) {
        console.log(error);
        setError(error.message);
      }
    };

    getData();
  }, [network]);

  return (
    <>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Tip Usage History
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Txn Hash</TableCell>
            <TableCell>From</TableCell>
            <TableCell>Tip (ASTR)</TableCell>
            <TableCell>Fee Used (ASTR)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length ? transactions.map((txn) => (
            <TableRow key={txn.hash}>
              <TableCell>{txn.time}</TableCell>
              <TableCell>
                <a target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/extrinsic/${txn.hash}`}>
                  {shortenHash(txn.hash)}
                </a>
              </TableCell>
              <TableCell>
                <a target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/account/${txn.from}`}>
                  {txn.from}
                </a>
              </TableCell>
              <TableCell>{txn.tip}</TableCell>
              <TableCell>{txn.gasPrice}</TableCell>
            </TableRow>
          )) : <Typography align="center" sx={{p: 2}}>...</Typography>}
        </TableBody>
      </Table>
      <a style={{padding: 5}} color="primary" target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/extrinsics`}>
        {'More >'}
      </a>
    </>
  );
}

export default TipList;
