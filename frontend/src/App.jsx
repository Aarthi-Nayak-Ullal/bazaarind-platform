import { useState, useEffect } from 'react'

function App() {
  // Navigation & Core System State Vectors
  const [currentView, setCurrentView] = useState('home')
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  
  // PRODUCT DETAIL PAGE STATE TRACKERS
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(1)

  // Dynamic Real-Time Calendar Strings
  const [systemDate, setSystemDate] = useState('')
  const [deliveryDateString, setDeliveryDateString] = useState('')

  // User Space Authentication Registers
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [legalView, setLegalView] = useState('none')

  // Transaction Flight Modals
  const [showCartModal, setShowCartModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', pinCode: '', localAddress: '', city: '', state: '' })
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // ADMIN STATE CONTROLS
  const [adminForm, setAdminForm] = useState({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' })
  const [isEditing, setIsEditing] = useState(false)

  // Rotating Billboard Dashboard Cover Arrays
  const [activeBanner, setActiveBanner] = useState(0)
  const promoBanners = [
    { title: "EXCLUSIVE DEALS FOR YOU", sub: "Flat 10% Off Up to ₹100 Coupon Applied Automatically", img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(40,116,240,0.9) 0%, rgba(15,23,42,0.4) 100%)" },
    { title: "JUNE EPIC HIGH-HARDWARE SALE", sub: "Flat 60% Off Premium Audio Kits & Smart Wearable Components", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(251,100,27,0.9) 0%, rgba(15,23,42,0.4) 100%)" },
    { title: "SMARTEST SUMMER ECO DEALS", sub: "Power every step with upgraded processing and storage cells", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", gradient: "linear-gradient(90deg, rgba(16,185,129,0.9) 0%, rgba(15,23,42,0.4) 100%)" }
  ]

  const categoryIcons = [
    { name: 'All', icon: '✨' }, { name: 'Electronics', icon: '📱' }, { name: 'Home & Kitchen', icon: '🍳' },
    { name: 'Groceries', icon: '🍏' }, { name: 'Apparel', icon: '👔' }, { name: 'Fitness & Lifestyle', icon: '🏋️‍♂️' },
    { name: 'Footwear', icon: '👟' }, { name: 'Books & Stationery', icon: '📚' }
  ]

  const resolvePristineProductImage = (name, category, customUrl) => {
    if (customUrl && customUrl.trim() !== '') return customUrl;
    const lower = name.toLowerCase();
    
    if (lower.includes('headphone')) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('smartphone') || lower.includes('5g')) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('smartwatch') || lower.includes('watch')) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('earbuds') || lower.includes('tws')) return "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('keyboard')) return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80";
    if (category === "Books & Stationery") return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
  };

  useEffect(() => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    const today = new Date()
    setSystemDate(today.toLocaleDateString('en-IN', options))
    const targetArrival = new Date()
    targetArrival.setDate(today.getDate() + 2)
    setDeliveryDateString(targetArrival.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
  }, [])

  useEffect(() => {
    if (currentView === 'home') {
      const bannerTimer = setInterval(() => setActiveBanner((prev) => (prev + 1) % promoBanners.length), 5000)
      return () => clearInterval(bannerTimer)
    }
  }, [currentView, promoBanners.length])

  // COLD BOOT WITH IFRAME DETECTION
  useEffect(() => {
    const isIframe = window !== window.top; 
    const savedUser = localStorage.getItem('bazaarUser')
    const savedAdminStatus = localStorage.getItem('bazaarAdmin')
    
    if (savedAdminStatus === 'true' && !isIframe) {
      setIsAdmin(true);
      setUser({ name: 'Admin', email: 'aarthinayaku@gmail.com' });
      setCurrentView('admin');
    } else if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else if (!isIframe) {
      setShowAuthModal(true)
      setIsSignUp(false)
    }

    fetch('https://bazaarind-backend.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data)
          setFilteredProducts(data)
        }
      })
      .catch(err => console.error("Database cloud cluster stream failure:", err))
  }, [])

  useEffect(() => {
    let result = products
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory)
    if (searchQuery.trim() !== '') result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredProducts(result)
  }, [selectedCategory, searchQuery, products])

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (authForm.email === 'aarthinayaku@gmail.com' && authForm.password === '141503') {
      setIsAdmin(true);
      setUser({ name: 'Admin', email: authForm.email });
      localStorage.setItem('bazaarAdmin', 'true');
      setShowAuthModal(false);
      setCurrentView('admin'); 
      return;
    }

    const endpoint = isSignUp ? 'register' : 'login'
    try {
      const response = await fetch(`https://bazaarind-backend.onrender.com/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Authentication mismatch")
      
      setUser(data.user)
      localStorage.setItem('bazaarUser', JSON.stringify(data.user))
      setShowAuthModal(false)
      setAuthForm({ name: '', email: '', password: '' })
    } catch (err) {
      setAuthError(err.message)
    }
  }

  const triggerCheckoutPipeline = () => {
    setShowCartModal(false)
    if (!user) {
      setAuthError('Authentication required to checkout.')
      setShowAuthModal(true)
    } else {
      setCheckoutStep(1)
      setCurrentView('checkout')
    }
  }

  // --- FULL CRUD ADMIN HELPER FUNCTIONS ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `https://bazaarind-backend.onrender.com/api/products/${adminForm.id}` 
      : `https://bazaarind-backend.onrender.com/api/products`;
    
    const method = isEditing ? 'PUT' : 'POST';
    
    const payload = {
      name: adminForm.name,
      category: adminForm.category,
      price: Number(adminForm.price),
      offer: adminForm.offer || "Standard Network Route",
      imageUrl: adminForm.imageUrl || ""
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (isEditing) {
        setProducts(products.map(p => p.id === adminForm.id ? { ...p, ...payload } : p));
        alert("Product updated successfully!");
      } else {
        setProducts([...products, { id: data.id || Math.random().toString(), ...payload }]);
        alert("New product created!");
      }
      
      setAdminForm({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' });
      setIsEditing(false);
    } catch (err) {
      console.error("Operation failed", err);
    }
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setAdminForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      offer: product.offer || '',
      imageUrl: product.imageUrl || ''
    });
  };
  
  const removeProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`https://bazaarind-backend.onrender.com/api/products/${id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  const updateCartQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
      }
      return item;
    }).filter(item => item.quantity > 0)); 
  };
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const theme = { bg: '#0f172a', panel: '#1e293b', border: '#334155', textPrimary: '#f8fafc', textSecondary: '#94a3b8', accent: '#f97316', action: '#10b981' }

  // 3.6 SPLIT-SCREEN ADMIN CONTROL PANEL VIEW
  if (currentView === 'admin' && isAdmin) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ width: '55%', overflowY: 'auto', padding: '30px', borderRight: `2px solid ${theme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: theme.accent, margin: '0 0 5px 0' }}>BazaarInd Command Center</h1>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: 0 }}>Full Spectrum Database Controls</p>
            </div>
            <button onClick={() => setCurrentView('home')} style={{ padding: '8px 16px', backgroundColor: theme.panel, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Exit Admin</button>
          </div>

          <div style={{ backgroundColor: theme.panel, padding: '20px', borderRadius: '6px', border: `1px solid ${theme.border}`, marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
              {isEditing ? `Editing Product: ${adminForm.id}` : 'Create New Product Record'}
            </h3>
            <form onSubmit={handleAdminSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input required type="text" placeholder="Product Title" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <select value={adminForm.category} onChange={e => setAdminForm({...adminForm, category: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }}>
                {categoryIcons.filter(c => c.name !== 'All').map(cat => (<option key={cat.name} value={cat.name}>{cat.name}</option>))}
              </select>
              <input required type="number" placeholder="Price (₹)" value={adminForm.price} onChange={e => setAdminForm({...adminForm, price: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <input type="text" placeholder="Promotional Offer Text (e.g., Flat 50% Off)" value={adminForm.offer} onChange={e => setAdminForm({...adminForm, offer: e.target.value})} style={{ padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <input type="text" placeholder="Custom Image URL (Leave blank for default system image)" value={adminForm.imageUrl} onChange={e => setAdminForm({...adminForm, imageUrl: e.target.value})} style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: theme.action, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{isEditing ? 'COMMIT UPDATES' : 'INJECT NEW RECORD'}</button>
                {isEditing && <button type="button" onClick={() => { setIsEditing(false); setAdminForm({ id: '', name: '', category: 'Electronics', price: '', offer: '', imageUrl: '' }); }} style={{ padding: '12px 20px', backgroundColor: theme.bg, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>
          </div>
          
          <h3 style={{ margin: '0 0 15px 0' }}>Active Registry Nodes ({products.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {products.map(product => (
              <div key={product.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: `1px solid ${theme.border}`, borderRadius: '6px', backgroundColor: theme.panel, alignItems: 'center' }}>
                <img src={resolvePristineProductImage(product.name, product.category, product.imageUrl)} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="Thumb" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                  <span style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold' }}>₹{product.price}</span> | <span style={{ color: theme.textSecondary, fontSize: '11px' }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditClick(product)} style={{ padding: '8px 12px', backgroundColor: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                  <button onClick={() => removeProduct(product.id)} style={{ padding: '8px 12px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '45%', height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '10px', backgroundColor: theme.accent, color: '#fff', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', zIndex: 10 }}>🟢 LIVE STOREFRONT PREVIEW</div>
          <iframe src={window.location.origin} title="Live Preview" style={{ width: '100%', height: '100%', border: 'none', paddingTop: '34px' }} />
        </div>
      </div>
    );
  }

  // ======================================================================
  // STANDARD USER VIEWPORT BELOW (Home, Catalog, Checkout, etc.)
  // ======================================================================
  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', width: '100%', color: theme.textPrimary, fontFamily: 'Arial, sans-serif' }}>
      
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
             <button onClick={() => setCurrentView('admin')} style={{ background: theme.accent, border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Control Panel</button>
             <button onClick={() => { localStorage.removeItem('bazaarAdmin'); setIsAdmin(false); setUser(null); setCurrentView('home'); }} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Disconnect</button>
           </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '13px', color: theme.action }}>Secure User: {user.name}</span>
              <button onClick={() => { localStorage.removeItem('bazaarUser'); setUser(null); setCurrentView('home'); }} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setIsSignUp(false); setLegalView('none'); }} style={{ backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', padding: '8px 26px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Login</button>
          )}
          <div onClick={() => setShowCartModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
            <span>🛒</span> Cart <span style={{ backgroundColor: theme.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{getCartCount()}</span>
          </div>
        </div>
      </nav>

      <div style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', gap: '45px', padding: '14px 0', borderBottom: `1px solid ${theme.border}`, overflowX: 'auto' }}>
        {categoryIcons.map(cat => {
          const isActive = selectedCategory === cat.name && (currentView === 'catalog' || currentView === 'product-detail');
          return (
            <div key={cat.name} onClick={() => { setSelectedCategory(cat.name); setCurrentView('catalog'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', transform: isActive ? 'scale(1.08)' : 'scale(1)' }}>
              <span style={{ fontSize: '24px', marginBottom: '5px' }}>{cat.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? '#2874F0' : '#444444' }}>{cat.name.toUpperCase()}</span>
            </div>
          );
        })}
      </div>

      {currentView === 'home' && (
        <div style={{ padding: '25px 10%', display: 'flex', flexDirection: 'column', gap: '35px' }}>
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px', border: `1px solid ${theme.border}`, position: 'relative', height: '280px' }}>
            <div style={{ display: 'flex', width: `${promoBanners.length * 100}%`, height: '100%', transform: `translateX(-${activeBanner * (100 / promoBanners.length)}%)`, transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {promoBanners.map((banner, index) => (
                <div key={index} style={{ width: `${100 / promoBanners.length}%`, height: '100%', backgroundImage: `${banner.gradient}, url("${banner.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ backgroundColor: '#FB641B', width: 'fit-content', padding: '4px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>BAZAARIND OFFER MODE</span>
                  <h2 style={{ fontSize: '34px', margin: '0 0 8px 0', fontWeight: '900', color: '#ffffff' }}>{banner.title}</h2>
                  <p style={{ fontSize: '16px', margin: '0 0 24px 0', color: '#e0e0e0' }}>{banner.sub}</p>
                  <button onClick={() => setCurrentView('catalog')} style={{ width: 'fit-content', padding: '12px 35px', backgroundColor: '#2874F0', color: '#ffffff', border: 'none', borderRadius: '2px', fontWeight: 'bold', cursor: 'pointer' }}>Shop Now</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: theme.panel, padding: '24px', borderRadius: '4px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.textPrimary }}>Algorithmic Core Recommendations 🔥</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: theme.textSecondary }}>High-density records verified for sudden volume markdown routing.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {products.slice(0, 4).map((product) => {
                const accurateImg = resolvePristineProductImage(product.name, product.category, product.imageUrl);
                return (
                  <div key={product.id} onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }} style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '15px', textAlign: 'center', cursor: 'pointer', backgroundColor: theme.bg }}>
                    <div style={{ width: '100%', height: '110px', overflow: 'hidden', borderRadius: '4px', marginBottom: '10px', backgroundColor: theme.panel }}>
                      <img src={accurateImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Asset" />
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                    <p style={{ margin: '4px 0', color: theme.action, fontWeight: 'bold', fontSize: '13px' }}>{product.offer || "Flat 70% Off System Channels"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {currentView === 'catalog' && (
        <main style={{ padding: '30px 10%' }}>
          <h2 style={{ fontSize: '20px', color: theme.textPrimary, marginBottom: '2px' }}>{selectedCategory.toUpperCase()} REGISTRY INDEX</h2>
          <p style={{ margin: '0 0 25px 0', fontSize: '12px', color: theme.textSecondary }}>Resolved Node Count Capacity: {filteredProducts.length} entries streaming live</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredProducts.map(product => {
              const accurateImg = resolvePristineProductImage(product.name, product.category, product.imageUrl);
              return (
                <div key={product.id} onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }} style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '6px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '350px', cursor: 'pointer' }}>
                  <div>
                    <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '4px', marginBottom: '12px', backgroundColor: theme.bg }}>
                      <img src={accurateImg} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <span style={{ fontSize: '11px', color: theme.action, display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>{product.offer || "Express Network Delivery"}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '4px 0' }}>₹{product.price.toLocaleString('en-IN')}</p>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} style={{ width: '100%', padding: '10px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* REBUILT PRODUCT DETAIL VIEWPORT */}
      {currentView === 'product-detail' && selectedProduct && (
        <main style={{ padding: '20px 10%', backgroundColor: '#ffffff', color: '#000000', minHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <button onClick={() => setCurrentView('catalog')} style={{ background: 'none', border: 'none', color: '#2874F0', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Catalog
            </button>
            <div style={{ fontSize: '12px', color: '#878787', borderLeft: '1px solid #e0e0e0', paddingLeft: '20px' }}>
              <span style={{cursor:'pointer'}} onClick={() => setCurrentView('home')}>Home</span> &gt; <span style={{cursor:'pointer'}} onClick={() => { setSelectedCategory(selectedProduct.category); setCurrentView('catalog'); }}>{selectedProduct.category}</span> &gt; <span style={{ color: '#878787' }}>{selectedProduct.name}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', position: 'sticky', top: '80px', height: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '10px', height: '450px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '64px', overflowY: 'auto' }}>
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} onMouseEnter={() => setActiveImageIndex(idx)} style={{ width: '64px', height: '64px', border: activeImageIndex === idx ? '2px solid #2874F0' : '1px solid #f0f0f0', padding: '2px', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <img src={resolvePristineProductImage(selectedProduct.name, selectedProduct.category, selectedProduct.imageUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="thumb" />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, border: '1px solid #f0f0f0', padding: '20px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={resolvePristineProductImage(selectedProduct.name, selectedProduct.category, selectedProduct.imageUrl)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Main Product" />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#c2c2c2', cursor: 'pointer', fontSize: '18px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.1)' }}>❤</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => addToCart(selectedProduct)} style={{ flex: 1, padding: '16px 0', backgroundColor: '#ff9f00', color: '#fff', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.004-.05-.004-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" fill="#fff"></path></svg>
                  ADD TO CART
                </button>
                <button onClick={() => { addToCart(selectedProduct); triggerCheckoutPipeline(); }} style={{ flex: 1, padding: '16px 0', backgroundColor: '#fb641b', color: '#fff', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,.2)' }}>
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="white"><path d="M11.666 12.336l-1.996-3.79 3.018-2.65L7.33 4.88 5.667 1.33 4.004 4.88 1.332 5.895l3.018 2.65-1.995 3.79 4.312-1.996 4.312 1.996h-.313z" fill="#fff"></path></svg>
                  BUY NOW
                </button>
              </div>
            </div>

            <div style={{ width: '60%', paddingLeft: '15px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '400', color: '#212121', margin: '0 0 10px 0', lineHeight: '1.4' }}>{selectedProduct.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: '#388e3c', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px', display: 'flex', alignItems: 'center' }}>4.3 ★</span>
                <span style={{ fontSize: '14px', color: '#878787', fontWeight: '500' }}>1,917 Ratings & 234 Reviews</span>
                <span style={{ color: '#2874F0', fontSize: '14px', fontWeight: 'bold' }}>Assured Partner Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '5px' }}>
                <span style={{ fontSize: '28px', fontWeight: '500', color: '#212121' }}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '16px', color: '#878787', textDecoration: 'line-through' }}>₹{(Math.floor(selectedProduct.price * 1.35)).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '16px', color: '#388e3c', fontWeight: 'bold' }}>{selectedProduct.offer || "Special Price"}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#212121', marginBottom: '25px' }}>+ ₹86 Protect Promise Fee</div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '10px' }}>Available offers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><span style={{ color: '#388e3c', fontWeight: 'bold' }}>🏷️</span> <span><strong style={{fontWeight: 600}}>Bank Offer</strong> 5% Cashback on BazaarInd Axis Bank Card</span></div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><span style={{ color: '#388e3c', fontWeight: 'bold' }}>🏷️</span> <span><strong style={{fontWeight: 600}}>Special Price</strong> Get extra 10% off (price inclusive of cashback/coupon)</span></div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><span style={{ color: '#388e3c', fontWeight: 'bold' }}>🏷️</span> <span><strong style={{fontWeight: 600}}>Partner Offer</strong> Make a purchase and enjoy a surprise cashback/ coupon that you can redeem later!</span></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '20px', fontSize: '14px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                <div style={{ color: '#878787', fontWeight: '500' }}>Delivery</div>
                <div>
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #2874F0', width: 'fit-content', paddingBottom: '4px', marginBottom: '10px' }}>
                    <span style={{ color: '#2874F0' }}>📍</span>
                    <input type="text" defaultValue="560001" style={{ border: 'none', outline: 'none', fontWeight: '500', width: '80px', color: '#212121' }} />
                    <span style={{ color: '#2874F0', fontWeight: '500', cursor: 'pointer' }}>Change</span>
                  </div>
                  <p style={{ fontWeight: '500', margin: '0 0 5px 0' }}>Delivery by {deliveryDateString} | <span style={{ color: '#388e3c' }}>Free</span> <span style={{ color: '#878787', textDecoration: 'line-through' }}>₹40</span></p>
                  <p style={{ color: '#878787', margin: 0, fontSize: '12px' }}>Order within 02h 00m 03s</p>
                </div>

                <div style={{ color: '#878787', fontWeight: '500' }}>Highlights</div>
                <div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#212121', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Engineered for High Performance</li>
                    <li>Extended Usage Durability</li>
                    <li>1 Year Manufacturer Warranty</li>
                    <li>Cash on Delivery available</li>
                  </ul>
                </div>

                <div style={{ color: '#878787', fontWeight: '500' }}>Seller</div>
                <div>
                  <div style={{ color: '#2874F0', fontWeight: '500', marginBottom: '5px' }}>SuperComNet <span style={{ backgroundColor: '#2874F0', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '8px', marginLeft: '5px' }}>4.8 ★</span></div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#212121', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>7 Days Service Center Replacement/Repair</li>
                    <li>GST invoice available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {currentView === 'checkout' && (
        <div style={{ padding: '30px 10%', display: 'flex', gap: '30px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '4px', border: `1px solid ${theme.border}`, display: 'flex', gap: '25px', fontWeight: 'bold', fontSize: '12px' }}>
              <span style={{ color: checkoutStep === 1 ? theme.accent : theme.textSecondary }}>① DESTINATION SHIPPING</span>
              <span style={{ color: theme.border }}>➔</span>
              <span style={{ color: checkoutStep === 2 ? theme.accent : theme.textSecondary }}>② PAYMENT VALIDATION BUS</span>
            </div>

            {checkoutStep === 1 ? (
              <div style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 20px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Specify Target Shipping Vectors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {['fullName', 'phone', 'pinCode', 'localAddress', 'city', 'state'].map(field => (
                    <input key={field} type="text" placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={shippingAddress[field]} onChange={(e) => setShippingAddress({...shippingAddress, [field]: e.target.value})} style={{ padding: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.textPrimary, outline: 'none' }} />
                  ))}
                </div>
                <button onClick={() => setCheckoutStep(2)} style={{ marginTop: '25px', padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', float: 'right' }}>SAVE PARAMETERS</button>
              </div>
            ) : (
              <div style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 20px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Select Payment Network Node</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['BHIM / GooglePay UPI Network', 'Credit or Debit Card Gateway', 'Cash on Delivery (COD)'].map(method => (
                    <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: paymentMethod === method ? 'rgba(249,115,22,0.1)' : theme.bg, borderColor: paymentMethod === method ? theme.accent : theme.border }}>
                      <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ accentColor: theme.accent }} />
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{method}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>BACK</button>
                  <button onClick={() => { setCart([]); setCurrentView('order-success'); }} style={{ padding: '12px 35px', backgroundColor: theme.action, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>EXECUTE TRANSACTION</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '320px', backgroundColor: theme.panel, padding: '20px', borderRadius: '6px', height: 'fit-content', border: `1px solid ${theme.border}` }}>
            <h4 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', color: theme.textSecondary, fontSize: '12px' }}>PRICE COMPILATION LOG</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal Allocation</span><span>₹{calculateTotal().toLocaleString('en-IN')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span>Network Shipping Bus</span><span style={{ color: theme.action }}>FREE</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Total Bill:</span><span style={{ color: theme.accent }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {currentView === 'order-success' && (
        <div style={{ textAlign: 'center', padding: '80px 10%' }}>
          <div style={{ backgroundColor: theme.panel, display: 'inline-block', padding: '50px 70px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '60px', display: 'block' }}>✅</span>
            <h2 style={{ color: theme.action, margin: '20px 0 10px 0', fontSize: '26px', fontWeight: '900' }}>Order Processing Dispatched!</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 35px 0' }}>Transaction parameters successfully committed to logs.</p>
            <button onClick={() => setCurrentView('home')} style={{ padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>RETURN TO MAIN HEADER</button>
          </div>
        </div>
      )}

      {/* FLYOUT MODALS */}
      {showCartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ backgroundColor: theme.panel, width: '440px', height: '100%', padding: '25px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.textPrimary }}>My Cart</h2>
              <button onClick={() => setShowCartModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            </div>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary, flex: 1 }}><span style={{ fontSize: '50px' }}>🛒</span><p style={{ fontWeight: 'bold', marginTop: '15px' }}>Your Shopping Cart is empty.</p></div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${theme.border}` }}>
                      <img src={resolvePristineProductImage(item.name, item.category, item.imageUrl)} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="Thumb" />
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
                  <button onClick={triggerCheckoutPipeline} style={{ width: '100%', backgroundColor: theme.accent, color: theme.textPrimary, padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>PLACE ORDER</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, fontFamily: 'Roboto, Arial, sans-serif' }}>
          <div style={{ width: '700px', height: '528px', backgroundColor: '#ffffff', borderRadius: '4px', display: 'flex', overflow: 'hidden', boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.2)', position: 'relative' }}>
            <button onClick={() => { setShowAuthModal(false); setLegalView('none'); }} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#878787', cursor: 'pointer', zIndex: 10, lineHeight: 1 }}>✕</button>
            
            <div style={{ width: '40%', backgroundColor: '#2874F0', padding: '40px 33px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', color: '#ffffff' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 16px 0' }}>{isSignUp ? "Looks like you're new here!" : "Login"}</h2>
                <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#dbdbdb', margin: 0 }}>
                  {isSignUp ? "Sign up with your details to get started" : "Get access to your Orders, Wishlist and Recommendations"}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                 {/* Replaced Flipkart image with a clean, unbranded generic SVG shopping bag graphic */}
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                   <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                   <line x1="3" y1="6" x2="21" y2="6"></line>
                   <path d="M16 10a4 4 0 0 1-8 0"></path>
                 </svg>
              </div>
            </div>

            {legalView === 'none' ? (
              <form onSubmit={handleAuthSubmit} style={{ width: '60%', padding: '50px 35px 16px 35px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                {authError && <div style={{ backgroundColor: '#ffeae9', color: '#d32f2f', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #f4c7c3' }}>{authError}</div>}
                
                {isSignUp && (
                  <div style={{ marginBottom: '25px', position: 'relative' }}>
                    <input type="text" placeholder="Enter Full Name" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} />
                  </div>
                )}
                
                <div style={{ marginBottom: '25px', position: 'relative' }}>
                  <input type="email" placeholder="Enter Email Address" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} />
                </div>
                
                <div style={{ marginBottom: '35px', position: 'relative' }}>
                  <input type="password" placeholder="Enter Password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', padding: '8px 0', color: '#000000', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderBottom = '1px solid #2874F0'} onBlur={(e) => e.target.style.borderBottom = '1px solid #e0e0e0'} />
                </div>

                <div style={{ fontSize: '12px', color: '#878787', marginBottom: '20px', lineHeight: '1.5' }}>
                  By continuing, you agree to BazaarInd's <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => setLegalView('terms')}>Terms of Use</span> and <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => setLegalView('privacy')}>Privacy Policy</span>.
                </div>

                <button type="submit" style={{ backgroundColor: '#FB641B', color: '#ffffff', border: 'none', width: '100%', padding: '14px 0', borderRadius: '2px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.2)' }}>{isSignUp ? "Continue" : "Login"}</button>
                
                <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ background: 'none', border: 'none', color: '#2874F0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                    {isSignUp ? "Existing User? Log in" : "New to BazaarInd? Create an account"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ width: '60%', padding: '35px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div onClick={() => setLegalView('none')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back to {isSignUp ? "Sign Up" : "Login"}
                </div>
                <h3 style={{ margin: '0 0 15px 0', color: '#212121' }}>{legalView === 'terms' ? "Terms of Use" : "Privacy Policy"}</h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', color: '#555', fontSize: '13px', lineHeight: '1.6', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                    <p>This is a demonstration environment. No real data is processed or stored securely for production use. By using this platform, you acknowledge it is an engineering prototype.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App