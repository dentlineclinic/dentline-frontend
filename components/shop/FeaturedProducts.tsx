"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPublicProducts, type Product } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    fetchPublicProducts(0, 6)
      .then(res => setProducts(res.data?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 px-6 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-base text-[#00685C] tracking-widest mb-2">OUR PRODUCTS</p>
          <h2 className="text-4xl font-bold text-[#0B1C30]">Featured Products</h2>
          <p className="text-[#485F83] mt-2">Premium dental care products for your daily routine.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-[#F1F5F9]" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-full" />
                  <div className="h-6 bg-[#F1F5F9] rounded w-1/3" />
                  <div className="h-10 bg-[#F1F5F9] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {/* Image */}
                <div className="h-48 bg-[#F0FDFA] flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-[#00685C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h3 className="text-base font-bold text-[#0B1C30] leading-tight">{product.name}</h3>
                  <p className="text-sm text-[#485F83] line-clamp-2 flex-1">{product.description}</p>
                  <p className="text-lg font-bold text-[#00685C]">{fmtCurrency(product.price)}</p>
                  <button
                    onClick={() => { add(product); toast.success(`${product.name} added to cart`); }}
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

        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-2 border-[#00685C] text-[#00685C] font-semibold text-sm px-8 py-3 rounded-lg hover:bg-[#00685C] hover:text-white transition-all"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
