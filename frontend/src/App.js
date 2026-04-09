import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterBatch from "./components/RegisterBatch";
import ProcessBatch from "./components/ProcessBatch";
import TransferOwnership from "./components/TransferOwnership";
import VerifyBatch from "./components/VerifyBatch";

const PAGES = ["dashboard", "register", "process", "transfer", "verify"];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState(""); // "connecting" | "connected" | "error"

  // Auto-detect if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletStatus("connected");
          }
        } catch (_) {}
      }
    };
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletStatus("connected");
        } else {
          setWalletAddress("");
          setWalletStatus("");
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert(
        "MetaMask is not installed. Please install MetaMask from https://metamask.io"
      );
      return;
    }
    setWalletStatus("connecting");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setWalletStatus("connected");
    } catch (err) {
      setWalletStatus("error");
      console.error("Wallet connection rejected:", err);
    }
  };

  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const renderPage = () => {
    switch (activePage) {
      case "register":
        return <RegisterBatch />;
      case "process":
        return <ProcessBatch />;
      case "transfer":
        return <TransferOwnership />;
      case "verify":
        return <VerifyBatch />;
      default:
        return <Dashboard onNavigate={setActivePage} walletAddress={walletAddress} />;
    }
  };

  return (
    <div className="app">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <span className="brand-icon">🌿</span>
          <span className="brand-name">MediChain</span>
          <span className="brand-tagline">Medicinal Plant Supply Chain</span>
        </div>
        <div className="header-wallet">
          {walletStatus === "connected" ? (
            <div className="wallet-connected">
              <span className="wallet-dot" />
              <span className="wallet-address" title={walletAddress}>
                {shortenAddress(walletAddress)}
              </span>
            </div>
          ) : (
            <button
              className="btn btn-connect"
              onClick={connectWallet}
              disabled={walletStatus === "connecting"}
            >
              {walletStatus === "connecting" ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="nav">
        {PAGES.map((page) => (
          <button
            key={page}
            className={`nav-btn ${activePage === page ? "nav-btn-active" : ""}`}
            onClick={() => setActivePage(page)}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="main">
        {walletStatus !== "connected" && activePage !== "dashboard" ? (
          <div className="card wallet-warning">
            <p>⚠️ Please connect your MetaMask wallet to interact with the blockchain.</p>
            <button className="btn btn-connect" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : (
          renderPage()
        )}
      </main>

      <footer className="footer">
        <p>MediChain · Powered by Ethereum &amp; IPFS</p>
      </footer>
    </div>
  );
}

/* ── Dashboard sub-component ──────────────────────────────────────── */
function Dashboard({ onNavigate, walletAddress }) {
  const cards = [
    {
      icon: "🌱",
      title: "Register Batch",
      desc: "Record a new medicinal plant batch with harvest details and IPFS document proof.",
      page: "register",
      color: "#d4edda",
    },
    {
      icon: "⚗️",
      title: "Process Batch",
      desc: "Log processing methods, dates, and upload quality reports to IPFS.",
      page: "process",
      color: "#cce5ff",
    },
    {
      icon: "🔄",
      title: "Transfer Ownership",
      desc: "Pass a batch to the next stakeholder in the supply chain.",
      page: "transfer",
      color: "#fff3cd",
    },
    {
      icon: "🔍",
      title: "Verify Batch",
      desc: "Instantly verify batch authenticity and trace its full on-chain history.",
      page: "verify",
      color: "#f8d7da",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1>Transparent. Traceable. Trustworthy.</h1>
        <p>
          MediChain leverages blockchain technology to eliminate counterfeiting
          and ensure the authenticity of medicinal plant products from farm to
          pharmacy.
        </p>
        {walletAddress && (
          <div className="hero-address">
            Connected as: <span className="mono">{walletAddress}</span>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {cards.map((c) => (
          <div
            key={c.page}
            className="dashboard-card"
            style={{ "--card-accent": c.color }}
            onClick={() => onNavigate(c.page)}
          >
            <span className="dashboard-card-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span className="dashboard-card-link">Go →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
