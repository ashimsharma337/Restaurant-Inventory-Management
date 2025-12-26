import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Topbar = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        color: '#000000',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div">
          Restaurant Inventory Management
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2">
          General Manager
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
