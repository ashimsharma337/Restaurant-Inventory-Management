const Sidebar = () => {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-950 flex flex-col py-8 px-4 space-y-2 z-50">
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
          </div>
          <div>
            <h1 className="font-manrope font-bold text-teal-900 dark:text-teal-50 text-base leading-tight">The Grand Bistro</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Kitchen Central</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-teal-700 hover:translate-x-1 transition-transform duration-200 font-inter text-sm font-medium tracking-wide" href="#">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </a>
        <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-teal-900/20 text-teal-900 dark:text-teal-50 shadow-sm rounded-md font-inter text-sm font-medium tracking-wide" href="#">
          <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
          Inventory
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-teal-700 hover:translate-x-1 transition-transform duration-200 font-inter text-sm font-medium tracking-wide" href="#">
          <span className="material-symbols-outlined" data-icon="input">input</span>
          Stock In
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-teal-700 hover:translate-x-1 transition-transform duration-200 font-inter text-sm font-medium tracking-wide" href="#">
          <span className="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
          Suppliers
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-teal-700 hover:translate-x-1 transition-transform duration-200 font-inter text-sm font-medium tracking-wide" href="#">
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          Reports
        </a>
      </nav>
      <div className="mt-auto space-y-1">
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-md mb-6 active:opacity-80 transition-all font-inter text-sm font-semibold">
          <span className="material-symbols-outlined text-sm" data-icon="qr_code_scanner">qr_code_scanner</span>
          Scan SKU
        </button>
        <a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-teal-700 font-inter text-sm font-medium" href="#">
          <span className="material-symbols-outlined" data-icon="help">help</span>
          Help
        </a>
        <a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-teal-700 font-inter text-sm font-medium" href="#">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Logout
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;