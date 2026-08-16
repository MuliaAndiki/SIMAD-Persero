import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { APP_SESSION_COOKIE_KEY } from "@/configs/cookies.config";
import BlankLayout from "@/core/layouts/blank.layout";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sudah login? Jangan biarkan membuka halaman auth — arahkan ke dashboard role.
  const store = await cookies();
  const accessToken = store.get(APP_SESSION_COOKIE_KEY)?.value;

  if (accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="w-full">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e6e6e6_1px,transparent_1px),linear-gradient(to_bottom,#e6e6e6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-10 z-0 " />
      <BlankLayout>{children}</BlankLayout>
    </main>
  );
}
