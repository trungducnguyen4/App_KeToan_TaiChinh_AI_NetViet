import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { AppIcon } from "../components/icons";
import { LoginResponse, saveSession } from "../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), password })
      });

      const body = (await response.json()) as LoginResponse | { message?: string | string[] };

      if (!response.ok || !("accessToken" in body)) {
        const message = "message" in body ? body.message : undefined;
        throw new Error(Array.isArray(message) ? message[0] : message || "Đăng nhập không thành công");
      }

      saveSession(body);
      const nextPath = typeof router.query.next === "string" && router.query.next.startsWith("/")
        ? router.query.next
        : "/";
      await router.replace(nextPath);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Không thể kết nối đến máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase" aria-label="Giới thiệu hệ thống">
        <div className="login-brand">
          <span className="login-brand-mark">W</span>
          <span>
            <strong>Workit Ops</strong>
            <small>Accounting intelligence</small>
          </span>
        </div>

        <div className="login-showcase-copy">
          <span className="login-kicker">Nền tảng quản trị tài chính</span>
          <h1>Vận hành kế toán rõ ràng, kiểm soát dữ liệu tập trung.</h1>
          <p>
            Đồng bộ nghiệp vụ, theo dõi chứng từ và hỗ trợ phê duyệt trên một không gian làm việc an toàn.
          </p>
        </div>

        <div className="login-feature-grid">
          <div><AppIcon name="ShieldCheck" /><span><strong>Phân quyền theo vai trò</strong><small>Kiểm soát đúng thẩm quyền</small></span></div>
          <div><AppIcon name="RefreshCw" /><span><strong>Đồng bộ Workit</strong><small>Dữ liệu nhất quán, có nguồn</small></span></div>
        </div>
      </section>

      <section className="login-form-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-heading">
            <span className="login-mobile-mark">W</span>
            <p className="eyebrow">Chào mừng trở lại</p>
            <h2>Đăng nhập hệ thống</h2>
            <p>Sử dụng tài khoản được cấp để tiếp tục làm việc.</p>
          </div>

          <label className="login-field">
            <span>Tên đăng nhập hoặc email</span>
            <div className="login-input-wrap">
              <AppIcon name="User" />
              <input
                autoComplete="username"
                autoFocus
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
          </label>

          <label className="login-field">
            <span>Mật khẩu</span>
            <div className="login-input-wrap">
              <AppIcon name="LockKeyhole" />
              <input
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </label>

          {error ? <div className="login-error" role="alert">{error}</div> : null}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            {!isSubmitting ? <AppIcon name="ArrowRight" /> : null}
          </button>

          <p className="login-help">Liên hệ Giám đốc hoặc Kế toán trưởng nếu bạn chưa được cấp tài khoản.</p>
        </form>
      </section>
    </main>
  );
}
