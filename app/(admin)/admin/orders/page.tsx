"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  fetchAdminOrders,
  updatePaymentStatus,
  updateShippingStatus,
  type Order,
} from "@/services/orderService";

export const dynamic = "force-dynamic";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const PAYMENT_COLORS: Record<string, string> = {
  PENDING:  "bg-[#FEF3C7] text-[#92400E]",
  APPROVED: "bg-[#DCFCE7] text-[#166534]",
  REJECTED: "bg-[#FFDAD6] text-[#93000A]",
};

const SHIPPING_COLORS: Record<string, string> = {
  PENDING:    "bg-[#F1F5F9] text-[#475569]",
  PROCESSING: "bg-[#FEF3C7] text-[#92400E]",
  SHIPPED:    "bg-[#E5EEFF] text-[#1E40AF]",
  DELIVERED:  "bg-[#DCFCE7] text-[#166534]",
};

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? "w-4 h-4" : "w-5 h-5"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOrders(p, size);
      setOrders(res.data.content ?? []);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshSelected = async (id: string) => {
    try {
      const res = await fetchAdminOrders(page, size);
      const updated = (res.data.content ?? []).find(o => o.id === id);
      if (updated) {
        setSelectedOrder(updated);
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
      }
    } catch { /* silent */ }
  };

  const handlePayment = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedOrder) return;
    setActionLoading(`payment-${status}`);
    try {
      await updatePaymentStatus(selectedOrder.id, status);
      toast.success(`Payment ${status.toLowerCase()}.`);
      await refreshSelected(selectedOrder.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShipping = async (status: "PROCESSING" | "SHIPPED" | "DELIVERED") => {
    if (!selectedOrder) return;
    setActionLoading(`shipping-${status}`);
    try {
      await updateShippingStatus(selectedOrder.id, status);
      toast.success(`Shipping updated to ${status.toLowerCase()}.`);
      await refreshSelected(selectedOrder.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update shipping.");
    } finally {
      setActionLoading(null);
    }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <div className="flex flex-col min-h-screen">
      

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        <p className="text-sm text-[#3D4946]">{totalElements} order{totalElements !== 1 ? "s" : ""}</p>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["CUSTOMER", "PHONE", "PRODUCTS", "GRAND TOTAL", "PAYMENT", "SHIPPING", "DATE", ""].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-[#F1F5F9] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-[#94A3B8]">No orders yet.</td></tr>
                ) : (
                  orders.map((order, i) => (
                    <tr key={order.id} className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors ${selectedOrder?.id === order.id ? "bg-[#F0FDFA]" : ""}`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0B1C30]">{order.customerName}</p>
                        <p className="text-xs text-[#94A3B8] truncate max-w-[120px]">{order.address}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{order.phoneNumber}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">{order.items?.length ?? 0}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#0B1C30]">{
                        (() => {
                          const gt = !isNaN(order.grandTotal) && order.grandTotal > 0
                            ? order.grandTotal
                            : (order.items ?? []).reduce((s, item) => {
                                const sub = (item.unitPrice ?? 0) * (item.quantity ?? 0);
                                const tax = !isNaN(item.taxAmount) && item.taxAmount > 0
                                  ? item.taxAmount
                                  : (sub * (item.taxPercentage ?? 0)) / 100;
                                return s + sub + tax;
                              }, 0);
                          return fmtCurrency(gt);
                        })()
                      }</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[order.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SHIPPING_COLORS[order.shippingStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {order.shippingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedOrder(order)} className="text-xs font-semibold text-[#0D9488] hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <span className="text-sm text-[#3D4946]">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </main>

      {/* Overlay */}
      {selectedOrder && <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelectedOrder(null)} />}

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30]">Order Details</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">{selectedOrder.id.slice(0, 8).toUpperCase()}…</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

            {/* Customer info */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-1">Customer Information</p>
              {[
                { label: "Name", value: selectedOrder.customerName },
                { label: "Phone", value: selectedOrder.phoneNumber },
                { label: "Address", value: selectedOrder.address },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">{label}</span>
                  <span className="text-sm text-[#0B1C30] text-right flex-1">{value}</span>
                </div>
              ))}
            </div>

            {/* Receipt */}
            {selectedOrder.receiptUrl && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Payment Receipt</p>
                {isImage(selectedOrder.receiptUrl) ? (
                  <div className="rounded-xl overflow-hidden border border-[#E2E8F0] max-h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedOrder.receiptUrl} alt="Receipt" className="w-full h-full object-contain bg-[#F8FAFC]" />
                  </div>
                ) : (
                  <a
                    href={selectedOrder.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 hover:border-[#00685C] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#93000A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#0B1C30] font-medium flex-1">View PDF Receipt</span>
                    <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* Order items */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Ordered Products</p>
              {selectedOrder.items.map((item, i) => {
                const lineSubtotal = (item.unitPrice ?? 0) * (item.quantity ?? 0);
                const calcTaxAmount = !isNaN(item.taxAmount) && item.taxAmount > 0
                  ? item.taxAmount
                  : (lineSubtotal * (item.taxPercentage ?? 0)) / 100;
                const calcLineTotal = !isNaN(item.lineTotal) && item.lineTotal > 0
                  ? item.lineTotal
                  : lineSubtotal + calcTaxAmount;
                return (
                <div key={i} className="bg-[#F8FAFC] rounded-lg p-4 flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-[#0B1C30]">{item.productName}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { label: "Qty", value: String(item.quantity) },
                      { label: "Unit Price", value: fmtCurrency(item.unitPrice ?? 0) },
                      { label: "Tax %", value: `${item.taxPercentage ?? 0}%` },
                      { label: "Tax Amount", value: fmtCurrency(calcTaxAmount) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-xs text-[#94A3B8]">{label}</span>
                        <span className="text-xs font-semibold text-[#0B1C30]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-[#E2E8F0] pt-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#3D4946]">Line Total</span>
                    <span className="text-sm font-bold text-[#00685C]">{fmtCurrency(calcLineTotal)}</span>
                  </div>
                </div>
                );
              })}

              {/* Totals — derived from items when backend fields are absent */}
              {(() => {
                const calcSubtotal = selectedOrder.items.reduce(
                  (s, item) => s + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0
                );
                const calcTax = selectedOrder.items.reduce((s, item) => {
                  const sub = (item.unitPrice ?? 0) * (item.quantity ?? 0);
                  return s + (!isNaN(item.taxAmount) && item.taxAmount > 0
                    ? item.taxAmount
                    : (sub * (item.taxPercentage ?? 0)) / 100);
                }, 0);
                const subtotal  = !isNaN(selectedOrder.subtotal)  && selectedOrder.subtotal  > 0 ? selectedOrder.subtotal  : calcSubtotal;
                const totalTax  = !isNaN(selectedOrder.totalTax)  && selectedOrder.totalTax  > 0 ? selectedOrder.totalTax  : calcTax;
                const grandTotal= !isNaN(selectedOrder.grandTotal) && selectedOrder.grandTotal > 0 ? selectedOrder.grandTotal : calcSubtotal + calcTax;
                return (
                  <div className="bg-white border border-[#F1F5F9] rounded-lg p-4 flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm text-[#3D4946]">
                      <span>Subtotal</span><span className="font-semibold">{fmtCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#3D4946]">
                      <span>Tax</span><span className="font-semibold">{fmtCurrency(totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#0B1C30] border-t border-[#F1F5F9] pt-1.5">
                      <span>Grand Total</span><span className="text-[#00685C]">{fmtCurrency(grandTotal)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment management */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Payment</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[selectedOrder.paymentStatus]}`}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              {selectedOrder.paymentStatus === "PENDING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePayment("APPROVED")}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 text-sm font-semibold bg-[#00685C] text-white rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "payment-APPROVED" && <Spinner small />}
                    Approve
                  </button>
                  <button
                    onClick={() => handlePayment("REJECTED")}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 text-sm font-semibold bg-[#93000A] text-white rounded-lg hover:bg-[#BA1A1A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "payment-REJECTED" && <Spinner small />}
                    Reject
                  </button>
                </div>
              )}
            </div>

            {/* Shipping management */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Shipping</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SHIPPING_COLORS[selectedOrder.shippingStatus]}`}>
                  {selectedOrder.shippingStatus}
                </span>
              </div>
              {selectedOrder.paymentStatus !== "APPROVED" ? (
                <p className="text-xs text-[#94A3B8]">Shipping can only be updated after payment is approved.</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(["PROCESSING", "SHIPPED", "DELIVERED"] as const)
                    .filter(s => s !== selectedOrder.shippingStatus)
                    .map(status => (
                      <button
                        key={status}
                        onClick={() => handleShipping(status)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] hover:text-[#00685C] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `shipping-${status}` && <Spinner small />}
                        {status}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#F1F5F9]">
            <button onClick={() => setSelectedOrder(null)} className="w-full py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
