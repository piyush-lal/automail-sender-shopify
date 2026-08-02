"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Tab = "unsent" | "sent" | "failed" | "donotsend" | "noemail";
type SortOption = "none" | "most_sent" | "least_sent" | "newest" | "oldest";

export default function DashboardPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [doNotSendList, setDoNotSendList] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>("unsent");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("none");
  
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showVarInfo, setShowVarInfo] = useState(false);
  const [subject, setSubject] = useState("Partnership Opportunity for {name}");
  const [message, setMessage] = useState("Hi {name},\n\nWe saw your great work at {name} and would love to explore a partnership.\n\nBest regards,\nAdmin");
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  
  const [viewContact, setViewContact] = useState<any | null>(null);

  const [activeCampaign, setActiveCampaign] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    const fetchCampaignStatus = async () => {
      try {
        const res = await fetch('/api/campaign-status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.active && data.job) {
          setActiveCampaign(data.job);
          if (data.job.status !== 'running') {
            fetchData();
          }
        } else {
          setActiveCampaign(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    interval = setInterval(fetchCampaignStatus, 3000);
    fetchCampaignStatus();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, logsRes, dnsRes] = await Promise.all([
        fetch("/api/contacts"),
        fetch("/api/email-logs"),
        fetch("/api/do-not-send")
      ]);
      const contactsData = await contactsRes.json();
      const logsData = await logsRes.json();
      const dnsData = await dnsRes.json();
      setContacts(contactsData);
      setLogs(logsData);
      setDoNotSendList(dnsData);
    } catch (err) {
      console.error(err);
    }
  };

  const doNotSendSet = useMemo(() => new Set(doNotSendList.map(item => item.email)), [doNotSendList]);
  
  const emailStats = useMemo(() => {
    const stats: Record<string, { count: number, failedCount: number, latest: Date, latestError: string | null }> = {};
    logs.forEach(log => {
      if (!stats[log.businessEmail]) {
        stats[log.businessEmail] = { count: 0, failedCount: 0, latest: new Date(log.sentAt), latestError: null };
      }
      
      const logDate = new Date(log.sentAt);
      if (logDate > stats[log.businessEmail].latest) {
        stats[log.businessEmail].latest = logDate;
      }
      
      if (log.status === 'success') {
        stats[log.businessEmail].count++;
      } else if (log.status === 'failed') {
        stats[log.businessEmail].failedCount++;
        stats[log.businessEmail].latestError = log.errorMessage || "Unknown error";
      }
    });
    return stats;
  }, [logs]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach(c => {
      if (c.primary_location) {
        const parts = c.primary_location.split(',');
        if (parts.length > 1) {
          set.add(parts[parts.length - 1].trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [contacts]);

  const processedContacts = useMemo(() => {
    return contacts.map(c => ({
      ...c,
      hasValidEmail: !!c.email && c.email !== "N/A",
      sentCount: emailStats[c.email]?.count || 0,
      failedCount: emailStats[c.email]?.failedCount || 0,
      latestSent: emailStats[c.email]?.latest || null,
      latestError: emailStats[c.email]?.latestError || null,
      isDoNotSend: doNotSendSet.has(c.email)
    }));
  }, [contacts, emailStats, doNotSendSet]);

  const getFilteredList = (tab: Tab) => {
    let list = processedContacts.filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter ? c.primary_location?.includes(countryFilter) : true;
      if (!matchSearch || !matchCountry) return false;

      if (tab === "noemail") return !c.hasValidEmail;
      
      // If it doesn't have a valid email, it shouldn't be in the other tabs
      if (!c.hasValidEmail) return false;

      if (tab === "donotsend") return c.isDoNotSend;
      if (tab === "sent") return c.sentCount > 0 && !c.isDoNotSend;
      if (tab === "failed") return c.failedCount > 0 && c.sentCount === 0 && !c.isDoNotSend;
      if (tab === "unsent") return c.sentCount === 0 && c.failedCount === 0 && !c.isDoNotSend;
      return false;
    });

    if (tab === "sent") {
      if (sortOption === "most_sent") list.sort((a, b) => b.sentCount - a.sentCount);
      if (sortOption === "least_sent") list.sort((a, b) => a.sentCount - b.sentCount);
      if (sortOption === "newest") list.sort((a, b) => (b.latestSent?.getTime() || 0) - (a.latestSent?.getTime() || 0));
      if (sortOption === "oldest") list.sort((a, b) => (a.latestSent?.getTime() || 0) - (b.latestSent?.getTime() || 0));
    }

    return list;
  };

  const currentList = useMemo(() => getFilteredList(activeTab), [processedContacts, activeTab, search, countryFilter, sortOption]);
  
  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentList.slice(start, start + itemsPerPage);
  }, [currentList, currentPage]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedContacts([]);
  };

  const selectCurrentPage = () => {
    const newSelections = [...selectedContacts];
    paginatedList.forEach(c => {
      if (!newSelections.find(s => s.url === c.url)) {
        newSelections.push(c);
      }
    });
    setSelectedContacts(newSelections);
  };

  const selectAllFiltered = () => {
    const newSelections = [...selectedContacts];
    currentList.forEach(c => {
      if (!newSelections.find(s => s.url === c.url)) {
        newSelections.push(c);
      }
    });
    setSelectedContacts(newSelections);
  };

  const toggleSelection = (contact: any) => {
    if (selectedContacts.find(c => c.url === contact.url)) {
      setSelectedContacts(selectedContacts.filter(c => c.url !== contact.url));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const markAsDoNotSend = async (email: string) => {
    try {
      await fetch("/api/do-not-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason: "Marked from dashboard" })
      });
      fetchData();
      if (viewContact) setViewContact(null);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromDoNotSend = async (email: string) => {
    try {
      await fetch(`/api/do-not-send?email=${encodeURIComponent(email)}`, { method: "DELETE" });
      fetchData();
      if (viewContact) setViewContact(null);
    } catch (err) {
      console.error(err);
    }
  };

  const submitBulkEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContacts.length === 0) return;
    
    setIsSending(true);
    
    const formData = new FormData();
    formData.append("contactUrls", JSON.stringify(selectedContacts.map(c => c.url)));
    formData.append("subject", subject);
    formData.append("message", message);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      // The API will start the process in the background and return immediately.
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          const data = await res.json();
          if (data.message === 'SMTP_NOT_CONFIGURED') {
            alert("SMTP is not configured. Redirecting to settings...");
            setShowComposeModal(false);
            router.push("/dashboard/profile");
            return;
          }
        }
        console.error("Failed to start bulk send:", res.statusText);
        alert("Failed to start campaign.");
        return;
      }
      
      // Clear up UI after successfully initiating the background process
      setShowComposeModal(false);
      setSelectedContacts([]);
      // Small timeout to allow some logs to appear before refreshing
      setTimeout(fetchData, 2000); 
    } catch (err) {
      console.error("Failed to start bulk send:", err);
      alert("An error occurred while starting the campaign.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-container-padding max-w-7xl mx-auto space-y-4 md:space-y-stack-lg">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface">Campaigns</h1>
          <p className="font-body-sm text-on-surface-variant">Manage and send your automated emails.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border border-outline-variant shadow-sm overflow-x-auto w-full xl:w-auto">
          <div className="text-center px-4 flex-shrink-0">
            <span className="block font-headline-sm text-on-surface font-bold">{contacts.length}</span>
            <span className="font-label-xs text-outline uppercase tracking-wider">Total</span>
          </div>
          <div className="w-px h-8 bg-outline-variant hidden sm:block"></div>
          <div className="text-center px-4 flex-shrink-0">
            <span className="block font-headline-sm text-primary font-bold">{processedContacts.filter(c => c.sentCount === 0 && !c.isDoNotSend && c.hasValidEmail).length}</span>
            <span className="font-label-xs text-outline uppercase tracking-wider">Unsent</span>
          </div>
          <div className="w-px h-8 bg-outline-variant hidden sm:block"></div>
          <div className="text-center px-4 flex-shrink-0">
            <span className="block font-headline-sm text-secondary font-bold">{processedContacts.filter(c => c.sentCount > 0 && !c.isDoNotSend && c.hasValidEmail).length}</span>
            <span className="font-label-xs text-outline uppercase tracking-wider">Sent</span>
          </div>
          <div className="w-px h-8 bg-outline-variant hidden sm:block"></div>
          <div className="text-center px-4 flex-shrink-0">
            <span className="block font-headline-sm text-error font-bold">{processedContacts.filter(c => c.failedCount > 0 && !c.isDoNotSend && c.hasValidEmail).length}</span>
            <span className="font-label-xs text-outline uppercase tracking-wider">Failed</span>
          </div>
          <div className="w-px h-8 bg-outline-variant hidden sm:block"></div>
          <div className="text-center px-4 flex-shrink-0">
            <span className="block font-headline-sm text-error font-bold">{doNotSendList.length}</span>
            <span className="font-label-xs text-outline uppercase tracking-wider">Do Not Send</span>
          </div>
        </div>
      </div>

      {activeCampaign && activeCampaign.status === 'running' && (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-headline-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary animate-spin">sync</span> Sending Campaign...
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Processing {activeCampaign.totalContacts} contacts
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-xs uppercase tracking-wide text-outline">Sent</div>
                <div className="font-bold text-success">{activeCampaign.successCount}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-outline">Failed</div>
                <div className="font-bold text-error">{activeCampaign.failedCount}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-outline">Pending</div>
                <div className="font-bold text-secondary">
                  {Math.max(0, activeCampaign.totalContacts - activeCampaign.processedCount)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (activeCampaign.processedCount / activeCampaign.totalContacts) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col h-[75vh]">
        {/* Tabs */}
        <div className="flex overflow-x-auto p-4 gap-2 border-b border-outline-variant bg-surface-container-lowest">
          <button 
            onClick={() => handleTabChange("unsent")}
            className={`px-4 py-2 font-label-md font-bold text-sm rounded-full transition-colors whitespace-nowrap border ${activeTab === 'unsent' ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'}`}
          >
            Unsent
          </button>
          <button 
            onClick={() => handleTabChange("sent")}
            className={`px-4 py-2 font-label-md font-bold text-sm rounded-full transition-colors whitespace-nowrap border ${activeTab === 'sent' ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'}`}
          >
            Sent
          </button>
          <button 
            onClick={() => handleTabChange("failed")}
            className={`px-4 py-2 font-label-md font-bold text-sm rounded-full transition-colors whitespace-nowrap border ${activeTab === 'failed' ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'}`}
          >
            Failed
          </button>
          <button 
            onClick={() => handleTabChange("donotsend")}
            className={`px-4 py-2 font-label-md font-bold text-sm rounded-full transition-colors whitespace-nowrap border ${activeTab === 'donotsend' ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'}`}
          >
            Do Not Send
          </button>
          <button 
            onClick={() => handleTabChange("noemail")}
            className={`px-4 py-2 font-label-md font-bold text-sm rounded-full transition-colors whitespace-nowrap border flex items-center gap-2 ${activeTab === 'noemail' ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'}`}
          >
            No Email
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'noemail' ? 'bg-white/20' : 'bg-surface-container-high'}`}>
              {processedContacts.filter(c => !c.hasValidEmail).length}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-outline-variant focus:border-primary outline-none transition-all"
              />
            </div>
            <select 
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-4 rounded-md border border-outline-variant focus:border-primary outline-none bg-white min-w-[150px]"
            >
              <option value="">All Locations</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {activeTab === 'sent' && (
              <select 
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value as SortOption); setCurrentPage(1); }}
                className="h-10 px-4 rounded-md border border-outline-variant focus:border-primary outline-none bg-white min-w-[150px]"
              >
                <option value="none">Sort By</option>
                <option value="most_sent">Most Sent</option>
                <option value="least_sent">Least Sent</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {(activeTab === 'unsent' || activeTab === 'sent' || activeTab === 'failed') && (
              <>
                <button 
                  onClick={selectCurrentPage}
                  className="h-10 px-4 bg-surface-container border border-outline-variant text-on-surface font-label-md rounded-md hover:bg-surface-dim transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm hidden sm:inline">checklist</span>
                  Select Page
                </button>
                <button 
                  onClick={selectAllFiltered}
                  className="h-10 px-4 bg-primary-container text-on-primary-container font-label-md rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm hidden sm:inline">done_all</span>
                  Select All ({currentList.length})
                </button>
                <button 
                  onClick={clearSelection}
                  disabled={selectedContacts.length === 0}
                  className="h-10 px-4 bg-surface-container border border-outline-variant text-on-surface font-label-md rounded-md hover:bg-surface-dim transition-colors disabled:opacity-50"
                >
                  Clear ({selectedContacts.length})
                </button>
                <button 
                  onClick={() => setShowComposeModal(true)}
                  disabled={selectedContacts.length === 0}
                  className="h-10 px-6 bg-primary text-white font-label-md font-bold rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Compose
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-low sticky top-0 z-10">
              <tr>
                {(activeTab === 'unsent' || activeTab === 'sent' || activeTab === 'failed') && <th className="p-4 w-12 border-b border-outline-variant"></th>}
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Name</th>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Email</th>
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Location</th>
                {activeTab === 'sent' && <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant text-center">Sent Count</th>}
                {activeTab === 'failed' && <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant">Error Details</th>}
                <th className="p-4 font-label-md text-on-surface-variant border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((contact) => {
                const isSelected = !!selectedContacts.find(c => c.url === contact.url);
                return (
                  <tr key={contact.url} onClick={() => setViewContact(contact)} className={`border-b border-outline-variant hover:bg-surface transition-colors cursor-pointer ${isSelected ? 'bg-primary-fixed-dim/20' : ''}`}>
                    {(activeTab === 'unsent' || activeTab === 'sent' || activeTab === 'failed') && (
                      <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(contact)} className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer" />
                      </td>
                    )}
                    <td className="p-4">
                      <div className="font-label-md text-on-surface font-semibold">{contact.name}</div>
                      <a href={contact.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="font-body-sm text-primary hover:underline">{contact.website !== 'N/A' ? 'Website' : ''}</a>
                    </td>
                    <td className="p-4 font-body-sm text-on-surface">{contact.email}</td>
                    <td className="p-4 font-body-sm text-on-surface-variant">{contact.primary_location}</td>
                    {activeTab === 'sent' && (
                      <td className="p-4 text-center font-bold text-secondary">{contact.sentCount}</td>
                    )}
                    {activeTab === 'failed' && (
                      <td className="p-4 font-mono text-[10px] text-error max-w-[200px] truncate" title={contact.latestError}>{contact.latestError}</td>
                    )}
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewContact(contact)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant" title="View Details">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        {activeTab === 'sent' && (
                          <button onClick={() => markAsDoNotSend(contact.email)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/10 text-error" title="Mark as Responded / Do Not Send">
                            <span className="material-symbols-outlined text-xl">block</span>
                          </button>
                        )}
                        {activeTab === 'donotsend' && (
                          <button onClick={() => removeFromDoNotSend(contact.email)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary" title="Remove from Do Not Send">
                            <span className="material-symbols-outlined text-xl">settings_backup_restore</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">No contacts found in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body-sm text-on-surface-variant text-center sm:text-left">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentList.length)} of {currentList.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-surface-container rounded border border-outline-variant text-sm font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-bold text-sm bg-surface rounded">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-surface-container rounded border border-outline-variant text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !isSending && setShowComposeModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-outline-variant overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-2xl font-bold">Compose Campaign ({selectedContacts.length} recipients)</h3>
                <button onClick={() => !isSending && setShowComposeModal(false)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={submitBulkEmails} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="font-label-md text-sm font-medium text-on-surface">Subject</label>
                    <button 
                      type="button" 
                      onClick={() => setShowVarInfo(!showVarInfo)} 
                      className="text-primary hover:bg-primary/10 p-1 rounded-full flex items-center justify-center"
                      title="View available variables"
                    >
                      <span className="material-symbols-outlined text-sm">info</span>
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showVarInfo && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-surface-container p-3 rounded-lg border border-outline-variant text-xs text-on-surface overflow-hidden"
                      >
                        <p className="mb-2 font-sans text-on-surface-variant font-medium">Use any of the JSON keys below as variables by wrapping them in {"{}"} braces. For example: <code className="bg-white px-1 rounded text-primary">{"{name}"}</code> or <code className="bg-white px-1 rounded text-primary">{"{services}"}</code></p>
                        <pre className="whitespace-pre-wrap font-mono text-[10px] bg-white p-2 rounded border border-outline-variant">
{`{
  "url": "https://www...",
  "name": "K.T. from Metastori...",
  "rating": "5.0",
  "reviews": "124",
  "location": "Sheridan, United States",
  "pricing": "$30-$7999",
  "services": "Store build or redesign...",
  "website": "https://...",
  "phone": "N/A",
  "email": "kshitij.message@gmail.com",
  "primary_location": "Sheridan, United States",
  "supported_locations": "United States...",
  "languages": "English"
}`}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-white text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                    required
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Use <code className="bg-surface-container px-1 rounded text-primary">{"{name}"}</code>, <code className="bg-surface-container px-1 rounded text-primary">{"{location}"}</code>, <code className="bg-surface-container px-1 rounded text-primary">{"{website}"}</code>, etc. to personalize.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-md text-sm font-medium text-on-surface">Message Body</label>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full h-48 p-4 rounded-lg border border-outline-variant bg-white text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-y"
                    required
                  />
                  <p className="text-xs text-on-surface-variant mt-1">You can use any column data as a variable, like <code className="bg-surface-container px-1 rounded text-primary">{"{name}"}</code> or <code className="bg-surface-container px-1 rounded text-primary">{"{services}"}</code>.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-sm font-medium text-on-surface">Attachment (Optional)</label>
                  <input 
                    type="file" 
                    onChange={e => setAttachment(e.target.files?.[0] || null)}
                    className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
                  <button type="button" onClick={() => setShowComposeModal(false)} disabled={isSending} className="h-11 px-6 bg-surface-container rounded-lg font-label-md font-semibold disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSending} className="h-11 px-6 bg-primary text-white rounded-lg font-label-md font-semibold flex items-center gap-2 hover:bg-primary-container disabled:opacity-50">
                    {isSending ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Starting Process...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Send in Background
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Contact Modal */}
      <AnimatePresence>
        {viewContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewContact(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-outline-variant overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-start">
                <div>
                  <h3 className="font-display-lg text-2xl font-bold text-on-surface">{viewContact.name}</h3>
                  <div className="flex gap-2 mt-2">
                    {viewContact.isDoNotSend && <span className="px-2 py-1 bg-error/10 text-error text-xs font-bold rounded-full">Do Not Send</span>}
                    {viewContact.sentCount > 0 && <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Sent {viewContact.sentCount} time(s)</span>}
                  </div>
                </div>
                <button onClick={() => setViewContact(null)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-surface-container-low p-3 rounded border border-outline-variant break-all">
                  <label className="text-xs font-bold text-outline uppercase tracking-wide">Email</label>
                  <p className="font-body-md text-on-surface">{viewContact.email}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded border border-outline-variant">
                  <label className="text-xs font-bold text-outline uppercase tracking-wide">Location</label>
                  <p className="font-body-md text-on-surface">{viewContact.primary_location}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded border border-outline-variant">
                  <label className="text-xs font-bold text-outline uppercase tracking-wide">Website</label>
                  <p className="font-body-md text-primary truncate">
                    {viewContact.website !== 'N/A' ? <a href={viewContact.website} target="_blank" rel="noreferrer" className="hover:underline">{viewContact.website}</a> : 'N/A'}
                  </p>
                </div>
                <div className="bg-surface-container-low p-3 rounded border border-outline-variant">
                  <label className="text-xs font-bold text-outline uppercase tracking-wide">Source URL</label>
                  <p className="font-body-sm text-on-surface-variant truncate">
                    <a href={viewContact.url} target="_blank" rel="noreferrer" className="hover:underline">{viewContact.url}</a>
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                   {!viewContact.isDoNotSend ? (
                     <button onClick={() => markAsDoNotSend(viewContact.email)} className="h-10 px-4 flex items-center gap-2 bg-error/10 text-error font-semibold rounded hover:bg-error/20">
                       <span className="material-symbols-outlined text-sm">block</span> Mark as Do Not Send
                     </button>
                   ) : (
                     <button onClick={() => removeFromDoNotSend(viewContact.email)} className="h-10 px-4 flex items-center gap-2 bg-primary/10 text-primary font-semibold rounded hover:bg-primary/20">
                       <span className="material-symbols-outlined text-sm">settings_backup_restore</span> Remove from Do Not Send
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
