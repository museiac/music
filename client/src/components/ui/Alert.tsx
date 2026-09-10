import { cn } from "@/lib/cn";

type Variant = "error" | "success" | "info";

const variantClasses: Record<Variant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-brand-200 bg-brand-50 text-brand-700",
};

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3.5 py-2.5 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
