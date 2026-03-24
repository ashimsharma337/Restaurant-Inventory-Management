import useInventory from '../../hooks/useInventory';

const InventoryTable = () => {
  const { products, loading, error } = useInventory();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-12">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <nav className="text-[10px] uppercase tracking-widest text-outline font-bold mb-2 flex items-center gap-2">
            <span>Management</span>
            <span className="material-symbols-outlined text-[12px]" data-icon="chevron_right">chevron_right</span>
            <span className="text-primary">Stock Inventory</span>
          </nav>
          <h2 className="editorial-header text-4xl font-extrabold text-on-surface tracking-tight">Inventory List</h2>
        </div>
        <div className="flex gap-3">
          <button className="bg-secondary-container text-on-secondary-fixed-variant px-5 py-2.5 rounded-md font-inter text-sm font-semibold hover:scale-[1.02] transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" data-icon="file_download">file_download</span>
            Export CSV
          </button>
          <button className="bg-gradient-to-r from-primary to-primary-container text-white px-5 py-2.5 rounded-md font-inter text-sm font-semibold hover:scale-[1.02] transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
            New Item
          </button>
        </div>
      </div>
      {/* Bento Filter Bar */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        <div className="col-span-8 bg-surface-container-lowest p-6 rounded-xl flex items-center gap-8">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] uppercase tracking-wider text-outline font-bold">Category</label>
            <select className="bg-surface-container-high border-none rounded-md text-sm py-2 px-3 focus:ring-0">
              <option>All Categories</option>
              <option>Protein &amp; Meats</option>
              <option>Produce &amp; Veg</option>
              <option>Dry Goods</option>
              <option>Dairy &amp; Eggs</option>
              <option>Wine &amp; Spirits</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] uppercase tracking-wider text-outline font-bold">Stock Status</label>
            <select className="bg-surface-container-high border-none rounded-md text-sm py-2 px-3 focus:ring-0">
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] uppercase tracking-wider text-outline font-bold">Shelf Zone</label>
            <select className="bg-surface-container-high border-none rounded-md text-sm py-2 px-3 focus:ring-0">
              <option>All Zones</option>
              <option>Walk-in Cooler</option>
              <option>Dry Storage</option>
              <option>Freezer A</option>
            </select>
          </div>
        </div>
        <div className="col-span-4 bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Active Alerts</p>
            <h4 className="editorial-header text-2xl font-bold text-tertiary">{products.filter(p => p.quantity < 10).length} Items Low</h4>
          </div>
          <button className="bg-tertiary-fixed text-on-tertiary-fixed-variant p-2 rounded-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined" data-icon="priority_high">priority_high</span>
          </button>
        </div>
      </div>
      {/* Modern Table View */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant/10">
            <tr>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Item Name</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Category</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Stock Level</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Price</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Status</th>
              <th className="px-8 py-5 text-right text-[10px] uppercase tracking-[0.05rem] text-outline font-bold font-label">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {products.map((product) => (
              <tr key={product.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined" data-icon="restaurant">restaurant</span>
                    </div>
                    <div>
                      <p className="font-inter font-medium text-on-surface text-sm">{product.name}</p>
                      <p className="text-[10px] text-outline font-medium tracking-tight">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-bold px-2 py-1 rounded">{product.category?.name || 'N/A'}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-medium text-on-surface">
                      <span>{product.quantity} {product.unit}</span>
                      <span className={`font-bold ${product.quantity < 10 ? 'text-tertiary-container' : product.quantity === 0 ? 'text-error' : 'text-primary-container'}`}>
                        {product.quantity === 0 ? 'Out' : product.quantity < 10 ? 'Low' : 'Good'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${product.quantity === 0 ? 'bg-error w-0' : product.quantity < 10 ? 'bg-tertiary-container w-[25%]' : 'bg-primary-container w-[85%]'}`}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface">${product.price}</td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface">{product.status}</td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-outline hover:text-primary transition-colors active:scale-90">
                    <span className="material-symbols-outlined" data-icon="edit_square">edit_square</span>
                  </button>
                  <button className="p-2 text-outline hover:text-primary transition-colors active:scale-90">
                    <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination / Footer */}
        <div className="px-8 py-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/5">
          <p className="text-sm font-medium text-outline">Showing <span className="text-on-surface font-bold">1-{products.length}</span> of <span className="text-on-surface font-bold">{products.length}</span> items</p>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-lg border border-outline-variant/20 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-lg" data-icon="chevron_left">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">1</button>
            <button className="w-10 h-10 rounded-lg border border-outline-variant/20 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-lg" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;