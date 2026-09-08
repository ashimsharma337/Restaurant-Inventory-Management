import Sidebar from '../sidebar/Sidebar';
import Header from './Header';
import InventoryTable from './InventoryTable';
import FAB from './FAB';

const InventoryDashboard = () => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <InventoryTable />
      </main>
      <FAB />
    </div>
  );
};

export default InventoryDashboard;