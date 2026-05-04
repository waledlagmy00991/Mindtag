import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { PlayCircle, Clock, AlertCircle, Plus, Edit2 } from 'lucide-react';

interface ScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  schedules?: ScheduleSlot[];
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', name: '', creditHours: 3, description: '', schedules: [] as ScheduleSlot[] 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/courses?limit=100');
      setCourses(data.data?.items || []);
    } catch (err) {
      setError('Failed to load your courses.');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (courseId: string) => {
    setStartingSessionId(courseId);
    
    // Helper to call API
    const callStartSession = async (lat: number, lng: number) => {
      try {
        const { data: responseBody } = await apiClient.post('/sessions', {
          courseId,
          locationLat: lat,
          locationLng: lng
        });
        const payload = JSON.parse(responseBody.data);
        navigate(`/app/session/${payload.sessionId}`);
      } catch (err: any) {
        alert(err.response?.data?.error?.message || 'Failed to start session. Maybe one is already active?');
      } finally {
        setStartingSessionId(null);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Starting session with real location:", position.coords.latitude, position.coords.longitude);
          callStartSession(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Location access denied or failed. Falling back to default center.", error);
          alert("GPS Access Denied. Starting session with default location (Cairo Center). Attendance might fail for distant students.");
          callStartSession(30.0444, 31.2357);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      console.warn("Geolocation not supported. Falling back to default.");
      callStartSession(30.0444, 31.2357);
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', creditHours: 3, description: '', schedules: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({ 
      code: course.code, 
      name: course.name, 
      creditHours: course.creditHours || 3, 
      description: course.description || '',
      schedules: course.schedules?.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime.substring(0, 5), // '10:30:00' -> '10:30'
        endTime: s.endTime.substring(0, 5),
        room: s.room
      })) || []
    });
    setIsModalOpen(true);
  };

  const addSchedule = () => setFormData(p => ({...p, schedules: [...p.schedules, { dayOfWeek: 0, startTime: '10:00', endTime: '12:00', room: '' }] }));
  const removeSchedule = (idx: number) => setFormData(p => ({...p, schedules: p.schedules.filter((_, i) => i !== idx)}));
  const updateSchedule = (idx: number, field: string, value: any) => setFormData(p => {
    const s = [...p.schedules];
    (s[idx] as any)[field] = value;
    return {...p, schedules: s};
  });

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = {
        name: formData.name,
        creditHours: formData.creditHours,
        description: formData.description,
        schedules: formData.schedules.map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime,
          endTime: s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime,
          room: s.room || null
        }))
      };

      if (editingCourse) {
        await apiClient.patch(`/courses/${editingCourse.id}`, payload);
      } else {
        await apiClient.post('/courses', { ...payload, code: formData.code });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-textLight flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading courses...</div>;
  if (error) return <div className="p-8 text-danger">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-textMain">My Courses</h2>
          <p className="text-textLight mt-1">Select a course to manage or start a new lecture session.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                    {course.code}
                  </span>
                  <h3 className="text-lg font-bold text-textMain leading-tight">{course.name}</h3>
                </div>
                <button 
                  onClick={() => handleOpenEdit(course)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-textLight">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.creditHours} Credits
                </div>
              </div>
            </div>
            <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-between items-center gap-4">
              <button
                onClick={() => startSession(course.id)}
                disabled={startingSessionId === course.id}
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-success hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:opacity-70 transition-colors"
              >
                {startingSessionId === course.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                Start Live Session
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-xl border-2 border-dashed border-gray-300">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-bold text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">You are not assigned to any active courses.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              {!editingCourse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input required type="text" placeholder="e.g. CS101" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input required type="text" placeholder="e.g. Introduction to CS" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours</label>
                <input required type="number" min="1" max="10" value={formData.creditHours} onChange={e => setFormData({...formData, creditHours: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              
              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Lecture Schedules</label>
                  <button type="button" onClick={addSchedule} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4"/> Add Slot
                  </button>
                </div>
                {formData.schedules.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 mb-3 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <select value={slot.dayOfWeek} onChange={e => updateSchedule(idx, 'dayOfWeek', parseInt(e.target.value))} className="border border-gray-300 p-1.5 rounded-md text-sm flex-1 outline-none focus:ring-1 focus:ring-primary">
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                    <input type="time" value={slot.startTime} onChange={e => updateSchedule(idx, 'startTime', e.target.value)} required className="border border-gray-300 p-1.5 rounded-md text-sm w-24 outline-none focus:ring-1 focus:ring-primary" />
                    <span className="text-gray-400 font-medium">-</span>
                    <input type="time" value={slot.endTime} onChange={e => updateSchedule(idx, 'endTime', e.target.value)} required className="border border-gray-300 p-1.5 rounded-md text-sm w-24 outline-none focus:ring-1 focus:ring-primary" />
                    <input type="text" placeholder="Room/Hall" value={slot.room || ''} onChange={e => updateSchedule(idx, 'room', e.target.value)} className="border border-gray-300 p-1.5 rounded-md text-sm w-24 outline-none focus:ring-1 focus:ring-primary" />
                    <button type="button" onClick={() => removeSchedule(idx)} className="text-danger hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Remove slot">✕</button>
                  </div>
                ))}
                {formData.schedules.length === 0 && <div className="text-sm text-gray-500 italic">No schedules added. Students won't see lecture times.</div>}
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
