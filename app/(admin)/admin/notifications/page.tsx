"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification, // ✅ Import type from service
} from "@/services/notificationService";

export const dynamic = "force-dynamic";

// Priority color mapping with fallback
const priorityColors: Record<string, string> = {
  HIGH: "bg-[#FFDAD6] text-[#93000A]",
  MEDIUM: "bg-[#FEF3C7] text-[#92400E]",
  LOW: "bg-[#F0FDFA] text-[#0F766E]",
};

// Type badge colors (for business type display)
const typeColors: Record<string, string> = {
  APPOINTMENT_BOOKED: "bg-[#E5EEFF] text-[#435B7E]",
  APPOINTMENT_CANCELLED: "bg-[#FFDAD6] text-[#93000A]",
  APPOINTMENT_COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  LAB_RESULT: "bg-[#E5EEFF] text-[#435B7E]",
  PAYMENT_RECEIVED: "bg-[#DCFCE7] text-[#166534]",
  SYSTEM_ALERT: "bg-[#FFDAD6] text-[#93000A]",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [markingAll, setMarkingAll] = useState(false);
  const size = 10; // Constant for now, can be made dynamic later

  // Load notifications based on filter
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (filter === "ALL") {
        result = await getNotifications(page, size);
      } else {
        result = await getUnreadNotifications(page, size);
      }
      
      if (result.success && result.data) {
        setNotifications(result.data.content);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
      } else {
        setError(result.message || "Failed to load notifications.");
      }
    } catch (err: any) {
      console.error("Error loading notifications:", err);
      // ✅ Safer error message extraction
      const errorMessage = err?.response?.data?.message || "Failed to load notifications.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, filter]); // ✅ size is constant, not needed in deps

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await getUnreadCount();
      if (result.success) {
        // ✅ Verify backend returns nested object: { data: { unreadCount: number } }
        setUnreadCount(result.data.unreadCount);
      }
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // ✅ Handle mark as read with proper UI update based on filter
  const handleMarkAsRead = async (id: string) => {
    try {
      const result = await markNotificationAsRead(id);
      
      if (result.success) {
        // ✅ Fix #3: Remove from list if in UNREAD filter, otherwise mark as read
        setNotifications((prev) =>
          filter === "UNREAD"
            ? prev.filter((n) => n.id !== id)
            : prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // ✅ Handle mark all as read with proper UI update based on filter
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const result = await markAllNotificationsAsRead();
      
      if (result.success) {
        // ✅ Fix #4: Clear list if in UNREAD filter, otherwise mark all as read
        if (filter === "UNREAD") {
          setNotifications([]);
        } else {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
          );
        }
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // Format type for display
  const formatType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Filter handlers with page reset
  const handleFilterAll = () => {
    setFilter("ALL");
    setPage(0);
  };

  const handleFilterUnread = () => {
    setFilter("UNREAD");
    setPage(0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">
        
        {/* Header with filters and actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleFilterAll}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === "ALL"
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              All Notifications
              {filter === "ALL" && unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {unreadCount} unread
                </span>
              )}
            </button>
            <button
              onClick={handleFilterUnread}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === "UNREAD"
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              Unread
              {filter === "UNREAD" && unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="text-sm text-[#0D9488] hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0] mt-1.5" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/4 mb-2" />
                    <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm text-[#94A3B8]">No notifications found.</p>
            {filter === "UNREAD" && unreadCount === 0 && (
              <p className="text-xs text-[#94A3B8] mt-1">You're all caught up!</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`bg-white border rounded-xl p-5 flex items-start gap-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                    notif.isRead 
                      ? "border-[#F1F5F9] opacity-70" 
                      : "border-[#BDC9C5]/50 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {/* Read indicator dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.isRead ? "bg-[#E2E8F0]" : "bg-[#0D9488] animate-pulse"
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        {/* Patient name and type */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className={`text-sm font-semibold ${notif.isRead ? "text-[#3D4946]" : "text-[#0B1C30]"}`}>
                            {notif.patientName}
                          </p>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${typeColors[notif.type] || "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {formatType(notif.type)}
                          </span>
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm text-[#485F83] mt-1">{notif.message}</p>
                        
                        {/* Patient email (optional) */}
                        {notif.patientEmail && (
                          <p className="text-xs text-[#94A3B8] mt-1">{notif.patientEmail}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Priority badge with fallback */}
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          priorityColors[notif.priority] || "bg-[#F1F5F9] text-[#64748B]"
                        }`}>
                          {notif.priority}
                        </span>
                        
                        {/* Time */}
                        <span className="text-xs text-[#94A3B8] whitespace-nowrap">
                          {formatDate(notif.createdAt)}
                        </span>
                        
                        {/* Mark as read action for unread */}
                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            className="text-xs text-[#0D9488] hover:underline mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F1F5F9]">
                <button
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm text-[#3D4946]">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Accurate record count */}
            <p className="text-sm text-[#3D4946]">
              Showing {notifications.length} of {totalElements} notifications
              {filter === "ALL" && unreadCount > 0 && (
                <span className="text-xs text-[#0D9488] ml-2">
                  ({unreadCount} unread)
                </span>
              )}
            </p>
          </>
        )}
      </main>
    </div>
  );
}