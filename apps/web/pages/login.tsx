import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AppIcon } from "../components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
      }

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("workit_user", JSON.stringify(data.user));
        localStorage.setItem("workit_token", data.token);
      }

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Đăng nhập | Dầu Dừa - Hệ thống Quản trị Xưởng &amp; Giá thành</title>
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b3f34 0%, #15936b 100%)",
          padding: "20px"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
            padding: "36px 32px",
            boxSizing: "border-box"
          }}
        >
          {/* Logo & Brand Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #15936b 0%, #087f5b 100%)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(21, 147, 107, 0.35)",
                marginBottom: "14px"
              }}
            >
              <AppIcon name="Droplet" size={28} />
            </div>
            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.5px"
              }}
            >
              Dầu Dừa
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#64748b",
                fontWeight: 500
              }}
            >
              Hệ thống Quản trị Xưởng Ép Dầu Dừa Thô
            </p>
          </div>

          {/* Quick Credential Hint Box */}
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#065f46"
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: 6 }}>
              <AppIcon name="ShieldCheck" size={16} />
              Tài khoản quản trị xưởng demo:
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span>Tên đăng nhập: <strong>admin1</strong></span>
              <span>Mật khẩu: <strong>admin123</strong></span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AppIcon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px"
                }}
              >
                Tên đăng nhập
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#0f172a",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px"
                }}
              >
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#0f172a",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #15936b 0%, #087f5b 100%)",
                border: "none",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(21, 147, 107, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "6px"
              }}
            >
              {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
              <AppIcon name="ShieldCheck" size={18} />
            </button>
          </form>

          {/* Footer note */}
          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
            Hệ thống Quản lý Kế toán &amp; Điều hành Xưởng Ép Dầu Dừa
          </div>
        </div>
      </div>
    </>
  );
}
