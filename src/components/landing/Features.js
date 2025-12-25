import { Grid, Box, Typography, Container } from '@mui/material';

const features = [
  { title: 'Real-Time Tracking', desc: 'Monitor inventory instantly' },
  { title: 'Analytics', desc: 'Make data-driven decisions' },
  { title: 'Multi-Location', desc: 'Manage all branches in one place' },
];

export default function Features() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Typography variant="h6">{f.title}</Typography>
              <Typography color="text.secondary">{f.desc}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
