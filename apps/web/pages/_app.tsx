import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AiChatWidget } from "../components/ai-chat-widget";
import { fetchApi } from "../lib/api";
import { AuthUser, clearSession } from "../lib/auth";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const isLoginPage = router.pathname === "/login";

    setIsReady(false);

    void fetchApi<AuthUser>("/auth/me")
      .then(() => {
        if (cancelled) {
          return;
        }

        if (isLoginPage) {
          void router.replace("/");
          return;
        }

        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearSession();
        if (isLoginPage) {
          setIsReady(true);
          return;
        }

        const next = router.asPath !== "/" ? `?next=${encodeURIComponent(router.asPath)}` : "";
        void router.replace(`/login${next}`);
      });

    return () => {
      cancelled = true;
    };
  }, [router.asPath, router.pathname]);

  if (!isReady) {
    return (
      <div className="auth-loading">
        <span className="auth-loading-mark">W</span>
      </div>
    );
  }

  return (
    <>
      <Component {...pageProps} />
      {router.pathname !== "/login" ? <AiChatWidget /> : null}
    </>
  );
}
