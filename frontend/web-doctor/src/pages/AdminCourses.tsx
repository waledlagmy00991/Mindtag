import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { apiClient } from '../api/client';

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
  doctor?: { id: string; fullName: string; title?: string };
  schedules?: ScheduleSlot[];
}

interface Doctor {
  id: string;
  fullName: string;
  title?: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', name: '', creditHours: 3, description: '', doctorId: '', schedules: [] as ScheduleSlot[] 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [search]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '100');
      
      const { data } = await apiClient.get(`/courses?${params.toString()}`);
      setCourses(data.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await apiClient.get('/admin/users?role=Doctor&limit=100');
      setDoctors(data.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiClient.delete(`/courses/${id}`);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete course');
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', creditHours: 3, description: '', doctorId: '', schedules: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({ 
      code: course.code, 
      name: course.name, 
      creditHours: course.creditHours || 3, 
      description: course.description || '',
      doctorId: course.doctor?.id || '',
      schedules: course.schedules?.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime.substring(0, 5),
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
      const payload: any = {
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
        // Edit course
        await apiClient.patch(`/courses/${editingCourse.id}`, payload);
      } else {
        // Add course
        payload.code = formData.code;
        payload.doctorId = formData.doctorId; // Admin must pass this
        if (!payload.doctorId) {
          alert('Please select an assigned doctor.');
          return;
        }
        await apiClient.post('/courses', payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain mb-1">Manage Courses</h1>
          <p className="text-textLight">Add, edit, assign, or delete platform subjects and courses.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-textLight uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Course Name</th>
                <th className="px-6 py-4">Credit Hours</th>
                <th className="px-6 py-4">Assigned Doctor</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textLight">Loading courses...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textLight">No courses found.</td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-textMain">{course.name}</div>
                      {course.description && <div className="text-sm text-textLight truncate max-w-xs">{course.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-textMain flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {course.creditHours}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-textMain font-medium">{course.doctor?.title} {course.doctor?.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(course)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                          title="Edit Course"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-gray-400 hover:text-danger transition-colors hover:bg-danger/10 rounded-lg"
                          title="Delete Course"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              {!editingCourse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Doctor</label>
                  <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="" disabled>Select a Doctor</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.title} {d.fullName}</option>
                    ))}
                  </select>
                </div>
              )}
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
