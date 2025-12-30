import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductsTable from '@/components/dashboard/tables/ProductsTable';

const ProductsPage = () => {
  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '16px' }}>Products</h1>
      <ProductsTable />
    </DashboardLayout>
  );
};

export default ProductsPage;
