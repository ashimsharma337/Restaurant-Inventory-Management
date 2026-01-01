import dynamic from 'next/dynamic';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS } from '@/graphql/client/queries';
import styles from '@/styles/dashboard/ProductsTable.module.scss';

const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then(mod => mod.DataGrid),
  { ssr: false }
);

const columns = [
  // { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Product Name', flex: 1 },
  { field: 'category', headerName: 'Category', width: 160 },
  { field: 'quantity', headerName: 'Quantity', type: 'number', width: 120 },
  { field: 'unit', headerName: 'Unit', width: 120 },
  { field: 'price', headerName: 'Price ($)', type: 'number', width: 120 },
  { field: 'status', headerName: 'Status', width: 140 },
];


export default function ProductsTable() {
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) return <p>Loading products...</p>
  if (error) return <p>Error loading products</p>

  return (
    <div className={styles.tableWrapper}>
      <DataGrid
        rows={data.products}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
}
