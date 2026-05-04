import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Clock, AlertCircle, FileText } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  doctor?: { fullName: string; title?: string };
}

export default function AttendanceArchive() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await apiClient.get('/courses?limit=100');
      setCourses(data.data?.items || []);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-textLight flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading courses...</div>;
  if (error) return <div className="p-8 text-danger">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-textMain">Attendance Archive</h2>
        <p className="text-textLight mt-1">Select a course to view its complete attendance history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                    {course.code}
                  </span>
                  <h3 className="text-lg font-bold text-textMain leading-tight">{course.name}</h3>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-textLight">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.creditHours} Credits
                </div>
                {course.doctor && (
                  <div className="flex items-center gap-1.5 ml-auto text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                    {course.doctor.title} {course.doctor.fullName}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => navigate(`/app/archive/${course.id}`)}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Archive
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-xl border-2 border-dashed border-gray-300">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-bold text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">You do not have access to any explicit courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
