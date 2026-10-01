import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/dashboard/Header";
import InventoryTable from "@/components/dashboard/InventoryTable";

export default function Products() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
         <InventoryTable />
      </main>
    </div>
  );
}
