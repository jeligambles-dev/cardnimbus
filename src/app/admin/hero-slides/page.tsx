"use client";

import { useState, useEffect } from "react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  buttonLabel: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonLabel: "Shop Now",
  buttonLink: "/shop",
  displayOrder: 0,
  isActive: true,
};

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/hero-slides");
    const data = await res.json();
    setSlides(data.slides ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (slide: HeroSlide) => {
    setEditing(slide.id);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle ?? "",
      imageUrl: slide.imageUrl,
      buttonLabel: slide.buttonLabel,
      buttonLink: slide.buttonLink,
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editing
        ? `/api/admin/hero-slides/${editing}`
        : "/api/admin/hero-slides";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtitle: form.subtitle || null,
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
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActive = async (slide: HeroSlide) => {
    await fetch(`/api/admin/hero-slides/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hero Carousel</h1>

      {/* Form */}
      <div className="mb-8 rounded-xl border border-surface-border bg-surface-raised p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Edit Slide" : "Add New Slide"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
                placeholder="New Paldea Evolved Drop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Subtitle (optional)
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
                placeholder="Limited quantities available"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm font-mono"
              placeholder="https://example.com/banner.jpg"
            />
            <p className="mt-1 text-xs text-text-muted">
              Recommended: 2100×900px landscape image
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Button Label
              </label>
              <input
                type="text"
                required
                value={form.buttonLabel}
                onChange={(e) =>
                  setForm({ ...form, buttonLabel: e.target.value })
                }
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Button Link
              </label>
              <input
                type="text"
                required
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm font-mono"
                placeholder="/shop?category=PACK"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {loading ? "Saving..." : editing ? "Update Slide" : "Add Slide"}
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
              <th className="text-left px-4 py-3 font-semibold">Title</th>
              <th className="text-left px-4 py-3 font-semibold">Button</th>
              <th className="text-left px-4 py-3 font-semibold">Order</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  No slides yet. Add one above.
                </td>
              </tr>
            ) : (
              slides.map((slide) => (
                <tr
                  key={slide.id}
                  className="border-b border-surface-border last:border-0"
                >
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.imageUrl}
                      alt=""
                      className="h-12 w-20 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{slide.title}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    <span className="font-medium">{slide.buttonLabel}</span>
                    <span className="text-text-muted"> → {slide.buttonLink}</span>
                  </td>
                  <td className="px-4 py-3">{slide.displayOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        slide.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(slide)}
                      className="text-nimbus-600 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
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
