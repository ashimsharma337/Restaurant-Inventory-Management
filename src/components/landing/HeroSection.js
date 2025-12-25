import { Box, Typography, Button, Stack } from "@mui/material";

export default function HeroSection() {
  return (
    <Box sx={{ py: 10 }}>
      <Typography variant="h3" gutterBottom>
        Smart Inventory Management <br />
        for Modern Restaurants
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
        Track stock, manage vendors, reduce waste, and make data-driven
        decisions — all in one platform.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" size="large">
          Get Started
        </Button>
        <Button variant="outlined" size="large">
          View Demo
        </Button>
      </Stack>
    </Box>
  );
}
