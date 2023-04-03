import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import EvStationIcon from '@mui/icons-material/EvStation';
import ScaleIcon from '@mui/icons-material/Scale';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

import Gas from './Gas';
import Weight from './Weight';
import Tip from './Tip';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://astar.network/">
        Astar
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme();

function Home() {
  const [page, setPage] = React.useState('gas');
  const [open, setOpen] = React.useState(true);
  const [network, setNetwork] = React.useState('astar');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const logo = '/astar_logo.png';

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Gas Station
            </Typography>
            <Tooltip title="Select Network">
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'network-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <img src={`/${network}.png`} alt="dropdown" style={{ width: '32px', height: '32px' }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open} sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: [1],
            }}
          >
            <img src={logo} alt="logo" height="50px" />
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton onClick={() => { setPage('gas') }}>
              <ListItemIcon>
                <EvStationIcon />
              </ListItemIcon>
              <ListItemText primary="Gas" />
            </ListItemButton>
            <ListItemButton onClick={() => { setPage('tip') }}>
              <ListItemIcon>
                <CurrencyExchangeIcon />
              </ListItemIcon>
              <ListItemText primary="Tip" />
            </ListItemButton>
            <ListItemButton onClick={() => { setPage('weight') }}>
              <ListItemIcon>
                <ScaleIcon />
              </ListItemIcon>
              <ListItemText primary="Weights" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListSubheader component="div" inset>
              Docs
            </ListSubheader>
            <Link href='https://docs.astar.network/docs/integrations/api/gas_api/'>
              <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Gas" />
              </ListItemButton>
            </Link>
            <Link href='https://polkadot.js.org/docs/api/cookbook/tx'>
              <ListItemButton>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Tip" />
              </ListItemButton>
            </Link>
            <Link href='https://docs.astar.network/docs/build/wasm/interact/astarjs#weights-v2'>
              <ListItemButton>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Weights" />
              </ListItemButton>
            </Link>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            { page === 'weight' ? <Weight network={network} /> : page === 'tip' ? <Tip network={network} /> : <Gas network={network} /> }
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="network-menu"
        open={menuOpen}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleClose();
          setNetwork('astar');
        }}>
          <img src={`/astar.png`} alt="dropdown" style={{ width: '32px', height: '32px', marginRight: '5px' }} /> Astar
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          setNetwork('shiden');
        }}>
          <img src={`/shiden.png`} alt="dropdown" style={{ width: '32px', height: '32px', marginRight: '5px' }} /> Shiden
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          setNetwork('shibuya');
        }}>
          <img src={`/shibuya.png`} alt="dropdown" style={{ width: '32px', height: '32px', marginRight: '5px' }} /> Shibuya
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
}

export default Home;
