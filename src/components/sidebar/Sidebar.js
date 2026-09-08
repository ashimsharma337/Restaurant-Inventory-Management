import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/navbar/Sidebar.module.scss';

const Sidebar = () => {
  const router = useRouter();
  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Inventory', path: '/dashboard/products', icon: 'inventory_2' },
    { label: 'Stock In', path: '/dashboard/stock-in', icon: 'input' },
    { label: 'Suppliers', path: '/dashboard/suppliers', icon: 'local_shipping' },
    { label: 'Reports', path: '/dashboard/reports', icon: 'analytics' },
  ];

  const isActive = (path) => router.pathname === path;

  const showScannerNotice = () => {
    window.alert('SKU scanning needs to be implemented. This action is reserved for the barcode scanner workflow.');
  };

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
        {navigationItems.map(({ label, path, icon }) => (
          <Link
            className={`${styles.navItem} ${isActive(path) ? styles.active : ''}`}
            href={path}
            key={path}
            aria-current={isActive(path) ? 'page' : undefined}
            aria-label={label}
            title={label}
          >
            <span className="material-symbols-outlined" data-icon={icon}>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.scanButton} type="button" aria-label="Scan SKU" title="Scan SKU" onClick={showScannerNotice}>
          <span className="material-symbols-outlined" data-icon="qr_code_scanner">qr_code_scanner</span>
          <span>Scan</span>
        </button>
        <Link className={styles.utilityItem} href="/help" aria-label="Help" title="Help">
          <span className="material-symbols-outlined" data-icon="help">help</span>
          <span>Help</span>
        </Link>
        <a className={styles.utilityItem} href="#" aria-label="Logout" title="Logout">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;