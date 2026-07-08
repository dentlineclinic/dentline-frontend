"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import { fetchPublicProducts, type Product } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { add, totalItems } = useCart();

  useEffect(() => {
    fetchPublicProducts(0, 50)
      .then(res => setProducts(res.data?.content ?? []))
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (product: Product) => {
    add(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-white">
      <Navbar activePage="Shop" />

      {/* Cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-[#00685C] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#008375] transition-colors"
        aria-label="Open cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#93000A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="pt-28 pb-16 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0B1C30]">Our Products</h1>
              <p className="text-[#485F83] mt-1">Premium dental care products for your daily routine.</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#F1F5F9] rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0B1C30] hover:bg-[#F0FDFA] shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {totalItems > 0 && (
                <span className="bg-[#00685C] text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-[#F1F5F9]" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-full" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-2/3" />
                    <div className="h-6 bg-[#F1F5F9] rounded w-1/3" />
                    <div className="h-10 bg-[#F1F5F9] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#0B1C30]">No products available</p>
              <p className="text-sm text-[#94A3B8]">Check back soon for new products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 bg-[#F0FDFA] flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-[#00685C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="text-base font-bold text-[#0B1C30] leading-tight">{product.name}</h3>
                    <p className="text-sm text-[#485F83] line-clamp-3 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#00685C]">{fmtCurrency(product.price)}</p>
                      {product.taxPercentage > 0 && (
                        <span className="text-xs text-[#94A3B8]">+{product.taxPercentage}% tax</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(product)}
                      className="w-full bg-[#00685C] text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-[#008375] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
