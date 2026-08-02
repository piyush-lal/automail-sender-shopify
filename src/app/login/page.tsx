"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
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
          <span className="font-label-md text-sm text-on-surface-variant">Don't have an account?</span>
          <Link href="/register" className="font-label-md text-sm font-semibold text-primary hover:underline">Get Started</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg max-w-[1100px] w-full items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex lg:col-span-6 flex-col gap-stack-lg pr-stack-lg"
          >
            <div className="space-y-stack-sm">
              <h1 className="font-display-lg text-4xl font-bold text-on-surface leading-tight">
                Powering high-growth <br/><span className="text-primary">Shopify Partners.</span>
              </h1>
              <p className="font-body-md text-base text-on-surface-variant max-w-md mt-4">
                The Expert Assistant for your email campaigns. Scale your outreach with precision, reliability, and institutional trust.
              </p>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl auth-card space-y-stack-md relative overflow-hidden mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="font-label-xs text-xs font-bold text-secondary uppercase tracking-wider">Active Campaigns</span>
                </div>
                <span className="font-label-xs text-xs text-on-surface-variant">Live metrics</span>
              </div>
              <div className="h-32 w-full rounded-lg bg-surface-container-low flex items-end p-stack-sm gap-2">
                <div className="flex-1 bg-primary-fixed-dim rounded-t-sm" style={{ height: "40%" }}></div>
                <div className="flex-1 bg-primary-fixed-dim rounded-t-sm" style={{ height: "65%" }}></div>
                <div className="flex-1 bg-primary-container rounded-t-sm" style={{ height: "90%" }}></div>
                <div className="flex-1 bg-primary-fixed-dim rounded-t-sm" style={{ height: "55%" }}></div>
                <div className="flex-1 bg-primary-fixed-dim rounded-t-sm" style={{ height: "75%" }}></div>
                <div className="flex-1 bg-primary-fixed-dim rounded-t-sm" style={{ height: "45%" }}></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[440px] bg-white border border-outline-variant p-stack-lg md:p-10 rounded-xl auth-card">
              <div className="mb-8">
                <h2 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">Welcome Back</h2>
                <p className="font-body-sm text-sm text-on-surface-variant">Enter your credentials to access your workspace.</p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm">{error}</div>}
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
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="password">Password</label>
                    <Link className="font-label-md text-sm font-semibold text-primary hover:underline" href="/forget-password">Forgot password?</Link>
                  </div>
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
                
                <button type="submit" className="w-full h-11 bg-primary text-white rounded-lg font-label-md text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2">
                  Sign In
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
