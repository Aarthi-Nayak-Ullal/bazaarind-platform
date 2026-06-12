import React, { useState } from "react";

const FlipkartLogin = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("https://bazaarind-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = response.json();
      if (response.ok) {
        onLoginSuccess(data.user);
        if (onClose) onClose();
      } else {
        setError(data.detail || "Authentication validation denied.");
      }
    } catch (err) {
      setError("Unable to interface with live authentication servers.");
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loginContainer}>
        {/* 📘 LEFT COLUMN: The Iconic Flipkart Brand Pane */}
        <div style={styles.leftBrandPane}>
          <div>
            <h2 style={styles.brandTitle}>Login</h2>
            <p style={styles.brandSubtitle}>
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          <div style={styles.brandGraphicPlaceholder}>BazaarInd</div>
        </div>

        {/* ✉️ RIGHT COLUMN: The Interactive Form Input Matrix */}
        <div style={styles.rightFormPane}>
          <button onClick={onClose} style={styles.closeModalButton}>✕</button>
          
          <form onSubmit={handleFormSubmission} style={styles.authForm}>
            {error && <div style={styles.errorBanner}>{error}</div>}
            
            <div style={styles.inputContainer}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email/Mobile Number"
                style={styles.cleanInputField}
              />
            </div>

            <div style={styles.inputContainer}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                style={styles.cleanInputField}
              />
            </div>

            <p style={styles.termsText}>
              By continuing, you agree to BazaarInd's{" "}
              <span style={styles.blueLink}>Terms of Use</span> and{" "}
              <span style={styles.blueLink}>Privacy Policy</span>.
            </p>

            <button type="submit" style={styles.flipkartOrangeButton}>
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 🎨 COMPREHENSIVE FLIPKART DESIGN BRANDING OBJECT SPECIFICATIONS
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    fontFamily: "Roboto, Arial, sans-serif",
  },
  loginContainer: {
    width: "650px",
    height: "528px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
    position: "relative",
  },
  leftBrandPane: {
    width: "40%",
    backgroundColor: "#2874F0", // Iconic Flipkart Royal Blue
    padding: "40px 33px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#ffffff",
  },
  brandTitle: {
    fontSize: "28px",
    fontWeight: "500",
    margin: "0 0 16px 0",
  },
  brandSubtitle: {
    fontSize: "15px",
    lineHeight: "1.5",
    color: "#dbdbdb",
    margin: 0,
  },
  brandGraphicPlaceholder: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "1px",
    opacity: 0.3,
    textAlign: "center",
  },
  rightFormPane: {
    width: "60%",
    padding: "56px 35px 16px 35px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  closeModalButton: {
    position: "absolute",
    top: "16px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#878787",
    cursor: "pointer",
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  errorBanner: {
    backgroundColor: "#ffeae9",
    color: "#d32f2f",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "13px",
    marginBottom: "15px",
    border: "1px solid #f4c7c3",
  },
  inputContainer: {
    marginBottom: "30px",
  },
  cleanInputField: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #e0e0e0",
    outline: "none",
    fontSize: "16px",
    padding: "8px 0",
    color: "#000000",
    transition: "border-color 0.2s",
  },
  termsText: {
    fontSize: "12px",
    color: "#878787",
    lineHeight: "1.4",
    margin: "0 0 20px 0",
  },
  blueLink: {
    color: "#2874F0",
    cursor: "pointer",
    fontWeight: "500",
  },
  flipkartOrangeButton: {
    backgroundColor: "#FB641B", // Iconic Flipkart Tangerine Orange
    color: "#ffffff",
    border: "none",
    width: "100%",
    height: "48px",
    borderRadius: "2px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
    textTransform: "uppercase",
  },
};

export default FlipkartLogin;