export default function Button({
  variant = "primary",
  size,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const classes = ["btn", variant, size, className].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
