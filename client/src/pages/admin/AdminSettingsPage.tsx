import { useState, useEffect, useMemo } from "react";
import { Loader2, Save } from "lucide-react";
import {
  useAdminSettingList,
  useUpdateSetting,
} from "../../hooks/admin/useSettings";

export default function AdminSettingsPage() {
  const { data: rawSettings = [], isLoading, isError } = useAdminSettingList();
  const settings = useMemo(
    () => [...rawSettings].sort((a, b) => a.key.localeCompare(b.key)),
    [rawSettings]
  );
  const updateSetting = useUpdateSetting();

  const [values, setValues] = useState<Record<string, string>>({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.length > 0) {
      const v: Record<string, string> = {};
      const d: Record<string, string> = {};
      for (const s of settings) {
        v[s.key] = s.value;
        d[s.key] = s.description;
      }
      setValues(v);
      setDescriptions(d);
    }
  }, [settings]);

  async function handleSave(key: string) {
    await updateSetting.mutateAsync({
      key,
      payload: { value: values[key], description: descriptions[key] },
    });
  }

  function hasChanged(key: string) {
    const original = settings.find((s) => s.key === key);
    if (!original) return false;
    return (
      values[key] !== original.value ||
      descriptions[key] !== original.description
    );
  }

  const LABELS: Record<string, string> = {
    "order.tax.rate": "Tax Rate",
    "order.shipping.fee": "Shipping Fee",
  };

  const HINTS: Record<string, string> = {
    "order.tax.rate": "Decimal value, e.g. 0.10 = 10%",
    "order.shipping.fee": "Flat amount in €, e.g. 5.00",
  };

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
        <div className="grid gap-4 max-w-xl">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="bg-white rounded-xl border p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-medium text-sm">
                    {LABELS[setting.key] ?? setting.key}
                  </h2>
                  {HINTS[setting.key] && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {HINTS[setting.key]}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Updated: {setting.updatedAt}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={values[setting.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [setting.key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={descriptions[setting.key] ?? ""}
                    onChange={(e) =>
                      setDescriptions((prev) => ({
                        ...prev,
                        [setting.key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(setting.key)}
                    disabled={
                      !hasChanged(setting.key) || updateSetting.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateSetting.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}