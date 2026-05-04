import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, LogOut, Bell, Users, Activity, BookOpen, FileText } from 'lucide-react';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-textMain">Mindtag<span className="text-accent">.</span> Dashboard</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {/* Common or Doctor Links */}
            {(user.role === 'Doctor' || user.role === 'Admin') && (
              <>
                <Link to="/app/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('dashboard') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <LayoutDashboard className={`w-5 h-5 ${location.pathname.includes('dashboard') ? 'text-accent' : ''}`} />
                  My Courses
                </Link>
                <Link to="/app/announcements" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('announcements') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <Bell className={`w-5 h-5 ${location.pathname.includes('announcements') ? 'text-accent' : ''}`} />
                  Announcements
                </Link>
                <Link to="/app/archive" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('archive') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <FileText className={`w-5 h-5 ${location.pathname.includes('archive') ? 'text-accent' : ''}`} />
                  Attendance Archive
                </Link>
              </>
            )}

            {/* Admin Only Links */}
            {user.role === 'Admin' && (
              <>
                <div className="pt-4 pb-2 px-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</p>
                </div>
                <Link to="/app/stats" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('stats') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <Activity className={`w-5 h-5 ${location.pathname.includes('stats') ? 'text-accent' : ''}`} />
                  Platform Stats
                </Link>
                <Link to="/app/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('users') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <Users className={`w-5 h-5 ${location.pathname.includes('users') ? 'text-accent' : ''}`} />
                  Manage Users
                </Link>
                <Link to="/app/courses" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${location.pathname.includes('courses') ? 'bg-gray-50 text-primary' : 'text-textLight hover:bg-gray-50'}`}>
                  <BookOpen className={`w-5 h-5 ${location.pathname.includes('courses') ? 'text-accent' : ''}`} />
                  Manage Courses
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textMain truncate">{user.fullName}</p>
              <p className="text-xs text-textLight truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-danger hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
