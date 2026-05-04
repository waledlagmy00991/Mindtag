import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Users, XCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import useAuthStore from '../store/authStore';

export default function LiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const token = useAuthStore(s => s.accessToken);
  
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let connection: any = null;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch initial QR from REST
        try {
          const { data } = await apiClient.get(`/sessions/${sessionId}/qr`);
          const tokenStr = typeof data === 'string' ? data : JSON.stringify(data);
          setQrToken(tokenStr);
        } catch (qrErr: any) {
          console.warn('Initial QR fetch failed (cache expired?), waiting for SignalR rotation...');
        }
        setLoading(false);

        // 2. Connect to SignalR
        connection = new HubConnectionBuilder()
          .withUrl(`/hubs/session?access_token=${token}`)
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect()
          .build();

        connection.on('QrRotated', (payload: any) => {
          console.log('QR Rotated! Payload:', payload);
          const tokenStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
          setQrToken(tokenStr);
        });

        connection.on('AttendanceUpdate', (data: any) => {
          console.log('New check-in: ', data);
          if (!data || !data.id) {
            console.warn('AttendanceUpdate received with no data, skipping.');
            return;
          }
          setAttendance(prev => {
            if (prev.some(a => a.id === data.id)) return prev;
            return [data, ...prev];
          });
        });

        connection.on('SessionEnded', () => {
          alert("This session has been ended externally.");
          navigate('/app/dashboard');
        });

        await connection.start();
        console.log('SignalR connected. Joining session group...');
        await connection.invoke('JoinSession', sessionId);

      } catch (err: any) {
        console.error("Initialization error:", err);
        setError("Session is invalid or has expired. Please go back to Dashboard.");
        setLoading(false);
      }
    };

    if (sessionId && token) {
      init();
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [sessionId, token, navigate]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await apiClient.patch(`/sessions/${sessionId}/end`);
      navigate('/app/dashboard');
    } catch (e: any) {
      alert("Failed to end: " + e.message);
      setEnding(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-textLight font-medium">Connecting to session...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full bg-background p-8 text-center">
      <div className="w-16 h-16 bg-red-50 text-danger rounded-full flex items-center justify-center mb-4">
        <XCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-textMain mb-2">Session Error</h2>
      <p className="text-textLight max-w-md mb-8">{error}</p>
      <button 
        onClick={() => navigate('/app/dashboard')}
        className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition"
      >
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="flex h-full animate-in fade-in duration-500">
      {/* Left side: Projector QR View */}
      <div className="flex-[2] bg-white flex flex-col items-center justify-center border-r border-gray-200">
        <h1 className="text-3xl font-bold text-textMain mb-2">Scan to Check-in</h1>
        <p className="text-textLight mb-8">Make sure your GPS and Internet are active</p>
        
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          {qrToken ? (
            <QRCodeSVG 
              value={qrToken} 
              size={400} 
              level="H"
              includeMargin={true}
            />
          ) : (
             <div className="flex items-center justify-center w-[400px] h-[400px]">
               <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
             </div>
          )}
        </div>

        <div className="mt-8 px-6 py-3 bg-blue-50 text-blue-800 rounded-full font-medium inline-flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          QR rotates automatically every 5 seconds
        </div>
      </div>

      {/* Right side: Live Roster */}
      <div className="flex-1 bg-background flex flex-col">
        <div className="p-6 bg-surface border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Live Attendance
            </h2>
            <p className="text-sm text-textLight">{attendance.length} students checked in</p>
          </div>
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            End Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {attendance.length === 0 ? (
            <div className="text-center text-textLight py-12">Waiting for first check-in...</div>
          ) : (
            attendance.map((record, i) => (
              <div key={record.id || i} className="bg-surface p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div>
                  <h4 className="font-bold text-textMain">{record.studentName || 'Student'}</h4>
                  <p className="text-xs text-textLight">Distance: {record.distance ? Math.round(record.distance) : '??'}m</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  {record.status || 'Present'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
