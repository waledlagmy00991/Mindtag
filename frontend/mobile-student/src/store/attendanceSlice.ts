import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CourseSummary {
  courseId: string;
  courseName: string;
  courseCode: string;
  totalSessions: number;
  attended: number;
  missed: number;
  percentage: number;
  status: 'Safe' | 'Warning' | 'Danger';
  absenceLimit: number;
  absenceUsed: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  courseId: string;
  courseName: string;
  status: 'Present' | 'Late' | 'Absent';
  scannedAt: string;
  distance: number;
}

interface AttendanceState {
  summary: CourseSummary[];
  overallPercentage: number;
  totalPresent: number;
  totalAbsent: number;
  history: AttendanceRecord[];
  historyPage: number;
  hasMoreHistory: boolean;
  loading: boolean;
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: AttendanceState = {
  summary: [],
  overallPercentage: 0,
  totalPresent: 0,
  totalAbsent: 0,
  history: [],
  historyPage: 1,
  hasMoreHistory: true,
  loading: false,
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<{
      summary: CourseSummary[];
      overallPercentage: number;
      totalPresent: number;
      totalAbsent: number;
    }>) => {
      state.summary = action.payload.summary;
      state.overallPercentage = action.payload.overallPercentage;
      state.totalPresent = action.payload.totalPresent;
      state.totalAbsent = action.payload.totalAbsent;
    },

    setHistory: (state, action: PayloadAction<{
      records: AttendanceRecord[];
      page: number;
      hasMore: boolean;
    }>) => {
      if (action.payload.page === 1) {
        state.history = action.payload.records;
      } else {
        state.history = [...state.history, ...action.payload.records];
      }
      state.historyPage = action.payload.page;
      state.hasMoreHistory = action.payload.hasMore;
    },

    addRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.history = [action.payload, ...state.history];
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    clearAttendance: () => initialState,
  },
});

export const {
  setSummary,
  setHistory,
  addRecord,
  setLoading,
  clearAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
