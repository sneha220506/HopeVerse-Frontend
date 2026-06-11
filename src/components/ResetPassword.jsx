import React, { useState } from "react";
import { authAPI } from "../services/api";
import Footer from "./Footer";

const ResetPassword = ({ token }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    console.log(token,password,confirmPassword);
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password, confirmPassword);
      alert("Success! Password changed.");
      window.location.href = "/"; 
    } catch (err) {
      setError(err.response?.data?.message || "Link expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col overflow-hidden">
      
      {/* 1. TOP NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-hero-grad rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="text-white text-lg">🤝</span>
            </div>
            <span className="text-slate-dark font-heading font-bold text-lg tracking-tight">
              Hope<span className="text-primary">Verse</span>
            </span>
          </button>
        <button 
          onClick={() => window.location.href = '/'} 
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#8E7CC3] transition-colors"
        >
          Login
        </button>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow flex items-center justify-center px-4 relative">
        {/* Background Pulse Effect */}
        <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-[#8E7CC3]/5 rounded-full blur-[120px] animate-pulse" />

        <div className="relative z-10 w-full max-w-md pt-20">
          <div className="text-center mb-10 animate-reveal">
            <div className="w-20 h-20 bg-gradient-to-br from-white to-[#F3F0FF] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#8E7CC3]/10 mx-auto mb-6 transform hover:rotate-12 transition-all duration-500">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
              New <span className="text-[#8E7CC3]">Security</span>
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-3 px-4">
              Enter your new system access password
            </p>
          </div>

          <div className="auth-card rounded-[3.5rem] p-10 md:p-12 bg-white/90 backdrop-blur-xl border border-white shadow-2xl shadow-[#8E7CC3]/10">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="input-group">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-semibold text-slate-700 focus:outline-none focus:border-[#8E7CC3] transition-all"
                />
              </div>

              <div className="input-group">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-semibold text-slate-700 focus:outline-none focus:border-[#8E7CC3] transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-[#8E7CC3] text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {loading ? "Updating System..." : "Update Password"}
              </button>
            </form>
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-slate-400 hover:text-[#8E7CC3] text-[10px] font-black uppercase tracking-widest transition-colors ml-32"
          >
            Back to Home Screen
          </button>
        </div>
        
      </div>

      {/* 3. REGULAR FOOTER */}
      <Footer/>
    </div>
  );
};

export default ResetPassword;