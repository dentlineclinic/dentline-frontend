"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, remove, increment, decrement, clear, subtotal, totalTax, grandTotal, totalItems } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-base font-bold text-[#0B1C30]">Your Cart</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs font-semibold text-[#93000A] hover:underline">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-14 h-14 bg-[#F0FDFA] rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#94A3B8]">Your cart is empty</p>
              <button onClick={onClose} className="text-sm font-semibold text-[#00685C] hover:underline">
                Continue shopping →
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const lineSubtotal = product.price * quantity;
              const lineTax = (lineSubtotal * product.taxPercentage) / 100;
              return (
                <div key={product.id} className="flex items-start gap-4 bg-[#F8FAFC] rounded-xl p-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-[#F0FDFA] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-[#00685C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B1C30] truncate">{product.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{fmtCurrency(product.price)} each</p>
                    {product.taxPercentage > 0 && (
                      <p className="text-xs text-[#94A3B8]">Tax ({product.taxPercentage}%): {fmtCurrency(lineTax)}</p>
                    )}
                    <p className="text-sm font-bold text-[#00685C] mt-1">{fmtCurrency(lineSubtotal + lineTax)}</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button onClick={() => remove(product.id)} className="text-[#94A3B8] hover:text-[#93000A] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrement(product.id)}
                        className="w-6 h-6 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] transition-colors text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-[#0B1C30] w-5 text-center">{quantity}</span>
                      <button
                        onClick={() => increment(product.id)}
                        className="w-6 h-6 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#F1F5F9] px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm text-[#3D4946]">
                <span>Subtotal</span>
                <span className="font-semibold">{fmtCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#3D4946]">
                <span>Tax</span>
                <span className="font-semibold">{fmtCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0B1C30] pt-1 border-t border-[#F1F5F9]">
                <span>Grand Total</span>
                <span className="text-[#00685C]">{fmtCurrency(grandTotal)}</span>
              </div>
            </div>
            <Link
              href="/shop/checkout"
              onClick={onClose}
              className="w-full bg-[#00685C] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#008375] transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={onClose}
              className="w-full text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
