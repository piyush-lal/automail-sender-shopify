"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-container-padding max-w-7xl mx-auto space-y-stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface">User Management</h1>
          <p className="font-body-sm text-on-surface-variant">Monitor user activity and email campaigns.</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-outline-variant shadow-sm text-center px-6">
          <span className="block font-headline-sm text-primary font-bold">{users.length}</span>
          <span className="font-label-xs text-outline uppercase tracking-wider">Total Users</span>
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
          <h2 className="font-headline-sm text-lg font-semibold text-on-surface">Registered Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">User Name</th>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Email Address</th>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Joined</th>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant text-right">Emails Sent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-outline-variant hover:bg-surface transition-colors">
                    <td className="p-4 font-label-md text-on-surface">{user.name}</td>
                    <td className="p-4 font-body-sm text-on-surface-variant">{user.email}</td>
                    <td className="p-4 font-body-sm text-on-surface-variant">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                        {user.totalEmailsSent || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
