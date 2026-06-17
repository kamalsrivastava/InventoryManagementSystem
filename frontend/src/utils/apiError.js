// Normalise backend/network errors into a single human-readable message.
export function extractError(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    // FastAPI 422 validation errors: list of { loc, msg }.
    return detail
      .map((d) => `${d.loc?.slice(1).join(".") || "field"}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (error?.code === "ECONNABORTED") return "Request timed out";
  if (error?.message === "Network Error") return "Cannot reach the server";
  return error?.message || "Unexpected error";
}
