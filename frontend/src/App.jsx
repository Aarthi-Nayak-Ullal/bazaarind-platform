import { useState, useEffect } from 'react'

function App() {
  // Navigation & Core System State Vectors
  const [currentView, setCurrentView] = useState('home') // 'home', 'catalog', 'product-detail', 'checkout', 'order-success'
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  
  // PRODUCT DETAIL PAGE STATE TRACKERS
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)

  // Dynamic Real-Time Calendar Strings
  const [systemDate, setSystemDate] = useState('')
  const [deliveryDateString, setDeliveryDateString] = useState('')

  // User Space Authentication Registers
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  
  // Flipkart-Style Legal View Tracking Matrix ('none', 'terms', 'privacy')
  const [legalView, setLegalView] = useState('none')

  // Transaction Flight Modals
  const [showCartModal, setShowCartModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', pinCode: '', localAddress: '', city: '', state: '' })
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // Rotating Billboard Dashboard Cover Arrays
  const [activeBanner, setActiveBanner] = useState(0)
  const promoBanners = [
    { 
      title: "EXCLUSIVE DEALS FOR YOU", 
      sub: "Flat 10% Off Up to ₹100 Coupon Applied Automatically", 
      img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80", 
      gradient: "linear-gradient(90deg, rgba(40,116,240,0.9) 0%, rgba(15,23,42,0.4) 100%)" 
    },
    { 
      title: "JUNE EPIC HIGH-HARDWARE SALE", 
      sub: "Flat 60% Off Premium Audio Kits & Smart Wearable Components", 
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", 
      gradient: "linear-gradient(90deg, rgba(251,100,27,0.9) 0%, rgba(15,23,42,0.4) 100%)" 
    },
    { 
      title: "SMARTEST SUMMER ECO DEALS", 
      sub: "Power every step with upgraded processing and storage cells", 
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", 
      gradient: "linear-gradient(90deg, rgba(16,185,129,0.9) 0%, rgba(15,23,42,0.4) 100%)" 
    }
  ]

  const categoryIcons = [
    { name: 'All', icon: '✨' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Home & Kitchen', icon: '🍳' },
    { name: 'Groceries', icon: '🍏' },
    { name: 'Apparel', icon: '👔' },
    { name: 'Fitness & Lifestyle', icon: '🏋️‍♂️' },
    { name: 'Footwear', icon: '👟' },
    { name: 'Books & Stationery', icon: '📚' }
  ]

  const resolvePristineProductImage = (name, category) => {
    const lower = name.toLowerCase();
    if (lower.includes('headphone')) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('smartphone') || lower.includes('5g')) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('watch')) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('earbuds') || lower.includes('tws')) return "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('keyboard')) return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('speaker')) return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('jeans')) return "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('shirt')) return "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('t-shirt') || lower.includes('polo')) return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('saree')) return "https://images.unsplash.com/photo-1610030470224-3067b8f61605?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('running') || lower.includes('sneakers')) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('leather shoes') || lower.includes('formal')) return "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('kettle')) return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('blender') || lower.includes('mixer')) return "https://images.unsplash.com/photo-1581646731595-15f1a55517be?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('cooker')) return "https://images.unsplash.com/photo-1584990351321-8dd934c15ef1?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('atta') || lower.includes('flour')) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('oil')) return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80";
    if (lower.includes('rice')) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
    if (selectedProduct?.category === "Books & Stationery") return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";
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
      const bannerTimer = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % promoBanners.length)
      }, 5000)
      return () => clearInterval(bannerTimer)
    }
  }, [currentView, promoBanners.length])

  useEffect(() => {
    const savedUser = localStorage.getItem('bazaarUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      setShowAuthModal(true)
      setIsSignUp(false)
      setLegalView('none')
    }

    fetch('https://bazaarind-backend.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data)
          setFilteredProducts(data)
        } else {
          console.error("Backend sent an error object instead of a product list:", data)
        }
      })
      .catch(err => console.error("Database cloud cluster stream failure:", err))
  }, [])

  useEffect(() => {
    let result = products
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFilteredProducts(result)
  }, [selectedCategory, searchQuery, products])

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    const endpoint = isSignUp ? 'register' : 'login'
    try {
      const response = await fetch(`https://bazaarind-backend.onrender.com/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Authentication sequence mismatch")
      
      setUser(data.user)
      localStorage.setItem('bazaarUser', JSON.stringify(data.user))
      setShowAuthModal(false)
      setAuthForm({ name: '', email: '', password: '' })
      setLegalView('none')
    } catch (err) {
      setAuthError(err.message)
    }
  }

  const triggerCheckoutPipeline = () => {
    setShowCartModal(false)
    if (!user) {
      setAuthError('Authentication required to allocate checkout routing channels.')
      setShowAuthModal(true)
    } else {
      setCheckoutStep(1)
      setCurrentView('checkout')
    }
  }

  const addToCart = (product) => setCart([...cart, product])
  const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx))
  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price, 0)

  const theme = {
    bg: '#0f172a',        
    panel: '#1e293b',     
    border: '#334155',    
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#f97316',    
    action: '#10b981'     
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', width: '100%', color: theme.textPrimary, fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. NAVIGATION BAR */}
      <nav style={{ backgroundColor: theme.panel, padding: '12px 10%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', fontWeight: 800, color: theme.accent, cursor: 'pointer' }} onClick={() => { setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); }}>BazaarInd</h1>
            <span style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginTop: '2px', fontWeight: 'bold', letterSpacing: '0.5px' }}>⏱️ {systemDate}</span>
          </div>
          
          <input 
            type="text" 
            placeholder="Search for Products, Brands and More..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if(currentView !== 'catalog') setCurrentView('catalog'); }}
            style={{ width: '400px', padding: '10px 16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', outline: 'none', fontSize: '14px', color: theme.textPrimary }} 
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontWeight: 'bold' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '13px', color: theme.action }}>Secure User: {user.name}</span>
              <button onClick={() => { localStorage.removeItem('bazaarUser'); setUser(null); setCurrentView('home'); }} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setIsSignUp(false); setLegalView('none'); }} style={{ backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', padding: '8px 26px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Login</button>
          )}
          <div onClick={() => setShowCartModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
            <span>🛒</span> Cart <span style={{ backgroundColor: theme.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{cart.length}</span>
          </div>
        </div>
      </nav>

      {/* 2. PREMIUM ICON NAVBAR STRIP */}
      <div style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', gap: '45px', padding: '14px 0', borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {categoryIcons.map(cat => {
          const isActive = selectedCategory === cat.name && (currentView === 'catalog' || currentView === 'product-detail');
          return (
            <div 
              key={cat.name} 
              onClick={() => { setSelectedCategory(cat.name); setCurrentView('catalog'); }} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', transform: isActive ? 'scale(1.08)' : 'scale(1)' }}
            >
              <span style={{ fontSize: '24px', marginBottom: '5px' }}>{cat.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? '#2874F0' : '#444444' }}>
                {cat.name.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. CORE VIEWPORT SWAPPER ROUTER */}
      {currentView === 'home' && (
        <div style={{ padding: '25px 10%', display: 'flex', flexDirection: 'column', gap: '35px' }}>
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.5)', position: 'relative', height: '280px' }}>
            <div style={{ display: 'flex', width: `${promoBanners.length * 100}%`, height: '100%', transform: `translateX(-${activeBanner * (100 / promoBanners.length)}%)`, transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {promoBanners.map((banner, index) => (
                <div key={index} style={{ width: `${100 / promoBanners.length}%`, height: '100%', backgroundImage: `${banner.gradient}, url("${banner.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                  <span style={{ backgroundColor: '#FB641B', width: 'fit-content', padding: '4px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>FLIPKART OFFER MODE</span>
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
                const accurateImg = resolvePristineProductImage(product.name, product.category);
                return (
                  <div key={product.id} onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }} style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '15px', textAlign: 'center', cursor: 'pointer', backgroundColor: theme.bg }}>
                    <div style={{ width: '100%', height: '110px', overflow: 'hidden', borderRadius: '4px', marginBottom: '10px', backgroundColor: theme.panel }}>
                      <img src={accurateImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Asset" />
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                    <p style={{ margin: '4px 0', color: theme.action, fontWeight: 'bold', fontSize: '13px' }}>Flat 70% Off System Channels</p>
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
              const accurateImg = resolvePristineProductImage(product.name, product.category);
              return (
                <div key={product.id} onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }} style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '6px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '350px', cursor: 'pointer' }}>
                  <div>
                    <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '4px', marginBottom: '12px', backgroundColor: theme.bg }}>
                      <img src={accurateImg} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <span style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                      🚚 Express Delivery: <strong style={{ color: theme.action }}>{deliveryDateString}</strong>
                    </span>
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

      {currentView === 'product-detail' && selectedProduct && (
        <main style={{ padding: '30px 10%', backgroundColor: '#f1f3f6', color: '#000000', minHeight: '85vh' }}>
          <div style={{ fontSize: '12px', color: '#878787', marginBottom: '20px', fontWeight: '500' }}>
            Home &gt; {selectedProduct.category} &gt; <span style={{ color: '#212121' }}>{selectedProduct.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', backgroundColor: '#ffffff', padding: '24px', borderRadius: '2px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.1)' }}>
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'sticky', top: '100px', height: 'fit-content' }}>
              <div style={{ width: '100%', height: '400px', border: '1px solid #f0f0f0', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: '16px', boxSizing: 'border-box' }}>
                <img src={resolvePristineProductImage(selectedProduct.name, selectedProduct.category)} alt="Packshot View" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: '16px' }}>
                <button onClick={() => addToCart(selectedProduct)} style={{ height: '56px', backgroundColor: '#ff9f00', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '16px', borderRadius: '2px', cursor: 'pointer' }}>
                  🛒 ADD TO CART
                </button>
                <button onClick={() => { addToCart(selectedProduct); triggerCheckoutPipeline(); }} style={{ height: '56px', backgroundColor: '#fb641b', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '16px', borderRadius: '2px', cursor: 'pointer' }}>
                  ⚡ BUY NOW
                </button>
              </div>
            </div>

            <div style={{ width: '60%', paddingLeft: '12px', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#212121', margin: '0 0 8px 0', lineHeight: '1.4' }}>{selectedProduct.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: '#388e3c', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>4.3 ★</span>
                <span style={{ fontSize: '14px', color: '#878787', fontWeight: '500' }}>2,972 Ratings & 415 Reviews</span>
                <span style={{ color: '#2874F0', fontSize: '14px', fontWeight: 'bold' }}>Assured Partner Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px', fontWeight: '500', color: '#212121' }}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '16px', color: '#878787', textDecoration: 'line-through' }}>₹{(Math.floor(selectedProduct.price * 1.35)).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '16px', color: '#388e3c', fontWeight: 'bold' }}>25% Off Deal Applied</span>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '20px 0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ width: '110px', color: '#878787', fontSize: '14px', fontWeight: '500' }}>Color Option</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Classic Charcoal', 'Pantone Metallic', 'Stealth Shadow'].map((color, idx) => (
                      <button key={color} onClick={() => setSelectedColor(idx)} style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: selectedColor === idx ? '2px solid #2874F0' : '1px solid #e0e0e0', color: selectedColor === idx ? '#2874F0' : '#212121', fontSize: '12px', fontWeight: 'bold', borderRadius: '2px', cursor: 'pointer' }}>{color}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '110px', color: '#878787', fontSize: '14px', fontWeight: '500' }}>Capacity / Size</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedProduct.category === "Electronics" ? ['128GB + 8GB', '256GB + 12GB'].map((size, idx) => (
                      <button key={size} onClick={() => setSelectedSize(idx)} style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: selectedSize === idx ? '2px solid #2874F0' : '1px solid #e0e0e0', color: selectedSize === idx ? '#2874F0' : '#212121', fontSize: '12px', fontWeight: 'bold', borderRadius: '2px', cursor: 'pointer' }}>{size}</button>
                    )) : ['Standard Unit Pack', 'Family Multi-Pack Bundle'].map((size, idx) => (
                      <button key={size} onClick={() => setSelectedSize(idx)} style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: selectedSize === idx ? '2px solid #2874F0' : '1px solid #e0e0e0', color: selectedSize === idx ? '#2874F0' : '#212121', fontSize: '12px', fontWeight: 'bold', borderRadius: '2px', cursor: 'pointer' }}>{size}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#212121', margin: '0 0 12px 0' }}>Available Bank Network Offers</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#212121' }}>
                  <li>🏷️ <strong style={{ color: '#388e3c' }}>Bank Offer:</strong> Extra 10% off on AXIS Bank Credit Card transactions, up to ₹1,250.</li>
                  <li>🏷️ <strong style={{ color: '#388e3c' }}>Partner Offer:</strong> Sign up for BazaarInd Premium to unlock free automated checkout shipping buffers.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#212121', backgroundColor: '#f9f9f9', padding: '12px 16px', borderRadius: '2px', border: '1px solid #e0e0e0' }}>
                <span style={{ color: '#878787', width: '110px', fontWeight: '500' }}>Delivery Context</span>
                <div>Delivery by <strong style={{ color: '#388e3c' }}>{deliveryDateString}</strong> | <span style={{ color: '#388e3c', fontWeight: 'bold' }}>FREE Express Routing</span></div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 3.4 SHIPPING & CHECKOUT VIEW */}
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
                  <button onClick={() => setCheckoutStep(1)} style={{ padding: '10px 20px', backgroundColor: 'none', border: `1px solid ${theme.border}`, color: theme.textSecondary, cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>BACK</button>
                  <button onClick={() => { setCart([]); setCurrentView('order-success'); }} style={{ padding: '12px 35px', backgroundColor: theme.action, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>EXECUTE TRANSACTION</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '320px', backgroundColor: theme.panel, padding: '20px', borderRadius: '6px', height: 'fit-content', border: `1px solid ${theme.border}` }}>
            <h4 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', color: theme.textSecondary, fontSize: '12px' }}>PRICE COMPILATION LOG</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal Allocation</span><span>₹{calculateTotal().toLocaleString('en-IN')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10%' }}><span>Network Shipping Bus</span><span style={{ color: theme.action }}>FREE</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Total Bill:</span><span style={{ color: theme.accent }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3.5 RECEIPT DISPATCH SUCCESS VIEW */}
      {currentView === 'order-success' && (
        <div style={{ textAlign: 'center', padding: '80px 10%' }}>
          <div style={{ backgroundColor: theme.panel, display: 'inline-block', padding: '50px 70px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '60px', display: 'block' }}>✅</span>
            <h2 style={{ color: theme.action, margin: '20px 0 10px 0', fontSize: '26px', fontWeight: '900' }}>Order Processing Dispatched!</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 35px 0' }}>Transaction parameters successfully committed to NoSQL cluster logs.</p>
            <button onClick={() => setCurrentView('home')} style={{ padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>RETURN TO MAIN HEADER</button>
          </div>
        </div>
      )}

      {/* 🛒 REUSABLE SIDEBAR OVERLAYS: MY CART FLYOUT PANEL */}
      {showCartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ backgroundColor: theme.panel, width: '440px', height: '100%', padding: '25px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.textPrimary }}>My Cart</h2>
              <button onClick={() => setShowCartModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            </div>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary, flex: 1 }}>
                <span style={{ fontSize: '50px' }}>🛒</span>
                <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Your Shopping Cart is empty.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  {cart.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${theme.border}` }}>
                      <img src={resolvePristineProductImage(item.name, item.category)} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="Thumb" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <span style={{ fontSize: '11px', color: theme.textSecondary }}>{item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: theme.textPrimary }}>₹{item.price}</span>
                        <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: `2px solid ${theme.border}`, paddingTop: '15px', marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginBottom: '20px' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: theme.action, fontSize: '20px' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={triggerCheckoutPipeline} style={{ width: '100%', backgroundColor: theme.accent, color: theme.textPrimary, padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>PLACE ORDER</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 📘 OFFICIAL SPLICED FLIPKART LOGIN/SIGNUP MODAL INTERFACE */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, fontFamily: 'Roboto, Arial, sans-serif' }}>
          <div style={{ width: '650px', height: '528px', backgroundColor: '#ffffff', borderRadius: '4px', display: 'flex', overflow: 'hidden', boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.2)', position: 'relative' }}>
            
            <button onClick={() => { setShowAuthModal(false); setLegalView('none'); }} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '18px', color: '#878787', cursor: 'pointer', zIndex: 10 }}>✕</button>
            
            {/* Left Column: Iconic Brand Pane */}
            <div style={{ width: '40%', backgroundColor: '#2874F0', padding: '40px 33px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', color: '#ffffff' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '500', margin: '0 0 16px 0' }}>
                  {legalView === 'terms' ? "Terms of Use" : legalView === 'privacy' ? "Privacy Policy" : isSignUp ? "Sign Up" : "Login"}
                </h2>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#dbdbdb', margin: 0 }}>
                  {legalView === 'terms' 
                    ? "Review the official rules, liabilities, and legal obligations governing your access to our retail platform."
                    : legalView === 'privacy'
                    ? "Understand how your personal details, secure transactions, and data protections are handled in India."
                    : isSignUp 
                    ? "Create an account to track your orders, manage your wishlist, and configure personalized recommendations." 
                    : "Get access to your Orders, Wishlist and Recommendations"}
                </p>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '1px', opacity: 0.3, textAlign: 'center' }}>BazaarInd</div>
            </div>

            {/* Right Column Context Swapper */}
            {legalView === 'none' ? (
              <form onSubmit={handleAuthSubmit} style={{ width: '60%', padding: '56px 35px 16px 35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                {authError && (
                  <div style={{ backgroundColor: '#ffeae9', color: '#d32f2f', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #f4c7c3' }}>
                    {authError}
                  </div>
                )}
                
                {isSignUp && (
                  <div style={{ marginBottom: '30px' }}>
                    <input type="text" placeholder="Enter Full Name" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '16px', padding: '8px 0', color: '#000000' }} />
                  </div>
                )}

                <div style={{ marginBottom: '30px' }}>
                  <input type="email" placeholder="Enter Email Address" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '16px', padding: '8px 0', color: '#000000' }} />
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <input type="password" placeholder="Enter Password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: '1px solid #e0e0e0', outline: 'none', fontSize: '16px', padding: '8px 0', color: '#000000' }} />
                </div>

                <p style={{ fontSize: '12px', color: '#878787', lineHeight: '1.4', margin: '0 0 24px 0' }}>
                  By continuing, you agree to BazaarInd's{" "}
                  <span onClick={() => setLegalView('terms')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}>Terms of Use</span> and{" "}
                  <span onClick={() => setLegalView('privacy')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}>Privacy Policy</span>.
                </p>

                <button type="submit" style={{ backgroundColor: '#FB641B', color: '#ffffff', border: 'none', width: '100%', height: '#48px', borderRadius: '2px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.2)', textTransform: 'uppercase' }}>
                  {isSignUp ? "Continue to Signup" : "Log In"}
                </button>

                <p onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ color: '#2874F0', fontSize: '14px', textAlign: 'center', cursor: 'pointer', marginTop: '35px', fontWeight: '500' }}>
                  {isSignUp ? "Existing User? Log in to your channel" : "New to BazaarInd? Create an account"}
                </p>
              </form>
            ) : (
              /* 📜 ACTUAL FLIPKART DOCUMENTATION TEXT SCROLL CONTAINER */
              <div style={{ width: '60%', padding: '35px 35px 20px 35px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                
                <div onClick={() => setLegalView('none')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '15px' }}>
                  ← Back to Account Interface
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', color: '#333333', fontSize: '13px', lineHeight: '1.6', borderTop: '1px solid #e0e0e0', paddingTop: '12px' }}>
                  {legalView === 'terms' ? (
                    <>
                      <h4 style={{ margin: '0 0 4px 0', color: '#212121', fontWeight: 'bold' }}>Flipkart Terms of Use [cite: 172]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        This document is an electronic record in terms of the Information Technology Act, 2000 and rules thereunder[cite: 173]. This electronic record is generated by a computer system and does not require any physical or digital signatures[cite: 173]. Published in accordance with Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2021[cite: 174].
                      </p>
                      
                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>1. Platform Ownership Parameters [cite: 174]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        The Platform is owned by Flipkart Internet Private Limited, a company incorporated under the Companies Act, 1956 with its registered office at Buildings Alyssa, Begonia & Clover, Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru - 560103, Karnataka, India. Your use indicates contract agreement to all policies[cite: 177, 179].
                      </p>
                      
                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>2. Account Identifier & Obligations [cite: 190]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        Your mobile phone number and/or e-mail address is treated as Your primary identifier on the Platform[cite: 193]. You shall be responsible for maintaining the confidentiality of your Display Name and Password and all activities that occur under your profile account[cite: 191].
                      </p>

                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>3. Independent Bipartite Transactions [cite: 220]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        Flipkart is an intermediary and cannot control transactions between Platform Users[cite: 222, 683]. All commercial terms (price, delivery dates, and warranties) are offered and agreed strictly between Buyers and Sellers alone[cite: 224, 225, 446].
                      </p>

                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>4. Platform Fees & Billing Rules [cite: 281]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        Flipkart reserves the right to charge certain platform operational fees, offer handling fees, or convenience fees[cite: 293, 296, 884]. These charges are displayed to the customer transparently prior to order checkout confirmation and execution[cite: 298].
                      </p>

                      <h5 style={{ margin: '16px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>Legal Grievance Escalations [cite: 799]</h5>
                      <p style={{ margin: '0 0 4px 0', color: '#555555', fontSize: '12px' }}><strong>Officer:</strong> Karthik R (Associate Director) [cite: 799]</p>
                      <p style={{ margin: '0 0 4px 0', color: '#555555', fontSize: '12px' }}><strong>Address:</strong> Flipkart Internet Pvt Ltd, Block B (Begonia), 7th Floor Embassy Tech Village, Outer Ring Road, Bengaluru, 560103 [cite: 799]</p>
                      <p style={{ margin: '0 0 12px 0', color: '#555555', fontSize: '12px' }}><strong>Email:</strong> grievance.officer@flipkart.com [cite: 799]</p>
                    </>
                  ) : (
                    <>
                      <h4 style={{ margin: '0 0 4px 0', color: '#212121', fontWeight: 'bold' }}>Flipkart Privacy Policy [cite: 2, 15]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        We value the trust you place in us and recognize the importance of secure transactions and information privacy[cite: 19]. This Privacy Policy describes how Flipkart Internet Private Limited and its affiliates collect, use, or otherwise process your personal data through the Platform[cite: 20].
                      </p>
                      
                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>1. Data Collection Categories [cite: 24]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        We collect personal data relating to your buying behavior, browsing patterns, preferences, delivery addresses, and payment instrument records from you when you set up an account or transact with us[cite: 29, 39]. This information is utilized for internal research to tailor your experience[cite: 30, 76].
                      </p>
                      
                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>2. Sharing of Personal Records [cite: 91]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        We may share personal data with Flipkart group companies, affiliates, business partners, and qualified sellers to assist in order fulfillment, deferred payment credit checks, or personalized promotional campaigns[cite: 34, 61, 92, 93].
                      </p>

                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>3. Cookies & Analytical Anchors [cite: 77]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        We deploy data collection devices such as "cookies" on certain pages of the Platform to analyze web page flow, measure promotional effectiveness, and allow you to enter passwords less frequently during an active session[cite: 78, 81].
                      </p>

                      <h4 style={{ margin: '12px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>4. Security Precautions & Server Controls [cite: 121]</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '12px' }}>
                        We maintain reasonable physical, electronic, and procedural safeguards to protect your data[cite: 122]. Whenever you access your account information parameters, we offer the use of secure server connections to prevent unauthorized access[cite: 123, 124].
                      </p>

                      <h5 style={{ margin: '16px 0 4px 0', color: '#212121', fontWeight: 'bold' }}>Privacy Grievance Officer Contact [cite: 141]</h5>
                      <p style={{ margin: '0 0 4px 0', color: '#555555', fontSize: '12px' }}><strong>Officer:</strong> Mr Karthik R (Associate Director) [cite: 141]</p>
                      <p style={{ margin: '0 0 4px 0', color: '#555555', fontSize: '12px' }}><strong>Office:</strong> Flipkart Internet Pvt Ltd, Embassy Tech Village, 8th Floor Block 'B', Devarabeesanahalli Village, Bengaluru, 560103 [cite: 141]</p>
                      <p style={{ margin: '0 0 12px 0', color: '#555555', fontSize: '12px' }}><strong>Email:</strong> privacy.grievance@flipkart.com [cite: 141]</p>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => setLegalView('none')} 
                  style={{ backgroundColor: '#FB641B', color: '#ffffff', border: 'none', width: '100%', height: '40px', borderRadius: '2px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '15px', textTransform: 'uppercase' }}
                >
                  Acknowledge and Return
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

export default App