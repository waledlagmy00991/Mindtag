import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Download, Search, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ArchiveStudent {
  id: string;
  academicId: string;
  fullName: string;
}

interface ArchiveSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
}

interface ArchiveRecord {
  studentId: string;
  sessionId: string;
  status: string; // 'Present', 'Absent', 'Late'
}

interface CourseArchive {
  courseId: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  students: ArchiveStudent[];
  sessions: ArchiveSession[];
  records: ArchiveRecord[];
}

export default function CourseArchiveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  const [archive, setArchive] = useState<CourseArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, ATTENDED_ONLY, ABSENT_ONLY
  const [toggling, setToggling] = useState<{ studentId: string; sessionId: string } | null>(null);

  useEffect(() => {
    fetchArchive();
  }, [id]);

  const fetchArchive = async () => {
    try {
      const { data } = await apiClient.get(`/courses/${id}/attendance-archive`);
      setArchive(data.data);
    } catch (err) {
      setError('Failed to load course archive.');
    } finally {
      setLoading(false);
    }
  };

  const getRecord = (studentId: string, sessionId: string) => {
    return archive?.records.find(r => r.studentId === studentId && r.sessionId === sessionId);
  };

  const isAttended = (status?: string) => status === 'Present' || status === 'Late';

  const handleToggle = async (studentId: string, sessionId: string) => {
    if (!isAdmin || !archive) return;

    const record = getRecord(studentId, sessionId);
    const existingStatus = record?.status;
    const isCurrentlyAttended = isAttended(existingStatus);
    const newStatus = isCurrentlyAttended ? 'Absent' : 'Present';

    setToggling({ studentId, sessionId });
    try {
      await apiClient.post('/attendance/toggle', {
        studentId,
        sessionId,
        status: newStatus
      });

      // Update local state optimizing render
      const updatedRecords = [...archive.records];
      const recordIndex = updatedRecords.findIndex(r => r.studentId === studentId && r.sessionId === sessionId);
      
      if (recordIndex >= 0) {
        updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], status: newStatus };
      } else {
        updatedRecords.push({ studentId, sessionId, status: newStatus });
      }

      setArchive({ ...archive, records: updatedRecords });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to toggle status');
    } finally {
      setToggling(null);
    }
  };

  const exportToExcel = async () => {
    if (!archive) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Archive', {
      views: [{ state: 'frozen', ySplit: 1 }] // Freeze header row
    });

    // Prepare Columns Structure
    const columns: any[] = [
      { header: '#', key: 'index', width: 5 },
      { header: 'Academic ID', key: 'academicId', width: 15 },
      { header: 'Student Name', key: 'name', width: 30 }
    ];

    archive.sessions.forEach((s, idx) => {
      // Name of the day and date
      const d = new Date(s.startedAt);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US');
      
      columns.push({ 
        header: `Session ${idx + 1}\n(${dayName}, ${dateStr})`, 
        key: `session_${s.id}`, 
        width: 15 
      });
    });

    columns.push({ header: 'Total Attendance %', key: 'total', width: 22 });
    sheet.columns = columns;

    // Add Rows
    archive.students.forEach((student, index) => {
      const rowData: any = {
        index: index + 1,
        academicId: student.academicId,
        name: student.fullName
      };

      let attendedCount = 0;
      archive.sessions.forEach(session => {
        const record = getRecord(student.id, session.id);
        if (isAttended(record?.status)) {
          rowData[`session_${session.id}`] = '✔';
          attendedCount++;
        } else {
          rowData[`session_${session.id}`] = '✘';
        }
      });

      rowData.total = archive.sessions.length > 0 
        ? ((attendedCount / archive.sessions.length) * 100).toFixed(1) + '%' 
        : '0.0%';

      sheet.addRow(rowData);
    });

    // Formatting & Styling
    sheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      row.eachCell((cell: ExcelJS.Cell) => {
        // Center all cells
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
      
      // Header styles
      if (rowNumber === 1) {
        row.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        row.height = 35; // taller for wrapped text
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' } // Indigo color header
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      } else {
        // Body borders
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      }
    });

    // Intelligent Auto-fitting for widths
    sheet.columns.forEach((col: Partial<ExcelJS.Column>) => {
      let maxLength = 0;
      col.eachCell!({ includeEmpty: true }, (cell: ExcelJS.Cell, rowNum: number) => {
        let valLength = cell.value ? cell.value.toString().length : 0;
        // Header text is wrapped, so we approximate its visual width instead of raw length
        if (rowNum === 1) {
          valLength = valLength / 2; 
        }
        if (valLength > maxLength) {
          maxLength = valLength;
        }
      });
      // Safety bounds for column width
      col.width = Math.max(12, Math.min(maxLength + 4, 35));
    });

    // Generate buffer & Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${archive.courseCode}_Attendance_Archive.xlsx`);
  };

  if (loading) return <div className="p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !archive) return <div className="p-8 text-danger">{error || 'Archive not found.'}</div>;

  // Filtering
  let filteredStudents = archive.students;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredStudents = filteredStudents.filter(s => s.fullName.toLowerCase().includes(q) || s.academicId.toLowerCase().includes(q));
  }

  // Filter Mode logic (looks at overall attendance or just filters out fully absent etc. Since standard request asked to filter attended/absent, we'll apply it contextually to people who attended ALL or absent ALL, or simply just search)
  // To keep it simple, we'll just filter if they have > 0 absences etc, or disable filter if it's too ambiguous for a matrix.
  // We'll filter based on their *most recent* session. 
  if (filterMode !== 'ALL' && archive.sessions.length > 0) {
    const lastSessionId = archive.sessions[archive.sessions.length - 1].id;
    filteredStudents = filteredStudents.filter(s => {
      const rec = getRecord(s.id, lastSessionId);
      const attended = isAttended(rec?.status);
      return filterMode === 'ATTENDED_ONLY' ? attended : !attended;
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textLight hover:text-textMain transition-colors mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{archive.courseCode}</span>
            <h1 className="text-2xl font-bold text-gray-900">{archive.courseName}</h1>
          </div>
          <div className="text-sm text-textLight flex items-center gap-4">
            <span>Enrolled Students: <strong className="text-gray-800">{archive.students.length}</strong></span>
            <span>Total Sessions: <strong className="text-gray-800">{archive.sessions.length}</strong></span>
            <span>Instructor: <strong className="text-gray-800">{archive.doctorName}</strong></span>
          </div>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-medium"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>
          <select 
            value={filterMode} 
            onChange={e => setFilterMode(e.target.value)}
            className="border border-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Students</option>
            <option value="ATTENDED_ONLY">Attended Last Session</option>
            <option value="ABSENT_ONLY">Absent Last Session</option>
          </select>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-textLight uppercase tracking-wider">
                <th className="px-4 py-3 sticky left-0 bg-gray-100 z-10 w-12 text-center">#</th>
                <th className="px-4 py-3 sticky left-[48px] bg-gray-100 z-10 w-32 border-r border-gray-300">Academic ID</th>
                <th className="px-4 py-3 sticky left-[176px] bg-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] border-r border-gray-300">Student Name</th>
                {archive.sessions.map((session, idx) => (
                  <th key={session.id} className="px-3 py-3 text-center border-r border-gray-200 min-w-[100px]">
                    <div className="flex flex-col items-center">
                      <span>S{idx + 1}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{new Date(session.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={archive.sessions.length + 3} className="px-6 py-8 text-center text-textLight">No students match your filter.</td>
                </tr>
              ) : (
                filteredStudents.map((student, sIdx) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 text-center text-gray-500 text-sm">{sIdx + 1}</td>
                    <td className="px-4 py-3 sticky left-[48px] bg-white z-10 text-sm font-medium border-r border-gray-100 text-gray-700">{student.academicId}</td>
                    <td className="px-4 py-3 sticky left-[176px] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-sm font-bold text-textMain border-r border-gray-100">{student.fullName}</td>
                    
                    {archive.sessions.map(session => {
                      const record = getRecord(student.id, session.id);
                      const attended = isAttended(record?.status);
                      const isToggling = toggling?.studentId === student.id && toggling?.sessionId === session.id;

                      return (
                        <td key={session.id} className="px-3 py-2 text-center border-r border-gray-100 relative group">
                          <button
                            onClick={() => handleToggle(student.id, session.id)}
                            disabled={!isAdmin || isToggling}
                            className={`inline-flex items-center justify-center p-1.5 rounded-full transition-all ${
                              isAdmin ? 'cursor-pointer hover:bg-gray-200 hover:ring-2 hover:ring-gray-300' : 'cursor-default'
                            } ${isToggling ? 'opacity-50' : ''}`}
                            title={isAdmin ? `Toggle Attendance (${attended ? 'Present' : 'Absent'})` : (attended ? 'Present' : 'Absent')}
                          >
                            {attended ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <XCircle className="w-5 h-5 text-danger" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
