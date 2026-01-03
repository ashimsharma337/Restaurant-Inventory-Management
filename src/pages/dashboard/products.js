import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductsTable from '@/components/dashboard/tables/ProductsTable';
import AddProductModal from '@/components/dashboard/modals/AddProductModal';

const ProductsPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <h1>Products</h1>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Product
        </Button>
      </Stack>

      <ProductsTable />

      <AddProductModal open={open} onClose={() => setOpen(false)} />
    </DashboardLayout>
  );
};

export default ProductsPage;
