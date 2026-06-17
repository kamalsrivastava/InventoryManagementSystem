export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProduct(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (form.price === "" || Number(form.price) < 0)
    errors.price = "Price must be 0 or greater";
  if (
    form.quantity === "" ||
    !Number.isInteger(Number(form.quantity)) ||
    Number(form.quantity) < 0
  )
    errors.quantity = "Quantity must be a non-negative whole number";
  return errors;
}

export function validateCustomer(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  if (!emailRegex.test(form.email)) errors.email = "A valid email is required";
  if (form.phone.trim().length < 3) errors.phone = "Phone number is required";
  return errors;
}
