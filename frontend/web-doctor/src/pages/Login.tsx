import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: responseBody } = await apiClient.post('/auth/login', {
        email,
        password,
        deviceId: 'web-dashboard',
        deviceFingerprint: navigator.userAgent,
        platform: 'Web'
      });

      const resultData = responseBody.data;

      if (resultData.user.role !== 'Doctor' && resultData.user.role !== 'Admin') {
        throw new Error('Only Doctors and Admins can access the web dashboard.');
      }

      setAuth(resultData.user, resultData.accessToken, resultData.refreshToken);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-surface p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-textMain">
            Mindtag<span className="text-accent">.</span>
          </h2>
          <p className="mt-2 text-center text-sm text-textLight">
            Sign in to the Doctor Dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 text-sm text-danger bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-textMain">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                placeholder="doctor@university.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
