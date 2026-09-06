import styles from '../../styles/dashboard/BentoFilterBar.module.scss';

const DEFAULT_FILTERS = [
  {
    id: 'category',
    label: 'Category',
    options: [
      ['all', 'All Categories'],
      ['protein', 'Protein & Meats'],
      ['produce', 'Produce & Veg'],
      ['dry-goods', 'Dry Goods'],
      ['dairy', 'Dairy & Eggs'],
      ['wine', 'Wine & Spirits'],
    ],
  },
  {
    id: 'stock',
    label: 'Stock Status',
    options: [
      ['all', 'All Statuses'],
      ['in-stock', 'In Stock'],
      ['low-stock', 'Low Stock'],
      ['out-of-stock', 'Out of Stock'],
    ],
  },
  {
    id: 'zone',
    label: 'Shelf Zone',
    options: [
      ['all', 'All Zones'],
      ['cooler', 'Walk-in Cooler'],
      ['dry-storage', 'Dry Storage'],
      ['freezer', 'Freezer A'],
    ],
  },
];

const BentoFilterBar = ({
  filters = DEFAULT_FILTERS,
  values = {},
  alertCount = 0,
  onFilterChange,
  onAlertClick,
}) => {
  return (
    <div className={styles.filterGrid}>
      <div className={styles.filters}>
        {filters.map((filter) => (
          <div className={styles.field} key={filter.id}>
            <label htmlFor={`bento-filter-${filter.id}`}>{filter.label}</label>
            <select
              id={`bento-filter-${filter.id}`}
              value={values[filter.id] ?? filter.options[0]?.[0] ?? ''}
              onChange={(event) => onFilterChange?.(filter.id, event.target.value)}
            >
              {filter.options.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className={styles.alerts}>
        <div>
          <p className={styles.eyebrow}>Active Alerts</p>
          <h4 className={styles.alertCount}>{alertCount} Items Low</h4>
        </div>
        <button
          className={styles.alertButton}
          type="button"
          aria-label="View low stock alerts"
          onClick={onAlertClick}
        >
          <span className="material-symbols-outlined" data-icon="priority_high">priority_high</span>
        </button>
      </div>
    </div>
  );
};

export default BentoFilterBar;