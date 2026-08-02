import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col font-body-md text-on-surface">
      <header className="w-full flex items-center justify-between h-16 px-container-padding bg-black border-b border-outline-variant sticky top-0 z-10 text-white">
        <div className="flex items-center gap-stack-md">
          <Link href="/admin/dashboard" className="flex items-center gap-stack-sm">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            <span className="font-headline-sm text-xl font-bold tracking-tight hidden md:inline">Admin Portal</span>
          </Link>
          <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>
          <nav className="hidden md:flex items-center gap-stack-md">
            <Link href="/admin/dashboard" className="font-label-md text-sm font-semibold">User Management</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-stack-md">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-sm hidden sm:inline">Admin User</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
