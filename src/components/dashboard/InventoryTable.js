import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import useInventory from '../../hooks/useInventory';
import BentoFilterBar from './BentoFilterBar';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import { DELETE_PRODUCT, GET_PRODUCTS } from '@/graphql/client/queries';
import styles from '../../styles/dashboard/InventoryTable.module.scss';

const InventoryTable = () => {
  const { products, loading, error } = useInventory();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    awaitRefetchQueries: true,
  });

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;

    try {
      await deleteProduct({ variables: { id: product.id } });
    } catch (deleteError) {
      console.error('Delete failed', deleteError);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section className={styles.inventory}>
      {/* Header Section */}
      <div className={styles.header}>
        <div>
          <nav className={styles.breadcrumb}>
            <span>Management</span>
            <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
            <span className={styles.breadcrumbCurrent}>Stock Inventory</span>
          </nav>
          <h2 className={styles.title}>Inventory List</h2>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton}>
            <span className="material-symbols-outlined" data-icon="file_download">file_download</span>
            Export CSV
          </button>
          <button className={styles.primaryButton} type="button" onClick={() => setIsAddOpen(true)}>
            <span className="material-symbols-outlined" data-icon="add">add</span>
            New Item
          </button>
        </div>
      </div>
      <BentoFilterBar alertCount={products.filter((product) => product.quantity < 10).length} />
      {/* Modern Table View */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
        <table className={styles.tableRoot}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Price</th>
              <th>Status</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productIcon}>
                      <span className="material-symbols-outlined" data-icon="restaurant">restaurant</span>
                    </div>
                    <div>
                      <p className={styles.productName}>{product.name}</p>
                      {/* <p className={styles.productId}>ID: {product.id}</p> */}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.category}>{product.category?.name || 'N/A'}</span>
                </td>
                <td>
                  <div className={styles.stockCell}>
                    <div className={styles.stockMeta}>
                      <span>{product.quantity} {product.unit}</span>
                      <span className={product.quantity === 0 ? styles.out : product.quantity < 10 ? styles.low : styles.good}>
                        {product.quantity === 0 ? 'Out' : product.quantity < 10 ? 'Low' : 'Good'}
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={product.quantity === 0 ? styles.progressOut : product.quantity < 10 ? styles.progressLow : styles.progressGood}></div>
                    </div>
                  </div>
                </td>
                <td className={styles.price}>${product.price}</td>
                <td className={styles.status}>{product.status}</td>
                <td className={styles.rowActions}>
                  <button type="button" aria-label={`Edit ${product.name}`} onClick={() => handleEdit(product)}>
                    <span className="material-symbols-outlined" data-icon="edit_square">edit_square</span>
                  </button>
                  <button type="button" aria-label={`Delete ${product.name}`} onClick={() => handleDelete(product)}>
                    <span className="material-symbols-outlined" data-icon="delete">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/* Pagination / Footer */}
        <div className={styles.pagination}>
          <p>Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> items</p>
          <div className={styles.pageButtons}>
            <button aria-label="Previous page" disabled>
              <span className="material-symbols-outlined text-lg" data-icon="chevron_left">chevron_left</span>
            </button>
            <button className={styles.currentPage} aria-current="page">1</button>
            <button aria-label="Next page">
              <span className="material-symbols-outlined text-lg" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <AddProductModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditProductModal
        key={selectedProduct?.id ?? 'empty'}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </section>
  );
};

export default InventoryTable;