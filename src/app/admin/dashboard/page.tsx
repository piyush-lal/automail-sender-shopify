"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handleViewLogs = async (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
    setLogsLoading(true);
    setUserLogs([]);
    
    try {
      const res = await fetch(`/api/admin/logs?userId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setUserLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="p-container-padding max-w-7xl mx-auto space-y-stack-lg relative">
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
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No users found.</td></tr>
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
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleViewLogs(user)}
                        className="text-sm bg-surface-container-high hover:bg-surface-container-highest px-3 py-1.5 rounded-md border border-outline-variant transition-colors"
                      >
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <div>
                  <h3 className="font-headline-sm font-bold">Email Logs: {selectedUser?.name}</h3>
                  <p className="text-sm text-on-surface-variant">{selectedUser?.email}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-surface">
                {logsLoading ? (
                  <div className="text-center py-8 text-on-surface-variant">Loading logs...</div>
                ) : userLogs.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant">No emails sent by this user yet.</div>
                ) : (
                  <div className="space-y-4">
                    {userLogs.map(log => (
                      <div key={log._id} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-on-surface">{log.businessName || log.businessEmail}</div>
                            <div className="text-sm text-primary">{log.businessEmail}</div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status.toUpperCase()}
                            </span>
                            <div className="text-xs text-on-surface-variant mt-1">
                              {new Date(log.sentAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 bg-surface-container-lowest p-3 rounded border border-outline-variant">
                          <div className="text-sm font-bold text-on-surface mb-1">Subject: {log.subject || <span className="text-outline italic">Not recorded</span>}</div>
                          <div className="text-sm text-on-surface-variant whitespace-pre-wrap">{log.message || <span className="text-outline italic">Not recorded</span>}</div>
                          {log.hasAttachment && (
                            <div className="mt-2 text-xs font-semibold text-primary flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                              Attached: {log.attachmentName || 'Yes'}
                            </div>
                          )}
                        </div>
                        
                        {log.errorMessage && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                            Error: {log.errorMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
