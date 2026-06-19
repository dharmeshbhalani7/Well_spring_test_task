const variants = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  skipped: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
  create: "bg-blue-100 text-blue-800",
  update: "bg-purple-100 text-purple-800",
  delete: "bg-red-100 text-red-800",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
