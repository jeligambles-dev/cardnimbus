"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  condition: string | null;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?limit=200");
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (product: Product) => {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    await load();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.deactivated) {
      alert(data.message);
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {products.length} total products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">+ New Product</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Category</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Price</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-surface-overlay/50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{product.name}</p>
                    {product.condition && (
                      <p className="text-xs text-text-muted">{product.condition}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{product.category}</td>
                  <td className="px-4 py-3 text-text-primary">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock <= 0
                          ? "text-red-600"
                          : product.stock <= 5
                          ? "text-amber-600"
                          : "text-text-primary"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? "success" : "default"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-nimbus-600 hover:text-nimbus-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleActive(product)}
                        className="text-xs font-medium text-text-secondary hover:text-text-primary"
                      >
                        {product.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
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
