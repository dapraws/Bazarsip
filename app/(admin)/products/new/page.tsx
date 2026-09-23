"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import { whatsappLink } from "@/lib/whatsapp";

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
  whatsapp: string | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    images: [] as string[],
    is_active: true,
    supplier_id: "",
    availability: "ready",
  });

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const supplierChat = whatsappLink(
    suppliers.find((s) => String(s.id) === formData.supplier_id)?.whatsapp ??
      null,
  );

  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category_id: parseInt(formData.category_id),
          image_url: formData.image_url || null,
          images: formData.images.filter((img) => img.trim() !== ""),
          is_active: formData.is_active,
          supplier_id: formData.supplier_id
            ? parseInt(formData.supplier_id)
            : null,
          availability: formData.availability,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Product created successfully!");
        router.push("/products");
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-1">
          Add a new product to your inventory
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price (Rp) *
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Supplier
            </label>
            <select
              id="supplier"
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Belum diisi</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Tempat kulakan barang ini, biar gampang saat mau restock.
            </p>

            {supplierChat && (
              <a
                href={supplierChat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Chat supplier di WhatsApp
              </a>
            )}
          </div>

          {/* Availability */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Ketersediaan
            </span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "ready", label: "Ready", hint: "Barang ada di rumah" },
                { value: "preorder", label: "Pre-order", hint: "Ambil ke supplier dulu" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    formData.availability === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={formData.availability === option.value}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                    className="sr-only"
                  />
                  <span className="block font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Main Image — Cloudinary Upload */}
          <ImageUpload
            folder="bazarsip/products"
            label="Main Image"
            hint="This image will be shown as the product thumbnail."
            value={formData.image_url}
            onChange={(val) =>
              setFormData({ ...formData, image_url: val as string })
            }
            multiple={false}
          />

          {/* Gallery Images — Cloudinary Upload */}
          <ImageUpload
            folder="bazarsip/products"
            label="Gallery Images"
            hint="First image is the main display. Drag & drop or click to add multiple images."
            value={formData.images}
            onChange={(val) =>
              setFormData({ ...formData, images: val as string[] })
            }
            multiple={true}
          />

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Active (visible to customers)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
