import { useEffect, useState } from "react";
import Link from "next/link";
import useInventory from "@/hooks/useInventory";
import styles from "@/styles/dashboard/DashboardOverview.module.scss";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);

const formatQuantity = (quantity) =>
  Number(quantity).toLocaleString(undefined, { maximumFractionDigits: 3 });

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const categoryIcon = (name) => {
  const category = name.toLowerCase();
  if (/vegetable|produce|herb|fruit/.test(category)) return "eco";
  if (/meat|seafood|protein/.test(category)) return "set_meal";
  if (/drink|beverage|wine|bar/.test(category)) return "local_bar";
  if (/clean|chemical/.test(category)) return "cleaning_services";
  if (/dairy|frozen|cold/.test(category)) return "ac_unit";
  return "kitchen";
};

const downloadInventoryCsv = (products) => {
  const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Item", "Category", "Quantity", "Unit", "Unit price", "Status"],
    ...products.map((product) => [
      product.name,
      product.category?.name ?? "Uncategorized",
      product.quantity,
      product.unit,
      product.price,
      product.status,
    ]),
  ];
  const content = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "inventory-report.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function DashboardOverview() {
  const { products, loading, error } = useInventory();
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadDocuments = async () => {
      try {
        const response = await fetch("/api/documents", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load delivery documents");
        const data = await response.json();
        setDocuments(data.documents ?? []);
      } catch (loadError) {
        if (loadError.name !== "AbortError") setDocuments([]);
      } finally {
        if (!controller.signal.aborted) setDocumentsLoading(false);
      }
    };

    loadDocuments();
    return () => controller.abort();
  }, []);

  const lowStockProducts = products
    .filter((product) => Number(product.quantity) < 10)
    .sort((first, second) => Number(first.quantity) - Number(second.quantity));
  const totalValuation = products.reduce(
    (total, product) => total + Number(product.quantity) * Number(product.price),
    0,
  );
  const categoryTotals = products.reduce((totals, product) => {
    const name = product.category?.name ?? "Uncategorized";
    if (!totals[name]) totals[name] = { count: 0, low: 0 };
    totals[name].count += 1;
    if (Number(product.quantity) < 10) totals[name].low += 1;
    return totals;
  }, {});
  const categories = Object.entries(categoryTotals).sort((first, second) =>
    first[0].localeCompare(second[0]),
  );
  const recentDocuments = documents.slice(0, 3);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  if (loading) {
    return <div className={styles.state} role="status">Loading inventory overview...</div>;
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        Inventory could not be loaded: {error.message}
      </div>
    );
  }

  return (
    <div className={styles.overview}>
      <section className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>Operations / Overview</p>
          <h1>Inventory health</h1>
          <p className={styles.subtitle}>Live stock position · {today}</p>
        </div>
        <div className={styles.headingActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => downloadInventoryCsv(products)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">file_download</span>
            Download report
          </button>
          <Link className={styles.primaryButton} href="/dashboard/products">
            <span className="material-symbols-outlined" aria-hidden="true">inventory_2</span>
            Manage inventory
          </Link>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Inventory summary">
        <article className={styles.valuationMetric}>
          <div className={styles.metricTopline}>
            <span className={styles.metricLabel}>Total valuation</span>
            <span className={styles.metricIcon} aria-hidden="true">$</span>
          </div>
          <strong>{formatMoney(totalValuation)}</strong>
          <p>Across {products.length} inventory {products.length === 1 ? "item" : "items"}</p>
        </article>
        <article className={styles.alertMetric}>
          <div className={styles.metricTopline}>
            <span className={styles.metricLabel}>Low stock alerts</span>
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
          </div>
          <div className={styles.alertCount}>
            <strong>{lowStockProducts.length}</strong>
            <span>items below 10 units</span>
          </div>
        </article>
        <article className={styles.wasteMetric}>
          <div className={styles.metricTopline}>
            <span className={styles.metricLabel}>Monthly waste</span>
            <span className="material-symbols-outlined" aria-hidden="true">monitoring</span>
          </div>
          <strong>Not tracked</strong>
          <p>Waste data is not available yet</p>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <section className={styles.alertsPanel} aria-labelledby="alerts-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Needs attention</p>
              <h2 id="alerts-title">Critical low-stock alerts</h2>
            </div>
            <Link href="/dashboard/products" className={styles.textLink}>View inventory</Link>
          </div>
          {lowStockProducts.length ? (
            <ul className={styles.alertList}>
              {lowStockProducts.slice(0, 5).map((product) => (
                <li className={styles.alertItem} key={product.id}>
                  <span className={styles.alertIcon} aria-hidden="true">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </span>
                  <span className={styles.alertDetails}>
                    <strong>{product.name}</strong>
                    <small>{product.category?.name ?? "Uncategorized"}</small>
                  </span>
                  <span className={styles.alertQuantity}>
                    <strong>{formatQuantity(product.quantity)} {product.unit}</strong>
                    <small>{Number(product.quantity) === 0 ? "Out of stock" : "Below 10 units"}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>All items are above the low-stock threshold.</p>
          )}
        </section>

        <section className={styles.activityPanel} aria-labelledby="activity-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Receiving</p>
              <h2 id="activity-title">Recent delivery documents</h2>
            </div>
            <Link href="/dashboard/stock-in" className={styles.textLink}>All documents</Link>
          </div>
          {documentsLoading ? (
            <p className={styles.emptyState} role="status">Loading recent documents...</p>
          ) : recentDocuments.length ? (
            <ul className={styles.documentList}>
              {recentDocuments.map((document) => (
                <li className={styles.documentItem} key={document.id}>
                  <span className={styles.timelineMark} aria-hidden="true">
                    <span className="material-symbols-outlined">description</span>
                  </span>
                  <span className={styles.documentDetails}>
                    <strong>{document.stock_in_reference}</strong>
                    <small>{document.original_name}</small>
                    <time dateTime={document.created_at}>{formatDate(document.created_at)}</time>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No delivery documents have been uploaded yet.</p>
          )}
          <Link className={styles.historyLink} href="/dashboard/stock-in">
            Open stock-in documents
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </Link>
        </section>
      </section>

      <section className={styles.zonesSection} aria-labelledby="zones-title">
        <div className={styles.zoneHeading}>
          <div>
            <p className={styles.eyebrow}>Browse by category</p>
            <h2 id="zones-title">Inventory zones</h2>
          </div>
          <Link href="/dashboard/products" className={styles.textLink}>Manage categories</Link>
        </div>
        {categories.length ? (
          <div className={styles.zoneGrid}>
            {categories.map(([name, totals]) => (
              <Link className={styles.zoneItem} href="/dashboard/products" key={name}>
                <span className={styles.zoneIcon} aria-hidden="true">
                  <span className="material-symbols-outlined">{categoryIcon(name)}</span>
                </span>
                <span className={styles.zoneName}>{name}</span>
                <span className="material-symbols-outlined" aria-hidden="true">arrow_outward</span>
                <span className={styles.zoneMeta}>
                  {totals.count} {totals.count === 1 ? "item" : "items"}
                  {totals.low > 0 ? ` · ${totals.low} low` : " · Stock steady"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Categories will appear here as inventory is added.</p>
        )}
      </section>
    </div>
  );
}