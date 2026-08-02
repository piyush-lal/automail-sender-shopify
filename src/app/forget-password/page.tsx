"use client";

import Link from "next/link";

export default function ForgetPasswordPage() {
  return (
    <div className="bg-mesh min-h-screen flex flex-col font-body-md text-on-surface">
      <main className="flex-grow flex items-center justify-center p-container-padding">
        <div className="w-full max-w-[440px] bg-white border border-outline-variant p-stack-lg md:p-10 rounded-xl auth-card">
          <div className="mb-8 text-center">
            <h2 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">Reset Password</h2>
            <p className="font-body-sm text-sm text-on-surface-variant">Enter your email to receive a reset link.</p>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="email" name="email" placeholder="name@company.com" type="email" required 
                />
              </div>
            </div>
            
            <button type="submit" className="w-full h-11 bg-primary text-white rounded-lg font-label-md text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">
              Send Reset Link
            </button>

            <div className="text-center">
              <Link href="/login" className="text-primary hover:underline text-sm font-medium">Back to Login</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
