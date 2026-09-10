import { cn } from "@/lib/cn";

type Variant = "success" | "warning" | "neutral" | "info";

const variantClasses: Record<Variant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-brand-100 text-brand-800",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant]
      )}
    >
      {children}
    </span>
  );
}
