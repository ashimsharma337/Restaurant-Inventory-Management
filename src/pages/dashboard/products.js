import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/dashboard/Header';
import ProductsTable from '@/components/dashboard/tables/ProductsTable';

export default function Products() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <ProductsTable />
      </main>
    </div>
  );
}
