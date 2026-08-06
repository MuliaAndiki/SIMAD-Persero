"use client";

import { APP_SESSION_COOKIE_KEY } from "@/configs/cookies.config";
import { getCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  // const pathname = usePathname();
  // const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  // const dispatch = useAppDispatch();

  // React.useEffect(() => {
  //   const isAuthPage =
  //     pathname?.startsWith("/login") ||
  //     pathname?.startsWith("/register") ||
  //     pathname?.startsWith("/home");

  //   const isAuthenticated = Boolean(currentUser?.user?.token);

  //   if (!isAuthenticated && !isAuthPage) {
  //     router.replace("/login");
  //     return;
  //   }

  //   if (isAuthenticated && isAuthPage) {
  //     // setUp
  //     // router.replace('/home');
  //     return;
  //   }
  // }, [pathname, currentUser, router]);

  return <>{children}</>;
}
