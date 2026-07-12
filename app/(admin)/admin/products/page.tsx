"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  activateProduct,
  deactivateProduct,
  type Product,
} from "@/services/productService";

export const dynamic = "force-dynamic";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? "w-4 h-4" : "w-5 h-5"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  // Panel state
  const [showPanel, setShowPanel] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Per-row action state
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminProducts(p, size);
      setProducts(res.data.content ?? []);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditProduct(null);
    setName(""); setDescription(""); setPrice(""); setTaxPercentage("");
    setImageFile(null); setImagePreview(null);
    setShowPanel(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setTaxPercentage(String(p.taxPercentage));
    setImageFile(null);
    setImagePreview(p.imageUrl);
    setShowPanel(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!price || isNaN(Number(price))) {
      toast.error("Valid price is required.");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();

      const product = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        taxPercentage: Number(taxPercentage),
      };

      form.append(
        "product",
        new Blob(
          [JSON.stringify(product)],
          {
            type: "application/json",
          }
        )
      );

      if (imageFile) {
        form.append("image", imageFile);
      }

      if (editProduct) {
        await updateProduct(editProduct.id, form);
        toast.success("Product updated.");
      } else {
        await createProduct(form);
        toast.success("Product created.");
      }

      setShowPanel(false);
      load(page);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (product: Product) => {
    setActionId(product.id);
    try {
      await deactivateProduct(product.id);
      toast.success(`${product.name} deactivated.`);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: false } : p));
    } catch { toast.error("Failed to deactivate."); }
    finally { setActionId(null); }
  };

  const handleActivate = async (product: Product) => {
    setActionId(product.id);
    try {
      await activateProduct(product.id);
      toast.success(`${product.name} activated.`);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: true } : p));
    } catch { toast.error("Failed to activate."); }
    finally { setActionId(null); }
  };

  return (
    <div className="flex flex-col min-h-screen">
     

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {/* Header actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-[#3D4946]">{totalElements} product{totalElements !== 1 ? "s" : ""}</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["IMAGE", "NAME", "PRICE", "TAX %", "STATUS", "CREATED", "ACTIONS"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-[#F1F5F9] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-[#94A3B8]">No products yet. Create your first product.</td></tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={p.id} className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg bg-[#F0FDFA] overflow-hidden flex items-center justify-center flex-shrink-0">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-[#00685C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0B1C30]">{p.name}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[180px]">{p.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">{fmtCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{p.taxPercentage}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.active ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F1F5F9] text-[#475569]"}`}>
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(p)} className="text-xs font-semibold text-[#0D9488] hover:underline">Edit</button>
                          {p.active ? (
                            <button
                              onClick={() => handleDeactivate(p)}
                              disabled={actionId === p.id}
                              className="text-xs font-semibold text-[#93000A] hover:underline disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionId === p.id && <Spinner small />}
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(p)}
                              disabled={actionId === p.id}
                              className="text-xs font-semibold text-[#166534] hover:underline disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionId === p.id && <Spinner small />}
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <span className="text-sm text-[#3D4946]">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </main>

      {/* Overlay */}
      {showPanel && <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setShowPanel(false)} />}

      {/* Create / Edit Panel */}
      {showPanel && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#0B1C30]">{editProduct ? "Edit Product" : "New Product"}</h2>
            <button onClick={() => setShowPanel(false)} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {/* Image */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#3D4946]">Product Image</label>
              <div
                className="h-36 bg-[#F0FDFA] rounded-xl border-2 border-dashed border-[#00685C]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#00685C] transition-colors overflow-hidden"
                onClick={() => imageInputRef.current?.click()}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[#00685C]/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-xs text-[#94A3B8]">Click to upload image</p>
                  </>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">Name <span className="text-[#93000A]">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product name" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]" />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none" />
            </div>

            {/* Price + Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Price (₦) <span className="text-[#93000A]">*</span></label>
                <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Tax %</label>
                <input type="number" min="0" max="100" step="0.1" value={taxPercentage} onChange={e => setTaxPercentage(e.target.value)} placeholder="0" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3 mt-auto -mx-6 -mb-5">
              <button type="button" onClick={() => setShowPanel(false)} className="flex-1 py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold bg-[#00685C] text-white rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Spinner small />}
                {saving ? "Saving…" : editProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}