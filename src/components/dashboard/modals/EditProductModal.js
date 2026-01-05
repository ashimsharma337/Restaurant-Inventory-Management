import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPDATE_PRODUCT, GET_PRODUCTS } from '@/graphql/client/queries';

export default function EditProductModal({ open, onClose, product }) {
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    categoryName: '',
    quantity: '',
    unit: '',
    price: '',
    status: '',
  });

  const [updateProduct, { loading }] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: onClose,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        categoryId: product.category?.id??'',
        categoryName: product.category?.name??'',
        quantity: product.quantity,
        unit: product.unit,
        price: product.price,
        status: product.status,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!product) return;

    await updateProduct({
      variables: {
        id: product.id,
        input: {
          name: form.name,
          categoryId: form.categoryId,
          quantity: Number(form.quantity),
          unit: form.unit,
          price: Number(form.price),
          status: form.status,
        },
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Product</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Category"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !product}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
