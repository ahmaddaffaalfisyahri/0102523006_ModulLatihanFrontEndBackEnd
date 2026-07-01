"use client";

import { useState } from "react";
import { saveAuth } from "@/lib/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Login gagal");
          return;
        }

        saveAuth(result.token, result.user);
        setSuccess("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          window.location.href = "/mahasiswa";
        }, 1000);
      } else {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Registrasi gagal");
          return;
        }

        setSuccess("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <h2>{isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}</h2>
          <p>{isLogin ? "Masuk ke sistem pengelolaan data mahasiswa" : "Daftarkan akun untuk mengelola data mahasiswa"}</p>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Daffa"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="daffa@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="toggle-auth-mode"
            >
              {isLogin ? "Daftar di sini" : "Login di sini"}
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 24px;
          font-weight: 700;
        }
        .auth-header p {
          color: #64748b;
          margin: 8px 0 0 0;
          font-size: 14px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-submit {
          margin-top: 10px;
          width: 100%;
          padding: 14px;
          font-size: 16px;
        }
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }
        .toggle-auth-mode {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          font-size: 14px;
        }
        .toggle-auth-mode:hover {
          text-decoration: underline;
          color: var(--primary-hover);
        }
        .message.success {
          background: #effaf5;
          color: #0d9488;
          border-left: 4px solid #0d9488;
        }
      `}} />
    </main>
  );
}
