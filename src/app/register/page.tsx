"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col font-body-md text-on-surface">
      <header className="w-full flex items-center justify-between h-16 px-container-padding bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail_lock</span>
          <span className="font-headline-sm text-xl font-bold tracking-tight text-on-surface">Email Automator</span>
        </div>
        <div className="hidden md:flex items-center gap-stack-md">
          <span className="font-label-md text-sm text-on-surface-variant">Already have an account?</span>
          <Link href="/login" className="font-label-md text-sm font-semibold text-primary hover:underline">Sign In</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-container-padding">
        <div className="w-full max-w-[440px] bg-white border border-outline-variant p-stack-lg md:p-10 rounded-xl auth-card">
          <div className="mb-8">
            <h2 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">Create an Account</h2>
            <p className="font-body-sm text-sm text-on-surface-variant">Get started with the Expert Assistant.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="name">Full Name</label>
              <div className="relative group">
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="name" name="name" placeholder="John Doe" type="text" required 
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="email" name="email" placeholder="name@company.com" type="email" required 
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
                  id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">
                  {showPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-11 bg-primary text-white rounded-lg font-label-md text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign Up
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
