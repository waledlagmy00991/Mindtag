import { useState, useEffect } from 'react';
import { Users, GraduationCap, Stethoscope, BookOpen, Activity, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalDoctors: number;
  totalCourses: number;
  activeSessions: number;
  attendanceToday: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/stats');
      setStats(data.data);
    } catch (err) {
      setError('Failed to load system statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-textLight">Loading statistics...</div>;
  if (error) return <div className="p-8 text-center text-danger">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Today\'s Attendance', value: stats.attendanceToday, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain mb-1">Platform Overview</h1>
          <p className="text-textLight">Live statistics and platform metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-textLight">{stat.label}</p>
              <p className="text-2xl font-bold text-textMain">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
