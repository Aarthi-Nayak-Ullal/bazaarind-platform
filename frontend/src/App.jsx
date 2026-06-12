import { useState, useEffect } from 'react'

function App() {
  // Navigation & Core System State Vectors
  const [currentView, setCurrentView] = useState('home') // 'home', 'catalog', 'checkout', 'order-success'
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  
  // Dynamic Real-Time Calendar Strings
  const [systemDate, setSystemDate] = useState('')
  const [deliveryDateString, setDeliveryDateString] = useState('')

  // User Space Authentication Registers
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')

  // Transaction Flight Modals
  const [showCartModal, setShowCartModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', pinCode: '', localAddress: '', city: '', state: '' })
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // Rotating Billboard Dashboard Cover Arrays
  const [activeBanner, setActiveBanner] = useState(0)
  const promoBanners = [
    { 
      title: "CYBER ELECTRONICS ENGINE SALE", 
      sub: "Flat 60% Off Automated Audio Gear & Hardware Kits", 
      img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80", 
      gradient: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.5) 100%)" 
    },
    { 
      title: "MIDNIGHT GROCERY SUPPLY RUN", 
      sub: "Flat ₹100 Cashback on Daily Staples & Processing Essentials", 
      img: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80", 
      gradient: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.5) 100%)" 
    }
  ]

  // Pure Component Fallback Registers (CORS Security Mitigation)
  const fallbacks = {
    "Electronics": "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=500&q=80",
    "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80",
    "Groceries": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
    "Apparel": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=500&q=80",
    "Fitness & Lifestyle": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80",
    "Footwear": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80",
    "Books & Stationery": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80"
  }

  // SYSTEM CLOCK & DELAY CALCULATION INTERRUPT
  useEffect(() => {
    // 1. Resolve current structural system calendar time
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    const today = new Date()
    setSystemDate(today.toLocaleDateString('en-IN', options))

    // 2. Compute downstream standard delivery delta (Current Date + 48 Hours)
    const targetArrival = new Date()
    targetArrival.setDate(today.getDate() + 2)
    setDeliveryDateString(targetArrival.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
  }, [])

  // Auto-advance loop for promotional banner array
  useEffect(() => {
    if (currentView === 'home') {
      const bannerTimer = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % promoBanners.length)
      }, 5000)
      return () => clearInterval(bannerTimer)
    }
  }, [currentView])

  // Cold Boot User Register Synchronization
  useEffect(() => {
    const savedUser = localStorage.getItem('bazaarUser')
    if (savedUser) setUser(JSON.parse(savedUser))

    fetch('http://127.0.0.1:8000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setFilteredProducts(data)
      })
      .catch(err => console.error("Database cluster stream failure:", err))
  }, [])

  // Logic Gate for Multi-Tier Search Filtering
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
      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}`, {
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

  // UNIVERSAL DESIGN PALETTE: Slate Cyber-Dark Scheme variables
  const theme = {
    bg: '#0f172a',        // Deep Slate 900
    panel: '#1e293b',     // Mid Slate 800
    border: '#334155',    // Light Slate 700
    textPrimary: '#f8fafc',// Silver White
    textSecondary: '#94a3b8',// Muted Slate Blue
    accent: '#f97316',    // Safety Alert Orange
    action: '#10b981'     // Transaction Success Green
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', width: '100%', color: theme.textPrimary, fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. DARK NAVIGATION BAY TERMINAL */}
      <nav style={{ backgroundColor: theme.panel, padding: '12px 10%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', fontWeight: 800, color: theme.accent, cursor: 'pointer' }} onClick={() => { setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); }}>BazaarInd</h1>
            {/* Dynamic Clock Insertion Node */}
            <span style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginTop: '2px', fontWeight: 'bold', letterSpacing: '0.5px' }}>⏱️ {systemDate}</span>
          </div>
          
          <input 
            type="text" 
            placeholder="Search verified hardware inventory..." 
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
            <button onClick={() => { setShowAuthModal(true); setIsSignUp(false); }} style={{ backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', padding: '8px 26px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Login</button>
          )}
          <div onClick={() => setShowCartModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
            <span>🛒</span> Buffer <span style={{ backgroundColor: theme.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{cart.length}</span>
          </div>
        </div>
      </nav>

      {/* 2. CATEGORY DISPATCH LINKS */}
      <div style={{ backgroundColor: theme.panel, display: 'flex', justifyContent: 'center', gap: '35px', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '600' }}>
        {['All', 'Electronics', 'Home & Kitchen', 'Groceries', 'Apparel', 'Fitness & Lifestyle', 'Footwear', 'Books & Stationery'].map(cat => (
          <span key={cat} onClick={() => { setSelectedCategory(cat); setCurrentView('catalog'); }} style={{ cursor: 'pointer', transition: 'color 0.1s', color: (selectedCategory === cat && currentView === 'catalog') ? theme.accent : theme.textSecondary }}>
            {cat.toUpperCase()}
          </span>
        ))}
      </div>

      {/* 3. CORE VIEWPORT SWAPPER ROUTER */}
      
      {/* 3.1 CYBER HOME VIEW */}
      {currentView === 'home' && (
        <div className="animated-fade" style={{ padding: '25px 10%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* HIGH-RES STYLED BANNER COVERS */}
          <div style={{ 
            backgroundImage: `${promoBanners[activeBanner].gradient}, url("${promoBanners[activeBanner].img}")`, 
            backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '280px', borderRadius: '6px', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${theme.border}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
          }}>
            <span style={{ backgroundColor: theme.accent, width: 'fit-content', padding: '3px 10px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>SYSTEM SYSTEM DISCOUNTS</span>
            <h2 style={{ fontSize: '30px', margin: '0 0 8px 0', fontWeight: '900', color: theme.textPrimary }}>{promoBanners[activeBanner].title}</h2>
            <p style={{ fontSize: '16px', margin: '0 0 20px 0', color: theme.textSecondary }}>{promoBanners[activeBanner].sub}</p>
            <button onClick={() => setCurrentView('catalog')} style={{ width: 'fit-content', padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>ENGAGE INFRASTRUCTURE</button>
          </div>

          {/* RECOMENDATIONS ROW MODULE */}
          <div style={{ backgroundColor: theme.panel, padding: '24px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.textPrimary }}>Algorithmic Core Recommendations 🔥</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: theme.textSecondary }}>High-density records verified for sudden volume markdown routing.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {products.slice(0, 4).map((product) => (
                <div key={product.id} onClick={() => setCurrentView('catalog')} style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '15px', textAlign: 'center', cursor: 'pointer', backgroundColor: theme.bg }}>
                  <div style={{ width: '100%', height: '110px', overflow: 'hidden', borderRadius: '4px', marginBottom: '10px', backgroundColor: theme.panel }}>
                    <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = fallbacks[product.category]; }} alt="Asset" />
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                  <p style={{ margin: '4px 0', color: theme.action, fontWeight: 'bold', fontSize: '13px' }}>Flat 70% Off System Channels</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3.2 DATA REGISTRY CATALOG CATALOG GRID VIEW */}
      {currentView === 'catalog' && (
        <main className="animated-fade" style={{ padding: '30px 10%' }}>
          <h2 style={{ fontSize: '20px', color: theme.textPrimary, marginBottom: '2px' }}>{selectedCategory.toUpperCase()} REGISTRY INDEX</h2>
          <p style={{ margin: '0 0 25px 0', fontSize: '12px', color: theme.textSecondary }}>Resolved Node Count Capacity: {filteredProducts.length} entries streaming live</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredProducts.map(product => (
              <div key={product.id} style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '6px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '350px' }}>
                <div>
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '4px', marginBottom: '12px', backgroundColor: theme.bg }}>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbacks[product.category]; }}
                    />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.name}>{product.name}</h3>
                  
                  {/* Dynamic Predictor Logic Engine Output */}
                  <span style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                    🚚 Express Delivery: <strong style={{ color: theme.action }}>{deliveryDateString}</strong>
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '4px 0' }}>₹{product.price.toLocaleString('en-IN')}</p>
                  <button onClick={() => addToCart(product)} style={{ width: '100%', padding: '10px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>Add to Buffer</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 3.3 TRANSACTION PIPELINE STEPS CHEKOUT VIEW */}
      {currentView === 'checkout' && (
        <div className="animated-fade" style={{ padding: '30px 10%', display: 'flex', gap: '30px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: theme.panel, padding: '16px', borderRadius: '4px', border: `1px solid ${theme.border}`, display: 'flex', gap: '25px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.5px' }}>
              <span style={{ color: checkoutStep === 1 ? theme.accent : theme.textSecondary }}>① DESTINATION MATRIX SHIPPING</span>
              <span style={{ color: theme.border }}>➔</span>
              <span style={{ color: checkoutStep === 2 ? theme.accent : theme.textSecondary }}>② PAYMENT BUS VALIDATION</span>
            </div>

            {checkoutStep === 1 ? (
              <div className="animated-modal" style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 20px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Specify Target Shipping Vectors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {['fullName', 'phone', 'pinCode', 'localAddress', 'city', 'state'].map(field => (
                    <input key={field} type="text" placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={shippingAddress[field]} onChange={(e) => setShippingAddress({...shippingAddress, [field]: e.target.value})} style={{ padding: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.textPrimary, outline: 'none' }} />
                  ))}
                </div>
                <button onClick={() => setCheckoutStep(2)} style={{ marginTop: '25px', padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', float: 'right' }}>SAVE PARAMETERS</button>
              </div>
            ) : (
              <div className="animated-modal" style={{ backgroundColor: theme.panel, padding: '25px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
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
            <h4 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', color: theme.textSecondary, fontSize: '12px', letterSpacing: '0.5px' }}>PRICE COMPILATION LOG</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal Allocation</span><span>₹{calculateTotal().toLocaleString('en-IN')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Network Shipping Bus</span><span style={{ color: theme.action }}>FREE</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Total Bill:</span><span style={{ color: theme.accent }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 SUCCESS RECEIPT DISPLAY VIEW */}
      {currentView === 'order-success' && (
        <div className="animated-fade" style={{ textAlign: 'center', padding: '80px 10%' }}>
          <div style={{ backgroundColor: theme.panel, display: 'inline-block', padding: '50px 70px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: '60px', display: 'block' }}>✅</span>
            <h2 style={{ color: theme.action, margin: '20px 0 10px 0', fontSize: '26px', fontWeight: '900' }}>Order Processing Dispatched!</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 35px 0' }}>Transaction parameters successfully committed to NoSQL cluster logs.</p>
            <button onClick={() => setCurrentView('home')} style={{ padding: '12px 35px', backgroundColor: theme.accent, color: theme.textPrimary, border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>RETURN TO MAIN HEADER</button>
          </div>
        </div>
      )}

      {/* REUSABLE UTILITY FLYOUTS: FLYOUT SIDE REGISTER (CART) */}
      {showCartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div className="animated-panel" style={{ backgroundColor: theme.panel, width: '440px', height: '100%', padding: '25px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.textPrimary }}>Volatile Buffer Memory (Cart)</h2>
              <button onClick={() => setShowCartModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            </div>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary, flex: 1 }}>
                <span style={{ fontSize: '50px' }}>🛒</span>
                <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Memory cache allocation arrays are completely blank.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  {cart.map((item, index) => (
                    <div key={index} className="animated-fade" style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px 0', borderBottom: `1px dashed ${theme.border}` }}>
                      <img src={item.image_url} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', backgroundColor: theme.bg }} onError={(e) => { e.target.onerror = null; e.target.src = fallbacks[item.category]; }} alt="Thumb" />
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
                    <span>Accumulated Sum:</span>
                    <span style={{ color: theme.action, fontSize: '20px' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={triggerCheckoutPipeline} style={{ width: '100%', backgroundColor: theme.accent, color: theme.textPrimary, padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>PROCEED TO TRANSACTION GATE</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LAYER LOCK OVERLAY SECURITY INTERLOCK GATES (AUTH) */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="animated-modal" style={{ backgroundColor: theme.panel, width: '630px', height: '400px', borderRadius: '6px', display: 'flex', overflow: 'hidden', position: 'relative', border: `1px solid ${theme.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textSecondary }}>✕</button>
            <div style={{ backgroundColor: theme.bg, width: '40%', padding: '40px 30px', color: theme.textPrimary, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${theme.border}` }}>
              <div>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', color: theme.accent }}>{isSignUp ? "Register Node" : "Identity Interlock"}</h2>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: theme.textSecondary }}>{isSignUp ? "Open an interface credential packet to map system rows." : "Verify host identifiers to release secure pipeline paths."}</p>
              </div>
              <span style={{ fontSize: '44px', opacity: 0.15 }}>🔒</span>
            </div>
            <form onSubmit={handleAuthSubmit} style={{ width: '60%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              {authError && <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold' }}>{authError}</div>}
              {isSignUp && (
                <input type="text" placeholder="Enter Parameter Operator Name" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ padding: '12px 0', backgroundColor: 'none', border: 'none', borderBottom: `1px solid ${theme.border}`, outline: 'none', fontSize: '14px', color: theme.textPrimary }} />
              )}
              <input type="email" placeholder="Enter Connection Identifier Email" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ padding: '12px 0', backgroundColor: 'none', border: 'none', borderBottom: `1px solid ${theme.border}`, outline: 'none', fontSize: '14px', color: theme.textPrimary }} />
              <input type="password" placeholder="Enter Cipher Entry Password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '12px 0', backgroundColor: 'none', border: 'none', borderBottom: `1px solid ${theme.border}`, outline: 'none', fontSize: '14px', color: theme.textPrimary }} />
              <button type="submit" style={{ backgroundColor: theme.accent, color: theme.textPrimary, padding: '12px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>{isSignUp ? "INITIALIZE NODES" : "UNLOCK GATE"}</button>
              <p onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center', cursor: 'pointer', marginTop: '15px' }}>{isSignUp ? "Existing operator? Access login vector" : "New platform entity? Build network identity"}</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App