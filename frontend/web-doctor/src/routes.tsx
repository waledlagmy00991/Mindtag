import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveSession from './pages/LiveSession';
import Announcements from './pages/Announcements';
import AdminStats from './pages/AdminStats';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AttendanceArchive from './pages/AttendanceArchive';
import CourseArchiveDetails from './pages/CourseArchiveDetails';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="session/:sessionId" element={<LiveSession />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stats" element={<AdminStats />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="archive" element={<AttendanceArchive />} />
        <Route path="archive/:id" element={<CourseArchiveDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
