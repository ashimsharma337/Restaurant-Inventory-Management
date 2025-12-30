import dynamic from 'next/dynamic';

const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then(mod => mod.DataGrid),
  { ssr: false }
);

import styles from '@/styles/dashboard/ProductsTable.module.scss';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Product Name', flex: 1 },
  { field: 'category', headerName: 'Category', width: 160 },
  { field: 'quantity', headerName: 'Quantity', type: 'number', width: 120 },
  { field: 'unit', headerName: 'Unit', width: 120 },
  { field: 'price', headerName: 'Price ($)', type: 'number', width: 120 },
  { field: 'status', headerName: 'Status', width: 140 },
];

const rows = [
  { id: 1, name: 'Tomatoes', category: 'Vegetables', quantity: 50, unit: 'kg', price: 2.5, status: 'In Stock' },
  { id: 2, name: 'Olive Oil', category: 'Grocery', quantity: 10, unit: 'liters', price: 12, status: 'Low Stock' },
];

export default function ProductsTable() {
  return (
    <div className={styles.tableWrapper}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
}
