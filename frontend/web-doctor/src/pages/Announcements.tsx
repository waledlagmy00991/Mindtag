import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Send, Bell } from 'lucide-react';

export default function Announcements() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    apiClient.get('/courses?limit=100').then(({ data }) => setCourses(data.data?.items || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Select a course");
    setLoading(true);
    
    try {
      await apiClient.post('/announcements', {
        courseId: selectedCourse,
        title,
        body
      });
      alert('Announcement sent to all enrolled students via push notifications!');
      setTitle('');
      setBody('');
    } catch(err: any) {
      alert('Failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
          <Bell className="w-6 h-6 text-accent" />
          Platform Announcements
        </h2>
        <p className="text-textLight mt-1">Send immediate Push Notifications to all students enrolled in your course.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-textMain mb-1">Target Course</label>
          <select 
            required
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:ring-accent sm:text-sm"
          >
            <option value="" disabled>Select a course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-textMain mb-1">Message Title</label>
          <input 
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:ring-accent sm:text-sm"
            placeholder="e.g. Midterm Grades Posted"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textMain mb-1">Message Body</label>
          <textarea 
            required
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:ring-accent sm:text-sm"
            placeholder="Write your announcement here..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? 'Dispatching...' : <><Send className="w-4 h-4" /> Send Notification</>}
          </button>
        </div>
      </form>
    </div>
  );
}
