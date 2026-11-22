import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== "undefined") {
      const isLoginPage = router.pathname === "/login";
      const user = localStorage.getItem("workit_user");
      if (!user && !isLoginPage) {
        // If not logged in, redirect to /login
        router.push("/login");
      }
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}
