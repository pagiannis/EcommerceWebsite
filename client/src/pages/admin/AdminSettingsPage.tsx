import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import {
  useAdminSettingList,
  useUpdateSetting,
} from "../../hooks/admin/useSettings";
import type { SettingItem } from "../../services/admin/settingsService";

const LABELS: Record<string, string> = {
  "order.tax.rate": "Tax Rate",
  "order.shipping.fee": "Shipping Fee",
};

const HINTS: Record<string, string> = {
  "order.tax.rate": "Decimal value — e.g. 0.10 = 10%",
  "order.shipping.fee": "Flat amount in USD — e.g. 5.00",
};

const positiveNumber = z
  .string()
  .trim()
  .min(1, "Required")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0,
    "Must be a valid positive number",
  );

function getSchema(key: string) {
  if (key === "order.tax.rate") {
    return z.object({
      value: positiveNumber.refine(
        (v) => Number(v) <= 1,
        "Must be between 0 and 1",
      ),
      description: z.string(),
    });
  }
  if (key === "order.shipping.fee") {
    return z.object({ value: positiveNumber, description: z.string() });
  }
  return z.object({
    value: z.string().min(1, "Required"),
    description: z.string(),
  });
}

const NUMERIC_KEYS = new Set(["order.tax.rate", "order.shipping.fee"]);

function normalizeValue(key: string, value: string): string {
  if (!NUMERIC_KEYS.has(key)) return value;
  const n = Number(value);
  return isNaN(n) ? value : n.toFixed(2);
}

function formatUpdatedAt(raw: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type FormValues = { value: string; description: string };

function SettingCard({ setting }: { setting: SettingItem }) {
  const updateSetting = useUpdateSetting();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(getSchema(setting.key)),
    defaultValues: {
      value: normalizeValue(setting.key, setting.value),
      description: setting.description,
    },
  });

  useEffect(() => {
    reset(
      { value: normalizeValue(setting.key, setting.value), description: setting.description },
      { keepDirtyValues: true },
    );
  }, [setting.value, setting.description, reset]);

  async function onSubmit(data: FormValues) {
    await updateSetting.mutateAsync({ key: setting.key, payload: data });
    reset({ ...data, value: normalizeValue(setting.key, data.value) });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl border p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-medium text-sm">
            {LABELS[setting.key] ?? setting.key}
          </h2>
          {HINTS[setting.key] && (
            <p className="text-xs text-gray-400 mt-0.5">
              {HINTS[setting.key]}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
          {formatUpdatedAt(setting.updatedAt)}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Value</label>
          <input
            {...register("value")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.value
                ? "border-red-300 focus:ring-red-200"
                : "focus:ring-brand-black/20"
            }`}
          />
          {errors.value && (
            <p className="mt-1 text-xs text-red-500">{errors.value.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Description
          </label>
          <input
            {...register("description")}
            type="text"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/20"
          />
        </div>

        <div className="flex justify-end mt-auto pt-1">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AdminSettingsPage() {
  const { data: rawSettings = [], isLoading, isError } = useAdminSettingList();
  const settings = useMemo(
    () => [...rawSettings].sort((a, b) => a.key.localeCompare(b.key)),
    [rawSettings],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure tax rate and shipping fee applied to orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">
          Failed to load settings.
        </p>
      ) : settings.length === 0 ? (
        <p className="text-center py-24 text-gray-400">No settings found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
          {settings.map((setting) => (
            <SettingCard key={setting.key} setting={setting} />
          ))}
        </div>
      )}
    </div>
  );
}
