import { useState, useEffect } from 'react';
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

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

function shortenHash(hash: string): string {
	return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`;
}

function preventDefault(event: any) {
  event.preventDefault();
}

interface Transaction {
  time: string;
  hash: string;
  from: string;
  gasPrice: string;
  gasUsed: string;
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
    // invalid url will trigger an 404 error
    const url = `https://${network}.api.subscan.io/api/scan/evm/transactions`
    const body = {
      block_num: 3149433
    };
    axios.post(url, body).then((response) => {
      const data = response?.data?.data;

      if (data?.list?.length) {
        const result: Transaction[] = data.list.map((txn: any): Transaction => {
          const transaction: Transaction = {
            time: (dayjs as any).unix(txn.block_timestamp).fromNow(),
            hash: txn.hash,
            from: txn.from,
            gasPrice: txn.gas_price,
            gasUsed: txn.gas_used,
          };
          return transaction;
        });

        setTransactions(result);
      }
    }).catch(error => {
      setError(error);
    });
  }, [network]);

  return (
    <React.Fragment>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Gas Usage History
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Txn Hash</TableCell>
            <TableCell>From</TableCell>
            <TableCell>Gas Price (Wei)</TableCell>
            <TableCell>Gas Used (Units)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.hash}>
              <TableCell>{txn.time}</TableCell>
              <TableCell>
                <a target='_blank' rel='noreferrer' href={`https://${network}.subscan.io/extrinsic/${txn.hash}`}>
                  {shortenHash(txn.hash)}
                </a>
              </TableCell>
              <TableCell>{txn.from}</TableCell>
              <TableCell>{txn.gasPrice}</TableCell>
              <TableCell>{txn.gasUsed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        {'Next >'}
      </Link>
    </React.Fragment>
  );
}

export default GasList;
