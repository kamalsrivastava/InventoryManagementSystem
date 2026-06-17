const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatCurrency = (value) => currencyFmt.format(Number(value || 0));

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";
