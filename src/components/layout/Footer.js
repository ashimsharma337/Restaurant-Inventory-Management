import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Restaurant Inventory Management
      </Typography>
    </Box>
  );
}
