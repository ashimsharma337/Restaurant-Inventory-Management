import styles from '../../styles/sidebar/Sidebar.module.scss';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <span className="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
          </div>
          <div>
            <h1 className={styles.brandName}>The Grand Bistro</h1>
            <p className={styles.brandCaption}>Kitchen Central</p>
          </div>
        </div>
      </div>
      <nav className={styles.navigation} aria-label="Main navigation">
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a className={`${styles.navItem} ${styles.active}`} href="#" aria-current="page">
          <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
          <span>Inventory</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined" data-icon="input">input</span>
          <span>Stock In</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
          <span>Suppliers</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          <span>Reports</span>
        </a>
      </nav>
      <div className={styles.footer}>
        <button className={styles.scanButton}>
          <span className="material-symbols-outlined" data-icon="qr_code_scanner">qr_code_scanner</span>
          <span>Scan SKU</span>
        </button>
        <a className={styles.utilityItem} href="#">
          <span className="material-symbols-outlined" data-icon="help">help</span>
          <span>Help</span>
        </a>
        <a className={styles.utilityItem} href="#">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;