import { useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { ApiContext } from './ApiContext';
import { padding } from '@mui/system';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

function shortenHash(hash: string): string {
	return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`;
}

function preventDefault(event: any) {
  event.preventDefault();
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface Transaction {
  time: string;
  extrinsicIndex: string;
  accountId: string;
  refTime: string;
  proofSize: string;
}

interface GasListProps {
  network: string;
}

const GasList: React.FC<GasListProps> = ({ network }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!network) {
      return;
    }

    const getData = async () => {
      try {
        setTransactions([]);
        const result: Transaction[] = [];

        // invalid url will trigger an 404 error
        const url = `https://${network}.api.subscan.io/api/scan/extrinsics`

        const body = {
          row: 20,
          page: 1,
          module: "contracts"
        };
        const response = await axios.post(url, body)
        const data = response?.data?.data;

        if (data?.extrinsics?.length) {
          for (let i = 0; i < data.extrinsics.length; i++) {

            try {
              const params = JSON.parse(data.extrinsics[i].params);

              result.push({
                time: dayjs(data.extrinsics[i].block_timestamp).format('YYYY-MM-DD HH:mm:ss'),
                extrinsicIndex: data.extrinsics[i].extrinsic_index,
                accountId: data.extrinsics[i].account_id,
                refTime: params[2].value.ref_time,
                proofSize: params[2].value.proof_size
              });

            } catch (error: any) {
              console.log(error);
            }

          }
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
    <React.Fragment>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Weights History
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Extrinsic Id</TableCell>
            <TableCell>AccountId</TableCell>
            <TableCell>refTime</TableCell>
            <TableCell>proofSize</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length ? transactions.map((txn) => (
            <TableRow key={txn.extrinsicIndex}>
              <TableCell>{txn.time}</TableCell>
              <TableCell>
                <a target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/extrinsic/${txn.extrinsicIndex}`}>
                  {txn.extrinsicIndex}
                </a>
              </TableCell>
              <TableCell>{txn.accountId}</TableCell>
              <TableCell>{txn.refTime}</TableCell>
              <TableCell>{txn.proofSize}</TableCell>
            </TableRow>
          )) : <Typography align="center" sx={{p: 2}}>Loading...</Typography>}
        </TableBody>
      </Table>
      <a style={{padding: 5}} color="primary" target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/extrinsic?module=contracts`}>
        {'More >'}
      </a>
    </React.Fragment>
  );
}

export default GasList;
