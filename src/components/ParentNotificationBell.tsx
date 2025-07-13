// src/components/ParentNotificationBell.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Bell, Check, X } from 'lucide-react';

// Interface for a single notification in the parent view
interface ParentNotification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null; // Tracks if the parent has read this notification
}

// Helper to format dates nicely
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export const ParentNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // --- 1. Fetch Initial Notifications ---
    const fetchInitialData = async () => {
      // Because of RLS, this query automatically gets only the correct notifications for the logged-in user.
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, read_at')
        .order('created_at', { ascending: false })
        .limit(10); // Get the 10 most recent notifications

      if (error) {
        console.error("Error fetching parent notifications:", error);
        return;
      }
      
      setNotifications(data || []);
      // Calculate the initial unread count
      setUnreadCount(data.filter(n => n.read_at === null).length);
    };

    fetchInitialData();

    // --- 2. Set up Real-time Subscription ---
    const channel = supabase
      .channel('parent-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('New notification received!', payload.new);
          // When a new notification arrives, add it to the top of the list
          // and increment the unread count.
          setNotifications(prev => [payload.new as ParentNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // --- 3. Cleanup ---
    // This function runs when the component is unmounted
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    // Optimistically update the UI first for a snappy user experience
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));

    // Then, update the database in the background
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => n.read_at === null).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);

    // Update all in the database
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-gray-200">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 flex justify-between items-center border-b">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-b hover:bg-gray-50 ${!n.read_at ? 'bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read_at && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)} 
                        className="p-1 rounded-full hover:bg-green-100 text-green-500"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};