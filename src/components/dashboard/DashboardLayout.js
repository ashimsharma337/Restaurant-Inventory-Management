import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div
        className="dashboard-main"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <Topbar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
