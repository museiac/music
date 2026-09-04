import { cn } from "@/lib/cn";
import type { Plan } from "@/types/plan";

export function PlanPickerCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = Number(plan.price);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        selected ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{plan.name}</p>
          {plan.description && <p className="mt-0.5 text-sm text-gray-500">{plan.description}</p>}
        </div>
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-brand-600 bg-brand-600" : "border-gray-300"
          )}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </div>

      <p className="text-2xl font-semibold text-gray-900">
        {Number.isFinite(price) ? price.toLocaleString(undefined, { style: "currency", currency: plan.currency }) : plan.price}
        <span className="ml-1 text-sm font-normal text-gray-500">/ {plan.duration} days</span>
      </p>

      {plan.features.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm text-gray-600">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}
