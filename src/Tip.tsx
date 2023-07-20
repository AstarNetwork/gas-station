import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import TipList from './TipList';

interface TipProps {
  network: string;
}

const Tip: React.FC<TipProps> = ({ network }) => {
  const [slow, setSlow] = useState(0);
  const [average, setAverage] = useState(0);
  const [fast, setFast] = useState(0);
  const [, setError] = useState('');

  const copyToClipboard = (speed: string) => {
    let text = '';
    switch (speed) {
      case 'slow':
        text = `{"tip": "${slow}" }`;
        break;
      case 'average':
        text = `{"tip": "${average}" }`;
        break;
      case 'fast':
        text = `{"tip": "${fast}" }`;
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
        setSlow(data.tip.slow);
        setAverage(data.tip.average);
        setFast(data.tip.fast);
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
              {Math.round(fast/Math.pow(10, 10))/Math.pow(10, 8)} ASTR
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
              {Math.round(average/Math.pow(10, 10))/Math.pow(10, 8)} ASTR
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
              {Math.round(slow/Math.pow(10, 10))/Math.pow(10, 8)} ASTR
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      {/* Last Gas */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <TipList network={network} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Tip;
