import React, { useState, useEffect } from 'react';
import { getGoogleUser, getAuthHeaders, subscribeGoogleAuth } from '../services/googleAuthService';
import { GoogleSignInModal } from './GoogleSignInModal';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  nameAr?: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  currency: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  sourceAgent: string;
  zatcaQrCode: string;
  createdAt: string;
}

interface FinancialSummary {
  totalRevenueSar: string;
  totalExpensesSar: string;
  netProfitSar: string;
  totalInvoices: number;
  totalStockUnits: number;
  lowStockAlerts: number;
  currency: string;
}

export const ExecutionErpStudio: React.FC = () => {
  const [user, setUser] = useState(() => getGoogleUser());
  const [isCleanOnboardingDemo, setIsCleanOnboardingDemo] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'inventory' | 'pos'>('overview');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Item Form State
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(150);
  const [newCost, setNewCost] = useState(60);
  const [newStock, setNewStock] = useState(20);

  // Quick POS / Invoice Form State
  const [posCustomer, setPosCustomer] = useState('عميل مميز من الحملة البيعية');
  const [posPhone, setPosPhone] = useState('+966550000000');
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [posQty, setPosQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeGoogleAuth((usr) => {
      setUser(usr);
      if (usr) setIsCleanOnboardingDemo(false);
    });
    return unsub;
  }, []);

  const fetchData = async () => {
    const currentUser = getGoogleUser();
    if (!currentUser && !isCleanOnboardingDemo) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const [sumRes, invRes, invsRes] = await Promise.all([
        fetch('/api/execution/financial-summary', { headers }),
        fetch('/api/execution/inventory', { headers }),
        fetch('/api/execution/invoices', { headers }),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (invsRes.ok) setInvoicesList(await invsRes.json());
    } catch (err) {
      console.error('Failed to load execution engine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isCleanOnboardingDemo]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/execution/inventory', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sku: newSku,
          name: newName,
          unitPrice: Math.round(Number(newPrice) * 100),
          costPrice: Math.round(Number(newCost) * 100),
          stockQuantity: Number(newStock),
        }),
      });
      if (res.ok) {
        setNewSku('');
        setNewName('');
        setSuccessMessage('تم إضافة الصنف للمستودع بنجاح');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    const item = inventory.find(i => i.id === Number(selectedItemId));
    if (!item) return;

    try {
      setIsSubmitting(true);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/execution/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: posCustomer,
          customerPhone: posPhone,
          paymentMethod: 'mada',
          sourceAgent: 'sales_closer_ai',
          items: [{
            inventoryItemId: item.id,
            itemDescription: item.name,
            unitPrice: item.unitPrice,
            quantity: Number(posQty),
          }],
        }),
      });

      if (res.ok) {
        setSuccessMessage('⚡ تم إغلاق الصفقة آلياً، إصدار الفاتورة الضريبية ZATCA، وخصم المخزون!');
        setTimeout(() => setSuccessMessage(null), 4000);
        fetchData();
        setActiveTab('invoices');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If unauthenticated and not in clean demo mode: show Google Login Gate
  if (!user && !isCleanOnboardingDemo) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12" dir="rtl">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#18132d] via-[#0f0c1e] to-[#080611] border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)] text-center space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner mb-4">
              📦
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <span>🔒</span>
              <span>نظام عزل فواتير ومخزون المستأجرين (Tenant ERP Isolation)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              محرك التنفيذ المحاسبي وإدارة المخزون (ERP Engine)
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed mt-3">
              منطقة إصدار فواتير ZATCA الضريبية، وإدارة المستودعات، والربط المالي التلقائي. يتطلب النظام تسجيل الدخول الرسمي عبر Google لربط بيانات منشأتك المستقلة وعزلها كلياً عن أي مستخدم آخر.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>تسجيل الدخول الفوري بحساب Google</span>
            </button>
            <button
              onClick={() => setIsCleanOnboardingDemo(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-bold text-xs sm:text-sm transition-all"
            >
              <span>👁️ استعراض وضع المستودع المفرغ (Clean Sandbox)</span>
            </button>
          </div>
        </div>

        {isSignInModalOpen && (
          <GoogleSignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
            onSuccess={(usr) => {
              setUser(usr);
              setIsSignInModalOpen(false);
              fetchData();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-4 md:p-8 min-h-screen">
      {/* Incognito / Clean Sandbox Notice Banner */}
      {isCleanOnboardingDemo && !user && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>وضع المستودع المفرغ (Clean Sandbox): لا توجد منتجات أو فواتير مسجلة بعد. سجل دخولك لربط بيانات منشأتك الحقيقية.</span>
          </div>
          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-md whitespace-nowrap active:scale-95 transition-all"
          >
            تسجيل الدخول الآن 🚀
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PHASE 3: EXECUTION & FINANCIAL ERP ENGINE
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>ذراع التنفيذ والمحاسبة والمخزون</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">Brand-Lock Active</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              ربط الصفقات المحادثية مع المخزون اللحظي، الفواتير الضريبية (ZATCA)، ودفتر الأستاذ المالي لمنظومة Fekra OS.
            </p>
          </div>

          {/* Tab Selector (Responsive & Horizontal Scroll on Mobile) */}
          <div className="flex items-center bg-gray-900/80 border border-gray-800 rounded-xl p-1 gap-1 overflow-x-auto suggestions-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              نظرة عامة والمالية
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚡ إغلاق صفقة فوري (POS)
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              الفواتير ({invoicesList.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              المخزون والمنتجات ({inventory.length})
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between shadow-xl animate-fade-in">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* 1. FINANCIAL SUMMARY KPI CARDS */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-gray-400 block font-medium">إجمالي الإيرادات المحققة</span>
              <div className="text-2xl font-black text-emerald-400 mt-2 flex items-baseline gap-1">
                <span>{summary.totalRevenueSar}</span>
                <span className="text-xs text-gray-500 font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-2">محدث آلياً عبر Cloud SQL</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-gray-400 block font-medium">صافي الربح التشغيلي</span>
              <div className="text-2xl font-black text-indigo-400 mt-2 flex items-baseline gap-1">
                <span>{summary.netProfitSar}</span>
                <span className="text-xs text-gray-500 font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-indigo-400/80 mt-2">هامش أرباح محمي بقواعد الـ ERP</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-gray-400 block font-medium">الفواتير الضريبية المعتمدة</span>
              <div className="text-2xl font-black text-white mt-2">
                {summary.totalInvoices}
              </div>
              <div className="text-[11px] text-emerald-400 mt-2">متوافقة مع ZATCA Phase 2</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-gray-400 block font-medium">إجمالي وحدات المخزون المتوفرة</span>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {summary.totalStockUnits} <span className="text-xs text-gray-400 font-normal">قطعة</span>
              </div>
              <div className="text-[11px] text-amber-400/80 mt-2">
                {summary.lowStockAlerts > 0 ? `⚠️ ${summary.lowStockAlerts} أصناف تقترب من النفاذ` : '✅ مستويات المخزون آمنة ومستقرة'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Areas based on Tab */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>آخر الفواتير الصادرة آلياً</span>
                <button onClick={() => setActiveTab('invoices')} className="text-xs text-indigo-400 hover:underline">عرض الكل</button>
              </h2>
              {invoicesList.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  لا توجد فواتير بعد. استخدم تبويب (إغلاق صفقة فوري) لإصدار أول فاتورة.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-xs text-gray-400 border-b border-gray-800 bg-gray-950/40">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">المبلغ الإجمالي</th>
                        <th className="p-3">طريقة الدفع</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {invoicesList.slice(0, 5).map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-800/40">
                          <td className="p-3 font-mono text-indigo-400 text-xs font-bold">{inv.invoiceNumber}</td>
                          <td className="p-3 font-medium text-white">{inv.customerName}</td>
                          <td className="p-3 font-bold text-emerald-400">{(inv.totalAmount / 100).toFixed(2)} ر.س</td>
                          <td className="p-3 text-xs text-gray-300 uppercase">{inv.paymentMethod}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              مدفوعة
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Side Card: Stock Sentinel AI */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping"></div>
                  <h3 className="font-bold text-white text-base">حارس المخزون الذكي (AI Sentinel)</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  يقوم حارس المخزون بمراقبة معدل استهلاك المنتجات ومطابقتها مع صفقات المحادثات في الوقت الحقيقي لمنع انقطاع البضاعة وتفعيل محفزات الندرة البيعية.
                </p>

                <div className="mt-5 space-y-3">
                  {inventory.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-950/60 border border-gray-800/80 p-3 rounded-xl text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">SKU: {item.sku}</div>
                      </div>
                      <div className="text-left">
                        <span className={`font-bold ${item.stockQuantity <= item.reorderLevel ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.stockQuantity} قطعة
                        </span>
                        <div className="text-[10px] text-gray-500">{(item.unitPrice / 100).toFixed(2)} ر.س</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('pos')}
                className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-sm shadow-xl transition"
              >
                إنشاء صفقة بيع جديدة
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INSTANT POS / DEAL CLOSING */}
        {activeTab === 'pos' && (
          <div className="max-w-2xl mx-auto bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>⚡ إغلاق صفقة بيع فورية (AI Deal Closer)</span>
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              تحويل تفاوض العميل إلى فاتورة ضريبية رسمية وحجز الكمية من المستودع لحظياً.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={posCustomer}
                  onChange={(e) => setPosCustomer(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">رقم هاتف العميل</label>
                <input
                  type="text"
                  value={posPhone}
                  onChange={(e) => setPosPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">اختر المنتج من المستودع</label>
                  <select
                    required
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- حدد الصنف --</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.stockQuantity} متوفر) - {(item.unitPrice / 100).toFixed(2)} ر.س
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={posQty}
                    onChange={(e) => setPosQty(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800/80">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedItemId}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'جارٍ إصدار الفاتورة وتحديث المخزون...' : 'إتمام البيع وإصدار الفاتورة الضريبية ZATCA'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: INVOICES LIST */}
        {activeTab === 'invoices' && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">سجل الفواتير الضريبية (ZATCA Invoices)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-400 border-b border-gray-800 bg-gray-950/40">
                  <tr>
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">الضريبة (15%)</th>
                    <th className="p-3">المجموع الكلي</th>
                    <th className="p-3">الوكيل المسؤول</th>
                    <th className="p-3">رمز الفاتورة المشفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {invoicesList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-800/40">
                      <td className="p-3 font-mono text-indigo-400 text-xs font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3 font-medium text-white">{inv.customerName}</td>
                      <td className="p-3 text-gray-400 text-xs">{(inv.taxAmount / 100).toFixed(2)} ر.س</td>
                      <td className="p-3 font-bold text-emerald-400">{(inv.totalAmount / 100).toFixed(2)} ر.س</td>
                      <td className="p-3 text-xs text-purple-400">{inv.sourceAgent}</td>
                      <td className="p-3 font-mono text-[10px] text-gray-500">{inv.zatcaQrCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY & STOCK MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Inventory List */}
            <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">أصناف المستودع والكميات اللحظية</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="text-xs text-gray-400 border-b border-gray-800 bg-gray-950/40">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">اسم المنتج</th>
                      <th className="p-3">سعر البيع</th>
                      <th className="p-3">التكلفة (COGS)</th>
                      <th className="p-3">الكمية بالمخزن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-800/40">
                        <td className="p-3 font-mono text-xs text-gray-400">{item.sku}</td>
                        <td className="p-3 font-medium text-white">{item.name}</td>
                        <td className="p-3 font-bold text-emerald-400">{(item.unitPrice / 100).toFixed(2)} ر.س</td>
                        <td className="p-3 text-gray-400 text-xs">{(item.costPrice / 100).toFixed(2)} ر.س</td>
                        <td className="p-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-xs ${item.stockQuantity <= item.reorderLevel ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {item.stockQuantity} قطعة
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Add Product Form */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-white text-base mb-4">إضافة صنف جديد للمستودع</h3>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">رمز الصنف (SKU)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRF-MUSK-50"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. مسك أبيض خالص فاخر"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">سعر البيع (ر.س)</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">تكلفة الشراء (COGS)</label>
                    <input
                      type="number"
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الكمية الافتتاحية</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm text-white shadow-xl transition"
                >
                  حفظ في قاعدة بيانات Cloud SQL
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionErpStudio;
