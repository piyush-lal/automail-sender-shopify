"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid admin email or password");
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col font-body-md text-on-surface">
      <main className="flex-grow flex items-center justify-center p-container-padding">
        <div className="w-full max-w-[440px] bg-white border border-outline-variant p-stack-lg md:p-10 rounded-xl auth-card">
          <div className="mb-8 text-center">
            <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            <h2 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">Admin Portal</h2>
            <p className="font-body-sm text-sm text-on-surface-variant">Sign in to manage users and monitor activity.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="email">Admin Email</label>
              <div className="relative group">
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="email" name="email" placeholder="admin@domain.com" type="email" required 
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="password">Password</label>
              <div className="relative group">
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="password" name="password" placeholder="••••••••" type="password" required 
                />
                <button type="button" className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">visibility</button>
              </div>
            </div>
            
            <button type="submit" className="w-full h-11 bg-on-surface text-white rounded-lg font-label-md text-sm font-semibold hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2">
              Login to Admin
              <span className="material-symbols-outlined text-sm">login</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
