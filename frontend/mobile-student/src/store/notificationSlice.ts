import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: 'LectureReminder' | 'DailySchedule' | 'Announcement' | 'AttendanceUpdate';
  title: string;
  body: string;
  data?: string; // JSON string: { sessionId, courseId, etc. }
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,
  loading: false,
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<{
      notifications: NotificationItem[];
      page: number;
      hasMore: boolean;
    }>) => {
      if (action.payload.page === 1) {
        state.notifications = action.payload.notifications;
      } else {
        state.notifications = [...state.notifications, ...action.payload.notifications];
      }
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
    },

    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Prepend new notification at the top (real-time from SignalR)
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    clearNotifications: () => initialState,
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  setUnreadCount,
  removeNotification,
  setLoading,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
