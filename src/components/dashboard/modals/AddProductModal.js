import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import ProductForm from '../forms/ProductForm';
import { CREATE_PRODUCT } from '@/graphql/client/queries';
import { GET_PRODUCTS } from '@/graphql/client/queries';

const AddProductModal = ({ open, onClose }) => {
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => onClose(),
  });

  const handleSubmit = async input => {
    await createProduct({ variables: { input } });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <ProductForm onSubmit={handleSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
