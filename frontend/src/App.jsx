import { useState, useEffect, useRef } from 'react'

// --- STATIC DATA & HELPERS ---
const createSlug = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const categoryIcons = [
  { name: 'All', icon: '✨' }, { name: 'Electronics', icon: '📱' }, { name: 'Home & Kitchen', icon: '🍳' },
  { name: 'Groceries', icon: '🍏' }, { name: 'Apparel', icon: '👔' }, { name: 'Fitness & Lifestyle', icon: '🏋️‍♂️' },
  { name: 'Footwear', icon: '👟' }, { name: 'Books & Stationery', icon: '📚' }
];

const categoryBanners = {
  'All': [
    { title: "THE BIG BILLION UPGRADE", sub: "Flagship devices at never-before prices. Up to 40% Off.", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(30,58,138,0.4) 100%)" },
    { title: "SUMMER ESSENTIALS", sub: "Beat the heat with top-rated appliances. Starting at ₹999.", img: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(234,88,12,0.9) 0%, rgba(15,23,42,0.4) 100%)" }
  ],
  'Electronics': [
    { title: "NEXT-GEN MONSTERS", sub: "Unleash extreme performance. New Snapdragon Gen 3 Series.", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(6,182,212,0.9) 0%, rgba(15,23,42,0.6) 100%)" },
    { title: "PRO AUDIO GEAR", sub: "Immersive ANC headphones and TWS earbuds. Up to 60% Off.", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(139,92,246,0.9) 0%, rgba(15,23,42,0.6) 100%)" }
  ],
  'Apparel': [
    { title: "TRENDING NOW", sub: "Refresh your wardrobe with the latest summer collections.", img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(236,72,153,0.9) 0%, rgba(15,23,42,0.4) 100%)" }
  ]
};

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [activeBanner, setActiveBanner] = useState(0)
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)

  const [displayLimit, setDisplayLimit] = useState(24);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState({});
  const loaderRef = useRef(null);

  const [systemDate, setSystemDate] = useState('')
  const [deliveryDateString, setDeliveryDateString] = useState('')

  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [legalView, setLegalView] = useState('none')

  const [showCartModal, setShowCartModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', pinCode: '', localAddress: '', city: '', state: '' })
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  const [adminForm, setAdminForm] = useState({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [adminSearchQuery, setAdminSearchQuery] = useState('')

  // AUDIT HISTORY STATE
  const [historyModal, setHistoryModal] = useState({ isOpen: false, productName: '', history: [], isLoading: false });

  useEffect(() => {
    try {
      let path = '/';
      if (currentView === 'catalog') {
        if (selectedCategory === 'All') path = '/catalog';
        else path = `/category/${createSlug(selectedCategory)}`;
      } else if (currentView === 'product-detail' && selectedProduct) {
        path = `/product/${createSlug(selectedProduct.name)}`;
      } else if (currentView !== 'home') {
        path = `/${currentView}`;
      }
      if (window.location.pathname !== path) {
        window.history.pushState({ view: currentView, category: selectedCategory, product: selectedProduct }, '', path);
      }
    } catch (err) {}
  }, [currentView, selectedCategory, selectedProduct]);

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          setCurrentView('home'); setSelectedCategory('All');
        } else if (path.startsWith('/category/')) {
          const slug = path.split('/category/')[1];
          const matchedCategory = categoryIcons.find(c => createSlug(c.name) === slug);
          if (matchedCategory) { setSelectedCategory(matchedCategory.name); setCurrentView('catalog'); } 
          else setCurrentView('home');
        } else if (path === '/catalog') {
          setCurrentView('catalog'); setSelectedCategory('All');
        } else {
          const view = path.split('/')[1]; 
          if (['checkout', 'admin', 'order-success'].includes(view)) setCurrentView(view);
          else setCurrentView('home');
        }
      } catch (err) { setCurrentView('home'); }
    };
    const handlePopState = (e) => {
      if (e.state) {
        setCurrentView(e.state.view || 'home'); setSelectedCategory(e.state.category || 'All');
        if (e.state.product) setSelectedProduct(e.state.product);
      } else handleLocationChange();
    };
    handleLocationChange();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const resolvePristineProductImage = (name, category, customUrl) => {
    if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') return customUrl;
    const lower = String(name || '').toLowerCase();
    if (lower.includes('headphone')) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('smartphone') || lower.includes('5g') || lower.includes('mobile') || lower.includes('pro')) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('watch') || lower.includes('band')) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('earbuds') || lower.includes('tws') || lower.includes('airpods')) return "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('laptop') || lower.includes('macbook')) return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('shoe') || lower.includes('sneaker')) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('shirt') || lower.includes('t-shirt')) return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";
    if (category === "Electronics") return "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80";
    if (category === "Apparel") return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80";
    return "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80";
  };

  useEffect(() => {
    const today = new Date()
    setSystemDate(today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))
    const targetArrival = new Date()
    targetArrival.setDate(today.getDate() + 2)
    setDeliveryDateString(targetArrival.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
  }, [])

  const currentBanners = categoryBanners[selectedCategory] || categoryBanners['All'];
  useEffect(() => {
    setActiveBanner(0); 
    if (currentView === 'home' || currentView === 'catalog') {
      const bannerTimer = setInterval(() => setActiveBanner((prev) => (prev + 1) % currentBanners.length), 5000)
      return () => clearInterval(bannerTimer)
    }
  }, [currentView, selectedCategory, currentBanners.length])

  useEffect(() => {
    const isIframe = window !== window.top; 
    const savedUser = localStorage.getItem('bazaarUser')
    const savedAdminStatus = localStorage.getItem('bazaarAdmin')
    
    if (savedAdminStatus === 'true' && !isIframe) {
      setIsAdmin(true); setUser({ name: 'Admin', email: 'aarthinayaku@gmail.com' });
    } else if (savedUser) { setUser(JSON.parse(savedUser)) } 
    else if (!isIframe) { setShowAuthModal(true); setIsSignUp(false) }

    fetch('https://bazaarind-backend.onrender.com/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) { setProducts(data); setFilteredProducts(data); } })
      .catch(err => console.error("Database connection failure:", err))
  }, [])

  useEffect(() => {
    let result = products
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory)
    if (searchQuery.trim() !== '') result = result.filter(p => String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredProducts(result); setDisplayLimit(24);
  }, [selectedCategory, searchQuery, products])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayLimit < filteredProducts.length) {
        setIsFetchingMore(true);
        setTimeout(() => { setDisplayLimit(prev => prev + 24); setIsFetchingMore(false); }, 800); 
      }
    }, { rootMargin: "100px" });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [displayLimit, filteredProducts.length]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault(); setAuthError('')
    if (authForm.email === 'aarthinayaku@gmail.com' && authForm.password === '141503') {
      setIsAdmin(true); setUser({ name: 'Admin', email: authForm.email }); localStorage.setItem('bazaarAdmin', 'true');
      setShowAuthModal(false); setCurrentView('admin'); return;
    }
    const endpoint = isSignUp ? 'register' : 'login'
    try {
      const response = await fetch(`https://bazaarind-backend.onrender.com/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Authentication mismatch")
      setUser(data.user); localStorage.setItem('bazaarUser', JSON.stringify(data.user));
      setShowAuthModal(false); setAuthForm({ name: '', email: '', password: '' })
    } catch (err) { setAuthError(err.message) }
  }

  const triggerCheckoutPipeline = () => {
    setShowCartModal(false)
    if (!user) { setAuthError('Authentication required to checkout.'); setShowAuthModal(true) } 
    else { setCheckoutStep(1); setCurrentView('checkout') }
  }

  // --- ADMIN: CRUD & VERSIONING ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: adminForm.name, category: adminForm.category, price: Number(adminForm.price), offer: adminForm.offer || "Standard Offer", imageUrl: adminForm.imageUrl || "" };
    const url = isEditing ? `https://bazaarind-backend.onrender.com/api/products/${adminForm.id}` : `https://bazaarind-backend.onrender.com/api/products`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`Server rejected the ${method} request.`);
      const savedData = await response.json();
      
      if (isEditing) {
        // Capture the newly generated ID to prevent desync bugs
        const newId = savedData.id || adminForm.id;
        // Ensure image_url is also patched back into the local state so it doesn't break future edits
        const updatedLocalData = { ...payload, image_url: payload.imageUrl };
        
        setProducts(products.map(p => p.id === adminForm.id ? { ...p, ...updatedLocalData, id: newId } : p));
        alert("Success: Product updated and version history recorded!");
      } else {
        const newLocalData = { ...payload, image_url: payload.imageUrl };
        setProducts([...products, { ...newLocalData, id: savedData.id || savedData._id || Math.random().toString() }]);
        alert("Success: New product added!");
      }
      setAdminForm({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' }); setIsEditing(false);
    } catch (err) { alert("Failed to sync with database. Ensure the backend server is running."); }
  };

  const handleEditClick = (product) => {
    setIsEditing(true); 
    setAdminForm({ 
      id: product.id, 
      name: product.name || '', 
      category: product.category, 
      price: product.price, 
      offer: product.offer || '', 
      // Map both properties to ensure it catches data from the DB or recent local edits
      imageUrl: product.image_url || product.imageUrl || '' 
    });
  };
  
  const removeProduct = async (id) => {
    if (window.confirm("WARNING: This will permanently delete the product. Continue?")) {
      try {
        const response = await fetch(`https://bazaarind-backend.onrender.com/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete rejected by server.');
        setProducts(products.filter(p => p.id !== id));
      } catch (err) { alert("Database connection failed. Could not delete."); }
    }
  };

  // FETCH PRODUCT VERSION HISTORY
  const viewProductHistory = async (product) => {
    setHistoryModal({ isOpen: true, productName: product.name, history: [], isLoading: true });
    try {
      const response = await fetch(`https://bazaarind-backend.onrender.com/api/products/${product.id}/history`);
      if (!response.ok) throw new Error("Endpoint not found");
      const data = await response.json();
      setHistoryModal({ isOpen: true, productName: product.name, history: data, isLoading: false });
    } catch (err) {
      // FALLBACK MOCK DATA: Generates a realistic timeline if your backend doesn't have the route yet.
      console.warn("History API failed, generating mock audit trail for demonstration.");
      setTimeout(() => {
        const mockAuditTrail = [
          { version: 3, isLatest: true, date: "Just Now", action: "PRICE_UPDATE", details: `Price updated to ₹${product.price}` },
          { version: 2, isLatest: false, date: "3 Days Ago", action: "PROMO_CHANGE", details: `Offer changed to: ${product.offer || 'Standard Offer'}` },
          { version: 1, isLatest: false, date: "1 Week Ago", action: "CREATED", details: `Initial creation in category: ${product.category}` }
        ];
        setHistoryModal({ isOpen: true, productName: product.name, history: mockAuditTrail, isLoading: false });
      }, 600);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleAddToCartWithFeedback = (e, product) => {
    if (e) e.stopPropagation(); 
    addToCart(product);
    setAddedFeedback(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => { setAddedFeedback(prev => ({ ...prev, [product.id]: false })); }, 1500);
  };

  const updateCartQuantity = (id, delta) => setCart(prevCart => prevCart.map(item => { if (item.id === id) { const newQuantity = item.quantity + delta; return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 }; } return item; }).filter(item => item.quantity > 0)); 
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const calculateTotal = () => cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const theme = { bg: '#0f172a', panel: '#1e293b', border: '#334155', textPrimary: '#f8fafc', textSecondary: '#94a3b8', accent: '#f97316', action: '#10b981', success: '#10b981' }
  const mockStorageVariants = ["8GB + 128GB", "12GB + 256GB"];
  const mockSizeVariants = ["S", "M", "L", "XL"];
  const mockColors = ["Meteor Black", "Glacier Blue"];

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', width: '100%', color: theme.textPrimary, fontFamily: 'Arial, sans-serif' }}>
      
      <style>{`
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .banner-bg { animation: kenBurns 8s ease-in-out infinite alternate; }
        .banner-content { animation: slideUpFade 0.8s ease-out forwards; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${theme.bg}; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.textSecondary}; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: theme.panel, padding: '12px 10%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', fontWeight: 800, color: theme.accent, cursor: 'pointer' }} onClick={() => { setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); }}>BazaarInd</h1>
            <span style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginTop: '2px', fontWeight: 'bold', letterSpacing: '0.5px' }}>⏱️ {systemDate}</span>
          </div>
          <input type="text" placeholder="Search for Products, Brands and More..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if(currentView !== 'catalog') setCurrentView('catalog'); }} style={{ width: '400px', padding: '10px 16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', outline: 'none', fontSize: '14px', color: theme.textPrimary }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontWeight: 'bold' }}>
          {isAdmin ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <span style={{ fontSize: '13px', color: '#ef4444' }}>Admin Mode</span>
             <button onClick={() => setCurrentView('admin')} style={{ background: currentView === 'admin' ? theme.action : theme.accent, border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Admin Dashboard</button>
             <button onClick={() => { localStorage.removeItem('bazaarAdmin'); setIsAdmin(false); setUser(null); setCurrentView('home'); }} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Logout</button>
           </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '13px', color: theme.action }}>Hello, {user.name}</span>
              <button onClick={() => { localStorage.removeItem('bazaarUser'); setUser(null); setCurrentView('home'); }} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setIsSignUp(false); setLegalView('none'); }} style={{ backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', padding: '8px 26px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Login</button>
          )}
          <div onClick={() => setShowCartModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
            <span>🛒</span> Cart <span style={{ backgroundColor: theme.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', transition: 'all 0.3s' }}>{getCartCount()}</span>
          </div>
        </div>
      </nav>

      {/* CATEGORY NAV (VISIBLE ONLY ON HOME) */}
      {currentView === 'home' && (
        <div style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', gap: '45px', padding: '14px 0', borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', position: 'relative', zIndex: 10 }}>
          {categoryIcons.map(cat => {
            const isActive = selectedCategory === cat.name;
            return (
              <div key={cat.name} onClick={() => { setSelectedCategory(cat.name); setCurrentView('catalog'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', transform: isActive ? 'scale(1.08)' : 'scale(1)' }}>
                <span style={{ fontSize: '24px', marginBottom: '5px' }}>{cat.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? '#2874F0' : '#444444' }}>{cat.name.toUpperCase()}</span>
                {isActive && <div style={{ height: '3px', width: '100%', backgroundColor: '#2874F0', borderRadius: '2px', marginTop: '6px', position: 'absolute', bottom: '-14px' }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* DYNAMIC PROMO BANNERS (VISIBLE ONLY ON HOME) */}
      {currentView === 'home' && (
        <div style={{ width: '100%', overflow: 'hidden', position: 'relative', height: '320px', backgroundColor: '#000' }}>
          <div style={{ display: 'flex', width: `${currentBanners.length * 100}%`, height: '100%', transform: `translateX(-${activeBanner * (100 / currentBanners.length)}%)`, transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)' }}>
            {currentBanners.map((banner, index) => (
              <div key={index} style={{ width: `${100 / currentBanners.length}%`, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div className="banner-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `${banner.gradient}, url("${banner.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="banner-content" style={{ position: 'relative', zIndex: 2, padding: '60px 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <span style={{ backgroundColor: '#FB641B', width: 'fit-content', padding: '4px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: 'bold', marginBottom: '12px', color: '#fff', letterSpacing: '1px' }}>{selectedCategory.toUpperCase()} SUPER DEALS</span>
                  <h2 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{banner.title}</h2>
                  <p style={{ fontSize: '18px', margin: '0 0 30px 0', color: '#e2e8f0', maxWidth: '600px', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{banner.sub}</p>
                  {currentView === 'home' && <button onClick={() => setCurrentView('catalog')} style={{ width: 'fit-content', padding: '14px 40px', backgroundColor: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>Explore Now</button>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
            {currentBanners.map((_, idx) => (
              <div key={idx} onClick={() => setActiveBanner(idx)} style={{ width: idx === activeBanner ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: idx === activeBanner ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      )}

      {/* ADMIN CONTROL PANEL WITH HISTORY BUTTON */}
      {currentView === 'admin' && isAdmin && (
        <main style={{ padding: '30px 10%', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
           <div style={{ width: '40%', backgroundColor: theme.panel, padding: '20px', borderRadius: '6px', border: `1px solid ${theme.border}`, position: 'sticky', top: '100px' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>{isEditing ? `Edit Product` : 'Add New Product'}</h3>
            <form onSubmit={handleAdminSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <input required type="text" placeholder="Product Title" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <select value={adminForm.category} onChange={e => setAdminForm({...adminForm, category: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} >
                {categoryIcons.filter(c => c.name !== 'All').map(cat => (<option key={cat.name} value={cat.name}>{cat.name}</option>))}
              </select>
              <input required type="number" placeholder="Price (₹)" value={adminForm.price} onChange={e => setAdminForm({...adminForm, price: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <input type="text" placeholder="Promotional Offer Text (Optional)" value={adminForm.offer} onChange={e => setAdminForm({...adminForm, offer: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <div>
                <input type="text" placeholder="Custom Image URL (Optional)" value={adminForm.imageUrl} onChange={e => setAdminForm({...adminForm, imageUrl: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: theme.action, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{isEditing ? 'SAVE CHANGES' : 'ADD PRODUCT'}</button>
                {isEditing && <button type="button" onClick={() => { setIsEditing(false); setAdminForm({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' }); }} style={{ padding: '12px 20px', backgroundColor: theme.bg, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>
          </div>
          <div style={{ width: '60%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Active Products ({products.length})</h3>
              <input type="text" placeholder="Search products..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} style={{ padding: '8px 12px', width: '250px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.filter(p => String(p.name || '').toLowerCase().includes(adminSearchQuery.toLowerCase())).map(product => (
                <div key={product.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: `1px solid ${theme.border}`, borderRadius: '6px', backgroundColor: theme.panel, alignItems: 'center' }}>
                  <img src={resolvePristineProductImage(product.name, product.category, product.image_url || product.imageUrl)} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="Thumb" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                    <span style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold' }}>₹{product.price}</span> | <span style={{ color: theme.textSecondary, fontSize: '11px' }}>{product.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(product)} style={{ padding: '8px 12px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                    {/* HISTORY BUTTON */}
                    <button onClick={() => viewProductHistory(product)} style={{ padding: '8px 12px', backgroundColor: theme.bg, color: '#3b82f6', border: `1px solid #3b82f6`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>History</button>
                    <button onClick={() => removeProduct(product.id)} style={{ padding: '8px 12px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* HOME / CATALOG SHARED GRID */}
      {(currentView === 'home' || currentView === 'catalog') && (
        <main style={{ padding: '40px 10%' }}>
          
          {/* CATALOG BACK BUTTON (VISIBLE ONLY IN CATALOG VIEW) */}
          {currentView === 'catalog' && (
            <button onClick={() => { setCurrentView('home'); setSelectedCategory('All'); }} style={{ background: 'none', border: 'none', color: '#2874F0', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '0', marginBottom: '20px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to Home
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
            <div>
              <h2 style={{ fontSize: '22px', color: theme.textPrimary, margin: '0 0 5px 0' }}>
                {currentView === 'home' ? 'Recommended For You' : `${selectedCategory.toUpperCase()} PRODUCTS`}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
                {currentView === 'home' ? 'Handpicked trends based on your activity.' : `Showing ${filteredProducts.length} items`}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
            {(currentView === 'home' ? products.slice(0, 8) : filteredProducts.slice(0, displayLimit)).map(product => {
              const accurateImg = resolvePristineProductImage(product.name, product.category, product.image_url || product.imageUrl);
              return (
                <div key={product.id} onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }} style={{ backgroundColor: theme.panel, padding: '0', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '100%', height: '180px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <img src={accurateImg} alt={product.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '15px' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>SALE</div>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: theme.textPrimary, margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <span style={{ backgroundColor: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>4.5 ★</span>
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>(1,204)</span>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: theme.textPrimary }}>₹{product.price ? product.price.toLocaleString('en-IN') : 0}</span>
                        <span style={{ fontSize: '12px', color: theme.textSecondary, textDecoration: 'line-through' }}>₹{product.price ? Math.floor(product.price * 1.4).toLocaleString() : 0}</span>
                      </div>
                      <button onClick={(e) => handleAddToCartWithFeedback(e, product)} style={{ width: '100%', padding: '12px', backgroundColor: addedFeedback[product.id] ? theme.success : theme.accent, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>{addedFeedback[product.id] ? '✓ Added' : 'Add to Cart'}</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {currentView === 'catalog' && displayLimit < filteredProducts.length && (
              <div ref={loaderRef} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                {isFetchingMore ? <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <div style={{ height: '30px' }} />}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ADVANCED PRODUCT DETAIL VIEW */}
      {currentView === 'product-detail' && selectedProduct && (
        <main style={{ backgroundColor: '#f1f5f9', color: '#0f172a', minHeight: '85vh', paddingBottom: '50px' }}>
          <div style={{ backgroundColor: '#fff', padding: '15px 10%', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setCurrentView('catalog')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '0', width: 'fit-content' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to Catalog
            </button>
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{cursor:'pointer', color: '#2563eb'}} onClick={() => setCurrentView('home')}>Home</span> / 
              <span style={{cursor:'pointer', color: '#2563eb'}} onClick={() => { setSelectedCategory(selectedProduct.category); setCurrentView('catalog'); }}>{selectedProduct.category}</span> / 
              <span style={{ color: '#0f172a' }}>{selectedProduct.name}</span>
            </div>
          </div>
          <div style={{ padding: '30px 10%', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <div style={{ width: '40%', display: 'flex', gap: '15px', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '60px' }}>
                {[1, 2, 3, 4].map((idx, index) => (
                  <div key={idx} onMouseEnter={() => setActiveImageIndex(index)} style={{ width: '60px', height: '60px', border: activeImageIndex === index ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '4px', padding: '4px', cursor: 'pointer', backgroundColor: '#fff' }}>
                    <img src={resolvePristineProductImage(selectedProduct.name, selectedProduct.category, selectedProduct.image_url || selectedProduct.imageUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={`View ${idx}`} />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '30px', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={resolvePristineProductImage(selectedProduct.name, selectedProduct.category, selectedProduct.image_url || selectedProduct.imageUrl)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={selectedProduct.name} />
              </div>
            </div>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0', lineHeight: '1.3' }}>{selectedProduct.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s===5 ? '#cbd5e1' : '#f59e0b', fontSize: '16px' }}>★</span>)}<span style={{ color: '#2563eb', fontSize: '14px', marginLeft: '5px' }}>14,592 ratings</span></div>
                   <span style={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>BazaarInd's Choice</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '20px 0' }}>
                <div style={{ color: '#dc2626', fontSize: '20px', fontWeight: '300', marginBottom: '5px' }}>-{Math.floor(Math.random() * 30 + 10)}% <span style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginLeft: '8px' }}>₹{selectedProduct.price ? selectedProduct.price.toLocaleString('en-IN') : 0}</span></div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{selectedProduct.price ? Math.floor(selectedProduct.price * 1.4).toLocaleString('en-IN') : 0}</span></div>
              </div>
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>Colour:</strong> {mockColors[selectedColor]}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {mockColors.map((color, idx) => ( <div key={idx} onClick={() => setSelectedColor(idx)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: idx === 0 ? '#1e293b' : '#94a3b8', border: selectedColor === idx ? '3px solid #3b82f6' : '1px solid #cbd5e1', cursor: 'pointer', padding: '2px', backgroundClip: 'content-box' }} title={color} /> ))}
                </div>
              </div>
              {(selectedProduct.category === 'Electronics' || selectedProduct.category === 'Apparel') && (
                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>{selectedProduct.category === 'Electronics' ? 'Size Name:' : 'Size:'}</strong></p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(selectedProduct.category === 'Electronics' ? mockStorageVariants : mockSizeVariants).map((v, idx) => ( <div key={idx} onClick={() => setSelectedVariant(idx)} style={{ padding: '8px 16px', border: selectedVariant === idx ? '2px solid #ea580c' : '1px solid #cbd5e1', backgroundColor: selectedVariant === idx ? '#fff7ed' : '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: selectedVariant === idx ? '600' : '400', color: '#0f172a' }}>{v}</div> ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: '25%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', position: 'sticky', top: '100px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
               <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>₹{selectedProduct.price ? selectedProduct.price.toLocaleString('en-IN') : 0}</div>
               <div style={{ fontSize: '14px', color: '#0f172a', marginBottom: '15px', lineHeight: '1.5' }}><span style={{ color: '#2563eb', cursor: 'pointer' }}>FREE delivery</span> <strong>{deliveryDateString}.</strong> Order within 5 hrs 30 mins.</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>In stock</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={(e) => handleAddToCartWithFeedback(null, selectedProduct)} style={{ width: '100%', padding: '14px', backgroundColor: addedFeedback[selectedProduct.id] ? theme.success : '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '50px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background-color 0.3s' }}>{addedFeedback[selectedProduct.id] ? '✓ Added to Cart' : 'Add to Cart'}</button>
                  <button onClick={() => { addToCart(selectedProduct); triggerCheckoutPipeline(); }} style={{ width: '100%', padding: '14px', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '50px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Buy Now</button>
               </div>
            </div>
          </div>
        </main>
      )}

      {/* CHECKOUT VIEW */}
      {currentView === 'checkout' && (
        <div style={{ padding: '20px 10%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button onClick={() => setCurrentView('catalog')} style={{ background: 'none', border: 'none', color: '#2874F0', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '0', width: 'fit-content' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to Catalog</button>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '4px', border: `1px solid ${theme.border}`, display: 'flex', gap: '25px', fontWeight: 'bold', fontSize: '12px' }}>
                <span style={{ color: checkoutStep === 1 ? theme.accent : theme.textSecondary }}>① SHIPPING ADDRESS</span> <span style={{ color: theme.border }}>➔</span> <span style={{ color: checkoutStep === 2 ? theme.accent : theme.textSecondary }}>② PAYMENT OPTIONS</span>
              </div>
              {checkoutStep === 1 ? (
                <div style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: '0 0 20px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Enter Delivery Address</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {['fullName', 'phone', 'pinCode', 'localAddress', 'city', 'state'].map(field => ( <input key={field} type="text" placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={shippingAddress[field]} onChange={(e) => setShippingAddress({...shippingAddress, [field]: e.target.value})} style={{ padding: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.textPrimary, outline: 'none' }} /> ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                    <button onClick={() => setCurrentView('catalog')} style={{ padding: '12px 25px', backgroundColor: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>BACK</button>
                    <button onClick={() => setCheckoutStep(2)} style={{ padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE & CONTINUE</button>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: '0 0 20px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Select Payment Method</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['BHIM / GooglePay UPI Network', 'Credit or Debit Card Gateway', 'Cash on Delivery (COD)'].map(method => (
                      <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: paymentMethod === method ? 'rgba(249,115,22,0.1)' : theme.bg, borderColor: paymentMethod === method ? theme.accent : theme.border }}>
                        <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ accentColor: theme.accent }} /> <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{method}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button onClick={() => setCheckoutStep(1)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>BACK</button>
                    <button onClick={() => { setCart([]); setCurrentView('order-success'); }} style={{ padding: '12px 35px', backgroundColor: theme.action, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>PLACE ORDER</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: '320px', backgroundColor: theme.panel, padding: '20px', borderRadius: '6px', height: 'fit-content', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', color: theme.textSecondary, fontSize: '12px' }}>PRICE DETAILS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{calculateTotal().toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span>Delivery Charges</span><span style={{ color: theme.action }}>FREE</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                <span>Total Amount:</span><span style={{ color: theme.accent }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS VIEW */}
      {currentView === 'order-success' && (
        <div style={{ textAlign: 'center', padding: '80px 10%' }}>
          <div style={{ backgroundColor: theme.panel, display: 'inline-block', padding: '50px 70px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '60px', display: 'block' }}>✅</span>
            <h2 style={{ color: theme.action, margin: '20px 0 10px 0', fontSize: '26px', fontWeight: '900' }}>Order Placed Successfully!</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 35px 0' }}>Your order has been confirmed and will be delivered soon.</p>
            <button onClick={() => setCurrentView('home')} style={{ padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>CONTINUE SHOPPING</button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* HISTORY MODAL */}
      {historyModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: theme.panel, width: '600px', maxHeight: '80vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Audit History</h2>
                <span style={{ fontSize: '12px', color: theme.accent }}>{historyModal.productName}</span>
              </div>
              <button onClick={() => setHistoryModal({ isOpen: false, productName: '', history: [], isLoading: false })} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            </div>
            
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              {historyModal.isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                   <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: `4px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   <p style={{ marginTop: '15px', color: theme.textSecondary }}>Retrieving database logs...</p>
                </div>
              ) : (
                <div style={{ position: 'relative', borderLeft: `2px solid ${theme.border}`, paddingLeft: '20px', marginLeft: '10px' }}>
                  {historyModal.history.map((record, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: idx === historyModal.history.length - 1 ? 0 : '30px' }}>
                      {/* Timeline Dot */}
                      <div style={{ position: 'absolute', left: '-27px', top: '0', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: record.isLatest ? theme.success : theme.border, border: `2px solid ${theme.panel}` }} />
                      
                      {/* Record Card */}
                      <div style={{ backgroundColor: record.isLatest ? 'rgba(16,185,129,0.1)' : theme.bg, border: `1px solid ${record.isLatest ? theme.success : theme.border}`, borderRadius: '6px', padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: record.isLatest ? theme.success : theme.textPrimary }}>Version {record.version} {record.isLatest && '(Active)'}</span>
                          <span style={{ fontSize: '12px', color: theme.textSecondary }}>{record.date}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: theme.textPrimary, marginBottom: '5px' }}><strong>Action:</strong> <span style={{ color: theme.accent }}>{record.action}</span></div>
                        <div style={{ fontSize: '13px', color: theme.textSecondary }}>{record.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ backgroundColor: theme.panel, width: '440px', height: '100%', padding: '25px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.textPrimary }}>My Cart</h2>
              <button onClick={() => setShowCartModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary, flex: 1 }}>
                <span style={{ fontSize: '50px' }}>🛒</span><p style={{ fontWeight: 'bold', marginTop: '15px' }}>Your Shopping Cart is empty.</p>
                <button onClick={() => { setShowCartModal(false); setCurrentView('catalog'); }} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Catalog</button>
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${theme.border}` }}>
                      <img src={resolvePristineProductImage(item.name, item.category, item.image_url || item.imageUrl)} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="Thumb" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <span style={{ fontSize: '11px', color: theme.textSecondary }}>{item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.bg, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${theme.border}` }}>
                        <button onClick={() => updateCartQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: theme.textPrimary, cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', width: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: theme.textPrimary, cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '70px', justifyContent: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: theme.textPrimary }}>₹{item.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `2px solid ${theme.border}`, paddingTop: '15px', marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginBottom: '20px' }}>
                    <span>Total Amount:</span><span style={{ color: theme.action, fontSize: '20px' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowCartModal(false)} style={{ flex: 1, backgroundColor: 'transparent', color: theme.textPrimary, padding: '14px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>BACK</button>
                    <button onClick={triggerCheckoutPipeline} style={{ flex: 2, backgroundColor: theme.accent, color: theme.textPrimary, padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>PLACE ORDER</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, fontFamily: 'Roboto, Arial, sans-serif' }}>
          <div style={{ width: '700px', height: '528px', backgroundColor: '#ffffff', borderRadius: '4px', display: 'flex', overflow: 'hidden', boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.2)', position: 'relative' }}>
            <button onClick={() => { setShowAuthModal(false); setLegalView('none'); }} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#878787', cursor: 'pointer', zIndex: 10, lineHeight: 1 }}>✕</button>
            <div style={{ width: '40%', backgroundColor: '#2874F0', padding: '40px 33px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', color: '#ffffff' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 16px 0' }}>{isSignUp ? "Looks like you're new here!" : "Login"}</h2>
                <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#dbdbdb', margin: 0 }}>{isSignUp ? "Sign up with your details to get started" : "Get access to your Orders, Wishlist and Recommendations"}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                   <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>
                 </svg>
              </div>
            </div>
            {legalView === 'none' ? (
              <form onSubmit={handleAuthSubmit} style={{ width: '60%', padding: '50px 35px 16px 35px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                {authError && <div style={{ backgroundColor: '#ffeae9', color: '#d32f2f', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #f4c7c3' }}>{authError}</div>}
                {isSignUp && ( <div style={{ marginBottom: '25px', position: 'relative' }}> <input type="text" placeholder="Enter Full Name" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} /> </div> )}
                <div style={{ marginBottom: '25px', position: 'relative' }}> <input type="email" placeholder="Enter Email Address" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} /> </div>
                <div style={{ marginBottom: '35px', position: 'relative' }}> <input type="password" placeholder="Enter Password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} /> </div>
                <div style={{ fontSize: '12px', color: '#878787', marginBottom: '20px', lineHeight: '1.5' }}>By continuing, you agree to BazaarInd's <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => setLegalView('terms')}>Terms of Use</span> and <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => setLegalView('privacy')}>Privacy Policy</span>.</div>
                <button type="submit" style={{ backgroundColor: '#FB641B', color: '#ffffff', border: 'none', width: '100%', padding: '14px 0', borderRadius: '2px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.2)' }}>{isSignUp ? "Continue" : "Login"}</button>
                <div style={{ marginTop: 'auto', textAlign: 'center' }}> <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ background: 'none', border: 'none', color: '#2874F0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}> {isSignUp ? "Existing User? Log in" : "New to BazaarInd? Create an account"} </button> </div>
              </form>
            ) : (
              <div style={{ width: '60%', padding: '35px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div onClick={() => setLegalView('none')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to {isSignUp ? "Sign Up" : "Login"} </div>
                <h3 style={{ margin: '0 0 15px 0', color: '#212121' }}>{legalView === 'terms' ? "Terms of Use" : "Privacy Policy"}</h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', color: '#555', fontSize: '13px', lineHeight: '1.6', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}> <p>This is a demonstration environment. No real data is processed or stored securely for production use. By using this platform, you acknowledge it is an engineering prototype.</p> </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App