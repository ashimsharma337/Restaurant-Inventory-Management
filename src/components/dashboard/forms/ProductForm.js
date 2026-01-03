import { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';

const ProductForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
  });

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField label="Product Name" name="name" required onChange={handleChange} />
        <TextField label="Category" name="category" required onChange={handleChange} />
        <TextField label="Quantity" name="quantity" type="number" required onChange={handleChange} />
        <TextField label="Unit" name="unit" required onChange={handleChange} />
        <TextField label="Price" name="price" type="number" required onChange={handleChange} />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Add Product'}
        </Button>
      </Stack>
    </form>
  );
};

export default ProductForm;
