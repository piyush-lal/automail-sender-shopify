"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-highest transition-colors text-outline hover:text-error"
      title="Logout"
    >
      <span className="material-symbols-outlined text-xl">logout</span>
    </button>
  );
}
