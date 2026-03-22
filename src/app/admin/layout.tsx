import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/api/admin-auth";
import { AdminShell } from "./admin-shell";

export const metadata = {
  title: "Admin — MockHero",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!isAdmin(userId)) {
    notFound();
  }

  return <AdminShell>{children}</AdminShell>;
}
