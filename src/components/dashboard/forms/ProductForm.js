import { useState } from 'react';
import { TextField, Button, Stack, MenuItem, ListSubheader } from '@mui/material';
import { UNIT_GROUPS } from '@/utility/units';

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
        <TextField label="Product Name" name="name" required value={form.name} onChange={handleChange} />
        <TextField label="Category" name="category" required value={form.category} onChange={handleChange} />
        <TextField label="Quantity" name="quantity" type="number" required value={form.quantity} onChange={handleChange} />
        <TextField 
          select label="Unit" 
          name="unit" 
          required 
          value={form.unit} 
          onChange={handleChange}
        >
          {UNIT_GROUPS.map(group => [
              <ListSubheader key={group.label}>
                {group.label}
              </ListSubheader>,
              group.options.map(unit => (
                <MenuItem key={unit.value} value={unit.value}>
                  {unit.label}
                </MenuItem>
              )),
          ])}
        </TextField>
        <TextField label="Price" name="price" type="number" required value={form.price} onChange={handleChange} />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Add Product'}
        </Button>
      </Stack>
    </form>
  );
};

export default ProductForm;
