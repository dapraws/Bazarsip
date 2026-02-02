"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        setSelectedImage(data.data.image_url);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId: product.id, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Added ${quantity} to cart!`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(
    Boolean,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link href="/shop" className="text-blue-600 hover:underline">
            ← Back to Shop
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="bg-gray-100 rounded-lg mb-4">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImage === img
                          ? "border-blue-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                {product.category_name}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                {product.name}
              </h1>
              <p className="text-4xl font-bold text-gray-900 mt-4">
                Rp {product.price.toLocaleString("id-ID")}
              </p>

              <p className="mt-4 text-sm font-medium">
                {product.stock > 0 ? (
                  <span className="text-green-600">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600">✗ Out of Stock</span>
                )}
              </p>

              <div className="mt-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 px-4 py-2 border rounded-lg text-center"
                    min="1"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    addToCart();
                    router.push("/cart");
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
