import Sidebar from './Sidebar';
import Header from './Header';
import InventoryTable from './InventoryTable';
import FAB from './FAB';

const InventoryDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 test-bg">
      <Sidebar />
      <main className="ml-64 min-h-screen bg-white">
        <Header />
        <InventoryTable />
      </main>
      <FAB />
    </div>
  );
};

export default InventoryDashboard;