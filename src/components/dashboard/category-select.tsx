import { Label } from "@/components/ui/label";

export function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: { id: string; name: string; slug?: string }[];
  value?: string;
  onChange?: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category_id">Catégorie</Label>
      <select
        id="category_id"
        name="category_id"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        defaultValue={onChange ? undefined : ""}
      >
        <option value="">— Aucune —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
