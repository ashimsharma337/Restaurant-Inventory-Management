import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/dashboard/Header";
import UsageReport from "@/components/dashboard/UsageReport";

export default function Reports() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <UsageReport />
      </main>
    </div>
  );
}
