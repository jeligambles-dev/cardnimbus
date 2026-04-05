"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/admin/image-upload";

interface CategoryTile {
  id: string;
  label: string;
  imageUrl: string;
  href: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  label: "",
  imageUrl: "",
  href: "/shop?category=PACK",
  displayOrder: 0,
  isActive: true,
};

export default function AdminCategoryTilesPage() {
  const [tiles, setTiles] = useState<CategoryTile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/category-tiles");
    const data = await res.json();
    setTiles(data.tiles ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (tile: CategoryTile) => {
    setEditing(tile.id);
    setForm({
      label: tile.label,
      imageUrl: tile.imageUrl,
      href: tile.href,
      displayOrder: tile.displayOrder,
      isActive: tile.isActive,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert("Please upload an image");
      return;
    }
    setLoading(true);
    try {
      const url = editing
        ? `/api/admin/category-tiles/${editing}`
        : "/api/admin/category-tiles";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          displayOrder: Number(form.displayOrder),
        }),
      });
      if (res.ok) {
        resetForm();
        await load();
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to save");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tile?")) return;
    await fetch(`/api/admin/category-tiles/${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActive = async (tile: CategoryTile) => {
    await fetch(`/api/admin/category-tiles/${tile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !tile.isActive }),
    });
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Homepage Category Tiles</h1>
      <p className="text-sm text-text-secondary mb-6">
        Manage the &quot;Explore&quot; category tiles shown on the homepage.
      </p>

      {/* Form */}
      <div className="mb-8 rounded-xl border border-surface-border bg-surface-raised p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Edit Tile" : "Add New Tile"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
              placeholder="Packs"
            />
          </div>

          <ImageUpload
            label="Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            hint="Square image recommended (1:1 ratio)"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Link</label>
            <input
              type="text"
              required
              value={form.href}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm font-mono"
              placeholder="/shop?category=PACK"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-surface-border text-nimbus-500"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-nimbus-500 px-5 py-2 text-sm font-bold text-white hover:bg-nimbus-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : editing ? "Update Tile" : "Add Tile"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-surface-border bg-white px-5 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rounded-xl border border-surface-border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised border-b border-surface-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Image</th>
              <th className="text-left px-4 py-3 font-semibold">Label</th>
              <th className="text-left px-4 py-3 font-semibold">Link</th>
              <th className="text-left px-4 py-3 font-semibold">Order</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  No tiles yet. Add one above.
                </td>
              </tr>
            ) : (
              tiles.map((tile) => (
                <tr
                  key={tile.id}
                  className="border-b border-surface-border last:border-0"
                >
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tile.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{tile.label}</td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                    {tile.href}
                  </td>
                  <td className="px-4 py-3">{tile.displayOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(tile)}
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        tile.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tile.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(tile)}
                      className="text-nimbus-600 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tile.id)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
