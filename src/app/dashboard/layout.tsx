import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["user", "admin"].includes((session.user as any).role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col font-body-md text-on-surface">
      <header className="w-full flex items-center justify-between h-16 px-container-padding bg-surface border-b border-outline-variant sticky top-0 z-10">
        <div className="flex items-center gap-stack-md">
          <Link href="/dashboard" className="flex items-center gap-stack-sm">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail_lock</span>
            <span className="font-headline-sm text-xl font-bold tracking-tight text-on-surface hidden md:inline">Email Automator</span>
          </Link>
          <div className="h-6 w-px bg-outline-variant hidden md:block"></div>
          <nav className="hidden md:flex items-center gap-stack-md">
            <Link href="/dashboard" className="font-label-md text-sm font-semibold text-primary">Campaigns</Link>
            <Link href="/dashboard/profile" className="font-label-md text-sm text-on-surface-variant hover:text-on-surface transition-colors">SMTP Settings</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-stack-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <span className="font-label-md text-sm hidden sm:inline">{session.user?.name}</span>
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
