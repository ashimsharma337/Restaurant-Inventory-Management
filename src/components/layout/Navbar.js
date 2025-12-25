import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Restaurant Inventory
        </Typography>

        <Box>
          <Button color="inherit">Login</Button>
          <Button color="inherit">Get Started</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
