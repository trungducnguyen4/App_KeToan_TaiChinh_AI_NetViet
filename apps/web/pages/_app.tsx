import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AiChatWidget } from "../components/ai-chat-widget";
import { getAccessToken } from "../lib/auth";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isLoginPage = router.pathname === "/login";
    const token = getAccessToken();

    if (!token && !isLoginPage) {
      const next = router.asPath !== "/" ? `?next=${encodeURIComponent(router.asPath)}` : "";
      void router.replace(`/login${next}`);
      return;
    }

    if (token && isLoginPage) {
      void router.replace("/");
      return;
    }

    setIsReady(true);
  }, [router.asPath, router.pathname]);

  if (!isReady) {
    return <div className="auth-loading"><span className="auth-loading-mark">W</span></div>;
  }

  return (
    <>
      <Component {...pageProps} />
      {router.pathname !== "/login" ? <AiChatWidget /> : null}
    </>
  );
}
