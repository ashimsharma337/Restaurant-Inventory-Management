import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  GET_PRODUCTS,
  GET_USAGE_REPORT,
  RECORD_USAGE,
} from "@/graphql/client/queries";
import styles from "@/styles/dashboard/UsageReport.module.scss";

const dateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateBounds = (range, customStart, customEnd) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let end = new Date(start);

  if (range === "today") {
    end.setDate(end.getDate() + 1);
  } else if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  } else if (range === "this_week" || range === "last_week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    if (range === "last_week") start.setDate(start.getDate() - 7);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else if (range === "this_month" || range === "last_month") {
    start.setDate(1);
    if (range === "last_month") start.setMonth(start.getMonth() - 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  } else {
    const customStartDate = new Date(`${customStart}T00:00:00`);
    const customEndDate = new Date(`${customEnd}T00:00:00`);
    return {
      startDate: customStartDate.toISOString(),
      endDate: new Date(customEndDate.setDate(customEndDate.getDate() + 1)).toISOString(),
    };
  }

  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

const formatQuantity = (value) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 });

const downloadCsv = (rows) => {
  const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const content = [
    ["Item Name", "Category", "Quantity Used", "Unit"],
    ...rows.map((item) => [item.name, item.category, item.quantityUsed, item.unit]),
  ]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "usage-report.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function UsageReport() {
  const [dateRange, setDateRange] = useState("this_week");
  const [customStart, setCustomStart] = useState(dateInputValue(new Date()));
  const [customEnd, setCustomEnd] = useState(dateInputValue(new Date()));
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [usageError, setUsageError] = useState("");
  const dateBounds = useMemo(
    () => getDateBounds(dateRange, customStart, customEnd),
    [dateRange, customEnd, customStart],
  );
  const reportVariables = dateBounds;
  const { data, loading, error } = useQuery(GET_USAGE_REPORT, {
    variables: reportVariables,
  });
  const { data: productData } = useQuery(GET_PRODUCTS);
  const [recordUsage, { loading: savingUsage }] = useMutation(RECORD_USAGE, {
    refetchQueries: [
      { query: GET_PRODUCTS },
      { query: GET_USAGE_REPORT, variables: reportVariables },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setIsUsageModalOpen(false);
      setSelectedProductId("");
      setQuantityUsed("");
      setUsageError("");
    },
    onError: (mutationError) => setUsageError(mutationError.message),
  });

  const usageRows = data?.usageReport ?? [];
  const categories = [...new Set(usageRows.map((row) => row.category))].sort();
  const filteredRows = usageRows.filter((row) => {
    const matchesCategory = category === "All" || row.category === category;
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const unitTotals = usageRows.reduce((totals, row) => {
    totals[row.unit] = (totals[row.unit] ?? 0) + Number(row.quantityUsed);
    return totals;
  }, {});
  const totalUsedItems = filteredRows.length;
  const totalCategories = new Set(filteredRows.map((row) => row.category)).size;
  const topUsedItem = filteredRows[0];
  const selectedProduct = productData?.products.find(
    (product) => product.id === selectedProductId,
  );

  const handleRecordUsage = async (event) => {
    event.preventDefault();
    setUsageError("");
    await recordUsage({
      variables: {
        input: { productId: selectedProductId, quantityUsed: Number(quantityUsed) },
      },
    });
  };

  const openUsageModal = () => {
    setUsageError("");
    setIsUsageModalOpen(true);
  };

  return (
    <section className={styles.report}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Inventory analytics</p>
          <h1>Usage report</h1>
          <p className={styles.subtitle}>Track ingredient consumption over time.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outlined" onClick={() => downloadCsv(filteredRows)} disabled={!filteredRows.length}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={openUsageModal}>
            Record usage
          </Button>
        </div>
      </header>

      <div className={styles.summary}>
        <article className={styles.summaryItem}>
          <span>Items used</span>
          <strong>{totalUsedItems}</strong>
          <small>Distinct products in this period</small>
        </article>
        <article className={styles.summaryItem}>
          <span>Categories</span>
          <strong>{totalCategories}</strong>
          <small>With recorded consumption</small>
        </article>
        <article className={styles.summaryItem}>
          <span>Top used item</span>
          <strong>{topUsedItem?.name ?? "—"}</strong>
          <small>
            {topUsedItem
              ? `${formatQuantity(topUsedItem.quantityUsed)} ${topUsedItem.unit}`
              : "No usage recorded"}
          </small>
        </article>
      </div>

      <div className={styles.filters}>
        <TextField
          select
          label="Period"
          size="small"
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="this_week">This week</MenuItem>
          <MenuItem value="last_week">Last week</MenuItem>
          <MenuItem value="this_month">This month</MenuItem>
          <MenuItem value="last_month">Last month</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </TextField>
        {dateRange === "custom" && (
          <>
            <TextField
              label="From"
              type="date"
              size="small"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}
        <TextField
          select
          label="Category"
          size="small"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <MenuItem value="All">All categories</MenuItem>
          {categories.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Search items"
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={styles.tableFrame}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Item name</th>
              <th>Category</th>
              <th>Quantity used</th>
              <th>Usage share</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className={styles.message}>Loading usage report…</td></tr>
            ) : error ? (
              <tr><td colSpan="4" className={styles.message}>Could not load usage report: {error.message}</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan="4" className={styles.message}>
                  No usage records found for this period.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const unitTotal = unitTotals[row.unit] || 0;
                const share = unitTotal ? (Number(row.quantityUsed) / unitTotal) * 100 : 0;
                return (
                  <tr key={row.productId}>
                    <td className={styles.itemName}>{row.name}</td>
                    <td>{row.category}</td>
                    <td className={styles.quantity}>{formatQuantity(row.quantityUsed)} {row.unit}</td>
                    <td>
                      <div className={styles.shareCell}>
                        <span className={styles.shareTrack}>
                          <span style={{ width: `${share}%` }} />
                        </span>
                        <span>{share.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isUsageModalOpen}
        onClose={() => !savingUsage && setIsUsageModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <form onSubmit={handleRecordUsage}>
          <DialogTitle>Record item usage</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            <TextField
              select
              label="Item"
              required
              fullWidth
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              {(productData?.products ?? []).map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} · {formatQuantity(product.quantity)} {product.unit} available
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={`Quantity used${selectedProduct ? ` (${selectedProduct.unit})` : ""}`}
              type="number"
              required
              fullWidth
              inputProps={{ min: 0.001, max: selectedProduct?.quantity, step: 0.001 }}
              value={quantityUsed}
              onChange={(event) => setQuantityUsed(event.target.value)}
            />
            {usageError && <p className={styles.formError}>{usageError}</p>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUsageModalOpen(false)} disabled={savingUsage}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingUsage || !selectedProductId}>
              {savingUsage ? "Saving…" : "Record usage"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </section>
  );
}