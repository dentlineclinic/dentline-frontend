"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/orderService";
import { toast } from "react-toastify";
import Link from "next/link";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalTax, grandTotal, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Name is required.";
    if (!phoneNumber.trim()) e.phoneNumber = "Phone number is required.";
    if (!address.trim()) e.address = "Delivery address is required.";
    if (!receipt) e.receipt = "Please upload your payment receipt.";
    if (items.length === 0) e.items = "Your cart is empty.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("customerName", customerName.trim());
      form.append("phoneNumber", phoneNumber.trim());
      form.append("address", address.trim());
      form.append("receipt", receipt!);
      items.forEach((item, idx) => {
        form.append(`items[${idx}].productId`, item.product.id);
        form.append(`items[${idx}].quantity`, String(item.quantity));
      });

      await createOrder(form);
      clear();
      setSuccess(true);
      toast.success("Order placed successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (bank: string, account: string) => {
    try {
      await navigator.clipboard.writeText(account);
      setCopiedBank(bank);
      toast.success("Account number copied!");
      
      // Reset the icon after 2 seconds
      setTimeout(() => {
        setCopiedBank(null);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy account number");
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-[#EFF4FF] border rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none transition-colors ${
      errors[field]
        ? "border-[#93000A] focus:border-[#BA1A1A]"
        : "border-[#BDC9C5] focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C]"
    }`;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-white">
        <Navbar activePage="Shop" />
        <main className="pt-28 pb-16 px-6 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white border border-[#F1F5F9] rounded-2xl shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0B1C30]">Order Placed!</h2>
            <p className="text-sm text-[#485F83] leading-relaxed">
              Thank you for your order. We have received your request and payment receipt. Our team will review and confirm your order shortly.
            </p>
            <Link
              href="/shop"
              className="bg-[#00685C] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-[#008375] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-white">
      <Navbar activePage="Shop" />

      <main className="pt-28 pb-16 px-6 md:px-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/shop" className="text-sm text-[#0D9488] hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Shop
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#0B1C30] mb-8">Checkout</h1>

          {items.length === 0 ? (
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center shadow-sm">
              <p className="text-sm text-[#94A3B8] mb-4">Your cart is empty.</p>
              <Link href="/shop" className="text-sm font-semibold text-[#00685C] hover:underline">Browse Products →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

              {/* Left — checkout form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-5">
                  <h2 className="text-base font-bold text-[#0B1C30]">Customer Information</h2>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">Full Name <span className="text-[#93000A]">*</span></label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Doe" className={inputClass("customerName")} />
                    {errors.customerName && <p className="text-xs text-[#93000A]">{errors.customerName}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">Phone Number <span className="text-[#93000A]">*</span></label>
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="08012345678" className={inputClass("phoneNumber")} />
                    {errors.phoneNumber && <p className="text-xs text-[#93000A]">{errors.phoneNumber}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">Delivery Address <span className="text-[#93000A]">*</span></label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full delivery address" rows={3} className={`${inputClass("address")} resize-none`} />
                    {errors.address && <p className="text-xs text-[#93000A]">{errors.address}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">Payment Receipt <span className="text-[#93000A]">*</span></label>
                    <p className="text-xs text-[#94A3B8] mb-1">Upload proof of payment (Image or PDF)</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => setReceipt(e.target.files?.[0] ?? null)}
                      className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00685C] file:text-white hover:file:bg-[#008375] w-full"
                    />
                    {receipt && <p className="text-xs text-[#00685C] font-semibold">✓ {receipt.name}</p>}
                    {errors.receipt && <p className="text-xs text-[#93000A]">{errors.receipt}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order…
                    </>
                  ) : (
                    <>Place Order · {fmtCurrency(grandTotal)}</>
                  )}
                </button>
              </form>

              {/* Right — order summary and bank details */}
              <div className="flex flex-col gap-6">
                {/* Order Summary */}
                <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm h-fit flex flex-col gap-5">
                  <h2 className="text-base font-bold text-[#0B1C30]">Order Summary</h2>

                  <div className="flex flex-col gap-3">
                    {items.map(({ product, quantity }) => {
                      const lineSubtotal = product.price * quantity;
                      const lineTax = (lineSubtotal * product.taxPercentage) / 100;
                      const lineTotal = lineSubtotal + lineTax;
                      return (
                        <div key={product.id} className="bg-[#F8FAFC] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#0B1C30] flex-1 truncate pr-2">{product.name}</p>
                            <p className="text-sm font-bold text-[#0B1C30] flex-shrink-0">{fmtCurrency(lineTotal)}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                            <span>Qty: {quantity}</span>
                            <span>·</span>
                            <span>{fmtCurrency(product.price)} each</span>
                            {product.taxPercentage > 0 && (
                              <>
                                <span>·</span>
                                <span>Tax {product.taxPercentage}%: {fmtCurrency(lineTax)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#F1F5F9] pt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-[#3D4946]">
                      <span>Subtotal</span><span className="font-semibold">{fmtCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#3D4946]">
                      <span>Tax</span><span className="font-semibold">{fmtCurrency(totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#0B1C30] pt-2 border-t border-[#F1F5F9]">
                      <span>Grand Total</span><span className="text-[#00685C]">{fmtCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Bank transfer details - now below order summary */}
                <div className="bg-[#F0FDFA] border border-[#00685C]/20 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-[#00685C] uppercase tracking-widest">Transfer Payment To</p>
                  {[
                    { bank: "GT Bank", account: "0786356051", name: "Dentline Limited" },
                    { bank: "Moniepoint", account: "9155588050", name: "Dentline Limited" },
                  ].map(detail => {
                    const isCopied = copiedBank === detail.bank;
                    return (
                      <div key={detail.bank} className="bg-white rounded-lg px-4 py-3 flex flex-col gap-1 border border-[#E2E8F0]">
                        <p className="text-xs font-bold text-[#0B1C30]">{detail.bank}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-[#00685C] tracking-widest font-mono">{detail.account}</p>
                          <button
                            type="button"
                            onClick={() => handleCopy(detail.bank, detail.account)}
                            className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1 transition-all duration-200"
                            disabled={isCopied}
                          >
                            {isCopied ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#3D4946]">{detail.name}</p>
                      </div>
                    );
                  })}
                  <p className="text-xs text-[#485F83] leading-relaxed">
                    Please transfer the exact grand total shown in your order summary, then upload your receipt below.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}