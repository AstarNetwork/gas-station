import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import GasList from './GasList';

interface GasProps {
  network: string;
}

const Gas: React.FC<GasProps> = ({ network }) => {
  const [slow, setSlow] = useState(0);
  const [average, setAverage] = useState(0);
  const [fast, setFast] = useState(0);
  const [baseFee, setBaseFee] = useState(0);
  const [slowPriorityFee, setSlowPriorityFee] = useState(0);
  const [averagePriorityFee, setAveragePriorityFee] = useState(0);
  const [fastPriorityFee, setFastPriorityFee] = useState(0);
  const [error, setError] = useState('');

  const copyToClipboard = (speed: string) => {
    let text = '';
    switch (speed) {
      case 'slow':
        text = `{"gasPrice": "${slow}", "eip1559": { "baseFee": "${baseFee}", "priorityFee": "${slowPriorityFee}" } }`;
        break;
      case 'average':
        text = `{"gasPrice": "${average}", "eip1559": { "baseFee": "${baseFee}", "priorityFee": "${averagePriorityFee}" } }`;
        break;
      case 'fast':
        text = `{"gasPrice": "${fast}", "eip1559": { "baseFee": "${baseFee}", "priorityFee": "${fastPriorityFee}" } }`;
        break;
    }
    navigator.clipboard.writeText(text)
  }


  useEffect(() => {
    if (!network) {
      return;
    }
    // invalid url will trigger an 404 error
    const url = `https://gas.astar.network/api/gasnow?network=${network}`
    axios.get(url).then((response) => {
      const data = response?.data?.data;

      if (data) {
        setSlow(data.average);
        setAverage(data.fast);
        setFast(data.fastest);

        const eip1559 = data.eip1559;

        if (eip1559) {
          setBaseFee(eip1559.baseFeePerGas);
          setSlowPriorityFee(eip1559.priorityFeePerGas.average);
          setAveragePriorityFee(eip1559.priorityFeePerGas.fast);
          setFastPriorityFee(eip1559.priorityFeePerGas.fastest);
        }
      }
    }).catch(error => {
      setError(error);
    });
  }, [network]);


  return (
    <Grid container spacing={3}>
      {/* Chart */}
      <Grid item xs={12} md={4} lg={4}>
        <Tooltip title="Click to copy">
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('fast') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Fast
            </Typography>
            <Typography variant="h2" align="center">
              {Math.round(fast/Math.pow(10, 9))} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Base Fee: {baseFee/Math.pow(10, 9)} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Priority Fee: {Math.round(fastPriorityFee/Math.pow(10, 9))} Gwei
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      {/* Recent Deposits */}
      <Grid item xs={12} md={4} lg={4}>
        <Tooltip title="Click to copy">
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('average') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Average
            </Typography>
            <Typography variant="h2" align="center">
              {Math.round(average/Math.pow(10, 9))} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Base Fee: {baseFee/Math.pow(10, 9)} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Priority Fee: {Math.round(averagePriorityFee/Math.pow(10, 9))} Gwei
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Tooltip title="Click to copy">
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('average') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Slow
            </Typography>
            <Typography variant="h2" align="center" style={{ cursor: 'pointer' }} onClick={() => { copyToClipboard('slow') }}>
              {Math.round(slow/Math.pow(10, 9))} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Base Fee: {baseFee/Math.pow(10, 9)} Gwei
            </Typography>
            <Typography color="text.secondary" align="center">
              Priority Fee: {Math.round(slowPriorityFee/Math.pow(10, 9))} Gwei
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      {/* Last Gas */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <GasList network="astar" />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Gas;
