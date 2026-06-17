const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatCurrency = (value) => currencyFmt.format(Number(value || 0));

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";
