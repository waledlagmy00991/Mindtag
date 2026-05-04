import { useState, useEffect } from 'react';
import { Search, UserPlus, Power } from 'lucide-react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  department?: string;
  studentId?: string;
  title?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'Student',
    studentId: '',
    department: '',
    year: '',
    title: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      
      const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(data.data.items);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/users/${id}/status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: any = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role
      };
      
      if (formData.role === 'Student') {
        payload.studentId = formData.studentId;
        payload.department = formData.department;
        payload.year = parseInt(formData.year) || 1;
      } else if (formData.role === 'Doctor') {
        payload.department = formData.department;
        payload.title = formData.title;
      }
      
      await apiClient.post('/admin/users', payload);
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
      setFormData({ email: '', password: '', fullName: '', role: 'Student', studentId: '', department: '', year: '', title: '' });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain mb-1">User Management</h1>
          <p className="text-textLight">Manage students, doctors, and system administrators.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Roles</option>
            <option value="Student">Students</option>
            <option value="Doctor">Doctors</option>
            <option value="Admin">Admins</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-textLight uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textLight">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textLight">No users found matching your criteria.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-textMain">{user.fullName}</div>
                          <div className="text-sm text-textLight">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'Admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'Doctor' ? 'bg-emerald-100 text-emerald-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-textMain">{user.department || '-'}</div>
                      <div className="text-xs text-textLight">
                        {user.role === 'Student' ? `ID: ${user.studentId}` : user.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(user.id, user.isActive)}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          <Power className="w-5 h-5" />
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

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input required minLength={8} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="Student">Student</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              {formData.role === 'Student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input required type="text" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input required type="number" min="1" max="7" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </>
              )}
              
              {formData.role === 'Doctor' && (
                <>
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input required type="text" placeholder="Dr." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-70">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
