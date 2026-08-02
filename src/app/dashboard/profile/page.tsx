"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [config, setConfig] = useState({
    service: "",
    host: "",
    port: 587,
    user: "",
    password: "",
    secure: false,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/smtp").then(res => res.json()).then(data => {
      if (data && Object.keys(data).length > 0) {
        setConfig({
          service: data.service || "",
          host: data.host || "",
          port: data.port || 587,
          user: data.user || "",
          password: data.password || "",
          secure: data.secure || false,
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const res = await fetch("/api/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setStatus("Settings saved successfully!");
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Failed to save settings.");
      }
    } catch (err) {
      setStatus("Error saving settings.");
    }
  };

  return (
    <div className="p-container-padding max-w-3xl mx-auto space-y-stack-lg">
      <div>
        <h1 className="font-display-lg text-3xl font-bold text-on-surface">SMTP Settings</h1>
        <p className="font-body-sm text-on-surface-variant">Configure your email provider to send automated emails.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {status && (
            <div className={`p-4 rounded-md text-sm ${status.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-container text-on-surface-variant'}`}>
              {status}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface">Service (Optional)</label>
              <input 
                value={config.service} onChange={(e) => setConfig({...config, service: e.target.value})}
                placeholder="e.g. gmail"
                className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface">Host</label>
              <input 
                value={config.host} onChange={(e) => setConfig({...config, host: e.target.value})}
                placeholder="smtp.example.com"
                className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface">Port</label>
              <input 
                type="number"
                value={config.port} onChange={(e) => setConfig({...config, port: Number(e.target.value)})}
                className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2 flex items-center pt-8">
              <input 
                type="checkbox" id="secure"
                checked={config.secure} onChange={(e) => setConfig({...config, secure: e.target.checked})}
                className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" 
              />
              <label htmlFor="secure" className="ml-2 font-label-md text-sm font-medium text-on-surface">Use Secure (TLS/SSL)</label>
            </div>
          </div>

          <hr className="border-outline-variant my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface">SMTP Username (Email)</label>
              <input 
                value={config.user} onChange={(e) => setConfig({...config, user: e.target.value})}
                type="text" required
                className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-sm font-medium text-on-surface">SMTP Password / App Password</label>
              <input 
                value={config.password} onChange={(e) => setConfig({...config, password: e.target.value})}
                type="password" required
                className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="h-11 px-6 bg-primary text-white rounded-lg font-label-md text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">
              Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
