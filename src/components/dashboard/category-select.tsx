import { Label } from "@/components/ui/label";

export function CategorySelect({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category_id">Catégorie</Label>
      <select
        id="category_id"
        name="category_id"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        defaultValue=""
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
