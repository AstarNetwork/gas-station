import { useState, useContext, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import WeightList from './WeightList';
import { ApiContext } from './ApiContext';

interface GasProps {
  network: string;
}

interface WeightType {
  normal: {
    refTime: string;
    proofSize: string;
  },
  operational: {
    refTime: string;
    proofSize: string;
  },
  mandatory: {
    refTime: string;
    proofSize: string;
  }
}

const Weight: React.FC<GasProps> = ({ network }) => {
  const [weight, setWeight] = useState<WeightType>();
  const [error, setError] = useState('');

  const {
    astarApi,
    astarApiReady,
    shidenApi,
    shidenApiReady,
    shibuyaApi,
    shibuyaApiReady
  } = useContext(ApiContext)

  const copyToClipboard = (speed: string) => {
    let text = '';

    if (!weight) {
      return;
    }

    switch (speed) {
      case 'normal':
        text = JSON.stringify(weight.normal);
        break;
      case 'operational':
        text = JSON.stringify(weight.operational);
        break;
      case 'mandatory':
        text = JSON.stringify(weight.mandatory);
        break;
    }
    navigator.clipboard.writeText(text)
  }


  useEffect(() => {
    if (!network) {
      return;
    }

    const api = network === 'shiden' ? shidenApi : network === 'shibuya' ? shibuyaApi : astarApi;
    const apiReady = network === 'shiden' ? shidenApiReady : network === 'shibuya' ? shibuyaApiReady : astarApiReady;

    if (!api || !apiReady) {
      return;
    }

    const getData = async () => {
      try {
        const weights = await api.consts.system.blockWeights;

        setWeight({
          normal: {
            refTime: weights.perClass?.normal?.maxExtrinsic?.unwrapOr(null)?.refTime.toString() || '324,901,026,000',
            proofSize: weights.perClass?.normal?.maxExtrinsic?.unwrapOr(null)?.proofSize.toString() || '3,407,872',
          },
          operational: {
            refTime: weights.perClass?.operational?.maxExtrinsic?.unwrapOr(null)?.refTime.toString() || '449,901,026,000',
            proofSize: weights.perClass?.operational?.maxExtrinsic?.unwrapOr(null)?.proofSize.toString() || '4,718,592',
          },
          mandatory: {
            refTime: weights.perClass?.normal?.baseExtrinsic?.refTime.toString() || '98,974,000',
            proofSize: weights.perClass?.normal?.baseExtrinsic?.proofSize.toString() || '0',
          }
        });

      } catch (error: any) {
        console.log(error);
        setError(error.message);
      }
    };

    getData();
  }, [network, astarApiReady, shidenApiReady, shibuyaApiReady]);


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
              height: 150,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('fast') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Normal
            </Typography>
            <Typography variant="h5" align="center">
              refTime: {weight?.normal.refTime}
            </Typography>
            <Typography variant="h5" align="center">
              proofSize: {weight?.normal.proofSize}
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
              height: 150,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('average') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Operational
            </Typography>
            <Typography variant="h5" align="center">
              refTime: {weight?.operational.refTime}
            </Typography>
            <Typography variant="h5" align="center">
              proofSize: {weight?.operational.proofSize}
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
              height: 150,
              cursor: 'pointer'
            }}
            onClick={() => { copyToClipboard('average') }}
          >
            <Typography variant="h4" color="text.secondary" align="center">
              Mandatory
            </Typography>
            <Typography variant="h5" align="center">
              refTime: {weight?.mandatory.refTime}
            </Typography>
            <Typography variant="h5" align="center">
              proofSize: {weight?.mandatory.proofSize}
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      {/* Last Gas */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <WeightList network={network} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Weight;
