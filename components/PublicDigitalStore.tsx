import React, { useState, useEffect } from 'react';

export interface PublicProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: string;
  stockQuantity: number;
  imageUrl: string;
  currency: string;
}

export interface CartItem {
  product: PublicProduct;
  quantity: number;
}

interface PublicDigitalStoreProps {
  tenantId?: string;
  onBackToApp?: () => void;
  onClose?: () => void;
}

export const PublicDigitalStore: React.FC<PublicDigitalStoreProps> = ({
  tenantId = 'demo-tenant',
  onBackToApp,
  onClose
}) => {
  const handleBack = onBackToApp || onClose;
  const [effectiveTenantId, setEffectiveTenantId] = useState(tenantId);
  const [tenantName, setTenantName] = useState('المتجر والمنيو الذكي');
  const [tenantPhone, setTenantPhone] = useState('201225678405');
  const [currency, setCurrency] = useState('EGP');
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Order Details
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNumber, setTableNumber] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Resolve tenantId from URL pathname if accessible
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && (pathParts[0] === 'menu' || pathParts[0] === 'store')) {
        setEffectiveTenantId(pathParts[1]);
      }
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [effectiveTenantId]);

  const fetchStoreData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/public/store/${effectiveTenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tenant) {
          setTenantName(data.tenant.businessName || 'المتجر والمنيو الذكي');
          if (data.tenant.currency) setCurrency(data.tenant.currency);
        }
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          const cats = ['الكل', ...Array.from(new Set(data.products.map((p: any) => p.category || 'عام')))];
          setCategories(cats as string[]);
        }
      } else {
        // Fallback demo inventory for testing
        useDemoCatalog();
      }
    } catch (e) {
      console.warn('Failed to fetch public store data, using fallback demo catalog:', e);
      useDemoCatalog();
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoCatalog = () => {
    const demoItems: PublicProduct[] = [
      {
        id: 101,
        sku: 'CAFE-01',
        name: 'سبانش لاتيه مثلج مميز (Spanish Iced Latte)',
        category: 'مشروبات باردة',
        price: '85.00',
        stockQuantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
        currency: 'EGP'
      },
      {
        id: 102,
        sku: 'CAFE-02',
        name: 'برجر كلاسيك أنجوس مع صوص الجبن والبطاطس',
        category: 'وجبات رئيسية',
        price: '195.00',
        stockQuantity: 28,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        currency: 'EGP'
      },
      {
        id: 103,
        sku: 'CAFE-03',
        name: 'كيك شوكولاتة بلجيكية فاخرة مع آيس كريم',
        category: 'حلويات',
        price: '110.00',
        stockQuantity: 15,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        currency: 'EGP'
      },
      {
        id: 104,
        sku: 'CAFE-04',
        name: 'بيتزا نابوليتانا مارجريتا بالريحان الطازج',
        category: 'وجبات رئيسية',
        price: '165.00',
        stockQuantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
        currency: 'EGP'
      },
      {
        id: 105,
        sku: 'CAFE-05',
        name: 'موهيتو فراولة وليمون منعش',
        category: 'مشروبات باردة',
        price: '75.00',
        stockQuantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        currency: 'EGP'
      }
    ];
    setProducts(demoItems);
    setCategories(['الكل', 'مشروبات باردة', 'وجبات رئيسية', 'حلويات']);
  };

  const addToCart = (product: PublicProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
  const vatAmount = subtotal * 0.14; // 14% VAT
  const total = subtotal + vatAmount;

  // Egyptian Phone Validation
  const validatePhone = (phone: string): boolean => {
    const clean = phone.replace(/[\s-]/g, '');
    const egRegex = /^01[0125][0-9]{8}$/;
    return egRegex.test(clean);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!customerName.trim()) {
      alert('من فضلك أدخل اسمك لتأكيد الطلب');
      return;
    }

    if (!validatePhone(customerPhone)) {
      setPhoneError('رقم الهاتف غير صالح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('من فضلك أدخل عنوان التوصيل بالتفصيل');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerName,
        customerPhone,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : null,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total.toFixed(2),
        currency
      };

      // 1. Submit to Backend API (Saves invoice, deducts stock, creates CRM customer)
      const res = await fetch(`/api/public/store/${effectiveTenantId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setOrderSuccess({ ...payload, orderId: data.orderId || `ORD-${Date.now()}` });

      // 2. Generate Pre-formatted WhatsApp Message for Instant Merchant Notification
      const itemsListText = cart.map(item => `• ${item.quantity}x ${item.product.name} = ${(parseFloat(item.product.price) * item.quantity).toFixed(2)} ${currency}`).join('\n');
      
      let orderContext = `نوع الطلب: صالة (طاولة رقم ${tableNumber})`;
      if (orderType === 'takeaway') orderContext = 'نوع الطلب: استلام من الفرع (Takeaway)';
      if (orderType === 'delivery') orderContext = `نوع الطلب: دليفري للمنزل\nالعنوان: ${deliveryAddress}`;

      const waMessage = encodeURIComponent(
        `🛍️ *طلب جديد من المنيو الرقمي* 🛍️\n\n` +
        `رقم الطلب: ${data.orderId || 'ORD-NEW'}\n` +
        `اسم العميل: ${customerName}\n` +
        `رقم الهاتف: ${customerPhone}\n` +
        `${orderContext}\n\n` +
        `📋 *تفاصيل الطلب:*\n${itemsListText}\n\n` +
        `المجموع الفرعي: ${subtotal.toFixed(2)} ${currency}\n` +
        `ضريبة القيمة المضافة (14%): ${vatAmount.toFixed(2)} ${currency}\n` +
        `*الإجمالي النهائي:* ${total.toFixed(2)} ${currency}\n\n` +
        `✓ تم التسجيل التلقائي في نظام Fekra AI POS`
      );

      const waUrl = `https://wa.me/${tenantPhone}?text=${waMessage}`;
      
      // Auto open WhatsApp on click or allow button
      window.open(waUrl, '_blank');
      setCart([]);
    } catch (err) {
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة ثانية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = activeCategory === 'الكل'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans" dir="rtl">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {handleBack && (
            <button
              onClick={handleBack}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              ← النظام
            </button>
          )}
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>🍽️</span> {tenantName}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>متاح للطلب المباشر • QR Menu</span>
            </div>
          </div>
        </div>

        {/* Cart Trigger Badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <span>🛒 سلة الطلبات</span>
          {cart.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-cyan-400 font-mono text-[11px]">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col gap-5">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            جاري تحميل قائمة المنتجات والمنيو الرقمي...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            لا توجد منتجات مسجلة في هذا القسم حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-slate-300 border border-white/10">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="text-cyan-400 font-mono font-black text-base mt-1.5">
                        {product.price} <span className="text-xs text-slate-400 font-normal">{currency}</span>
                      </div>
                    </div>

                    {inCart ? (
                      <div className="flex items-center justify-between bg-slate-950 border border-cyan-500/30 rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(product.id, -1)}
                          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center active:scale-90"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-cyan-400 text-sm">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>+</span> أضف للطلب
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart & Checkout Slide-Over Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between overflow-y-auto">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🛒</span> سلة الطلبات ({cart.length})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">
                  السلة فارغة حالياً. أضف عناصر من المنيو لتأكيد طلبك!
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                        {item.product.price} {currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1 border border-slate-800">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-cyan-500 text-black font-bold text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="p-4 border-t border-slate-800 bg-slate-900/80 space-y-3">
                {/* Order Type Tabs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine_in')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      orderType === 'dine_in' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    🍽️ صالة
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      orderType === 'takeaway' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    🥡 سفري
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      orderType === 'delivery' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    🛵 دليفري
                  </button>
                </div>

                {orderType === 'dine_in' && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">رقم الطاولة:</label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <option key={n} value={n}>طاولة رقم {n}</option>
                      ))}
                    </select>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">عنوان التوصيل:</label>
                    <input
                      type="text"
                      required
                      placeholder="الشارع، رقم المبنى، الشقة، وأقرب علامة مميزة"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">الاسم الكريم:</label>
                    <input
                      type="text"
                      required
                      placeholder="اسمك"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">رقم الهاتف (مصر):</label>
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setPhoneError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {phoneError && (
                  <p className="text-[10px] text-rose-400 font-semibold">{phoneError}</p>
                )}

                {/* Total Summary */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono">{subtotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ضريبة القيمة المضافة (14%):</span>
                    <span className="font-mono">{vatAmount.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-800">
                    <span>الإجمالي المستحق:</span>
                    <span className="text-cyan-400 font-mono">{total.toFixed(2)} {currency}</span>
                  </div>
                </div>

                {/* Submit to WhatsApp & POS */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>{isSubmitting ? 'جاري تجهيز الطلب...' : 'إرسال الطلب فوراً عبر الواتساب ✓'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Success Confirmation Banner */}
      {orderSuccess && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-white shadow-2xl backdrop-blur-xl animate-in fade-in flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-emerald-300">✓ تم تسجيل طلبك بنجاح ({orderSuccess.orderId})</div>
            <div className="text-[11px] text-slate-300">تم إرسال الطلب لمطبخ المطعم وتوجيهه عبر الواتساب</div>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="px-2.5 py-1 rounded-lg bg-emerald-800 text-xs font-bold"
          >
            حسناً
          </button>
        </div>
      )}
    </div>
  );
};
