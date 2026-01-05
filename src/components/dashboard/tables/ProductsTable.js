import dynamic from "next/dynamic";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PRODUCTS, DELETE_PRODUCT } from "@/graphql/client/queries";
import styles from "@/styles/dashboard/ProductsTable.module.scss";
import { IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useState } from "react";
import EditProductModal from "../modals/EditProductModal";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false }
);

export default function ProductsTable() {
  const columns = [
    // { field: 'id', headerName: 'ID', width: 90 },
    { field: "name", headerName: "Product Name", flex: 1 },

    {
      field: "category",
      headerName: "Category",
      width: 160,
      renderCell: (params) => {
        const cat = params.row?.category;
        if (!cat) return "—";
        return typeof cat === "string" ? cat : cat.name ?? "—";
      },
    },
    { field: "quantity", headerName: "Quantity", type: "number", width: 120 },
    { field: "unit", headerName: "Unit", width: 120 },
    { field: "price", headerName: "Price ($)", type: "number", width: 120 },
    { field: "status", headerName: "Status", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => onEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => onDelete(params.row.id)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const onEdit = (product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
  };

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    awaitRefetchQueries: true,
  });

  const onDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct({
        variables: { id },
      });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products</p>;

  return (
    <div className={styles.tableWrapper}>
      <DataGrid
        rows={data.products}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
      <EditProductModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        product={selectedProduct}
      />
    </div>
  );
}
