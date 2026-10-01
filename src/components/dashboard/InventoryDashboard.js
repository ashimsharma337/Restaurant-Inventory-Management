import Sidebar from "../sidebar/Sidebar";
import Header from "./Header";
import DashboardOverview from "./DashboardOverview";
import FAB from "./FAB";

const InventoryDashboard = () => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <DashboardOverview />
      </main>
      <FAB />
    </div>
  );
};

export default InventoryDashboard;
