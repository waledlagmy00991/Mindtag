using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mindtag.Core.DTOs.Attendance;
using Mindtag.Core.DTOs.Session;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Core.Settings;
using Mindtag.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Services;

public sealed class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepo;
    private readonly ISessionRepository _sessionRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IRedisService _redisService;
    private readonly IWebSocketNotifier _notifier;
    private readonly IAuditLogService _audit;
    private readonly QrSecuritySettings _qrSecurity;
    private readonly ILogger<AttendanceService> _logger;
    private readonly AppDbContext _db;

    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public AttendanceService(
        IAttendanceRepository attendanceRepo,
        ISessionRepository sessionRepo,
        IEnrollmentRepository enrollmentRepo,
        IRedisService redisService,
        IWebSocketNotifier notifier,
        IAuditLogService audit,
        IOptions<QrSecuritySettings> qrSecurity,
        ILogger<AttendanceService> logger,
        AppDbContext db)
    {
        _attendanceRepo = attendanceRepo;
        _sessionRepo = sessionRepo;
        _enrollmentRepo = enrollmentRepo;
        _redisService = redisService;
        _notifier = notifier;
        _audit = audit;
        _qrSecurity = qrSecurity.Value;
        _logger = logger;
        _db = db;
    }

    private async Task<object> BuildAttendanceUpdatePayloadAsync(
        Guid studentId,
        Guid recordId,
        AttendanceStatus status,
        DateTime scannedAt,
        double? distance,
        bool isSuspicious)
    {
        var student = await _db.Users.FindAsync(studentId);
        return new
        {
            id = recordId,
            studentName = student?.FullName ?? "Unknown Student",
            status = status.ToString(),
            scannedAt,
            distance = distance is null ? (double?)null : Math.Round(distance.Value, 1),
            isSuspicious
        };
    }

    // ─── M6-T2: THE 7-STEP SCAN PIPELINE ───────────────────────────────────────

    public async Task<AttendanceRecordDTO> ScanAttendanceAsync(Guid studentId, ScanAttendanceRequest request)
    {
        // STEP 1: GPS Provided
        if (Math.Abs(request.StudentLat) < 0.0001 && Math.Abs(request.StudentLng) < 0.0001)
            throw new AppException("GPS_REQUIRED", "GPS coordinates are required to scan attendance.");

        // STEP 2 & 3: Session Exists and is Active
        var session = await _sessionRepo.GetByIdAsync(request.SessionId)
            ?? throw new AppException("SESSION_NOT_FOUND", "Session not found.");

        if (session.Status != SessionStatus.Active)
            throw new AppException("SESSION_NOT_ACTIVE", "Session is no longer active.");

        // Deserialize the QR payload from the string
        QrPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<QrPayload>(request.QrToken, _jsonOptions);
            if (payload is null) throw new Exception();
        }
        catch
        {
            throw new AppException("QR_INVALID", "Invalid QR code format.");
        }

        if (payload.SessionId != request.SessionId)
            throw new AppException("QR_INVALID", "QR code belongs to a different session.");

        // STEP 3b: Cryptographic Signature Validation (PRD §14.1 — use dedicated HMAC secret)
        if (!QrGenerator.VerifySignature(payload, _qrSecurity.HmacSecret))
            throw new AppException("QR_INVALID", "QR code signature verification failed.");

        // STEP 3c: Timestamp bounds (Strict ±2 seconds)
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (now < payload.Iat - 2 || now > payload.Exp + 2)
            throw new AppException("QR_EXPIRED", "This QR code has expired.");

        // STEP 3d: Memory Replay Protection
        var usedKey = $"qr:used:{session.Id}:{payload.Token}";
        var existing = await _redisService.GetAsync(usedKey);
        if (existing is not null)
        {
            throw new AppException("QR_ALREADY_USED", "Replay attack prevented. This specific QR flash has already been used by another device.");
        }
        await _redisService.SetAsync(usedKey, "1", TimeSpan.FromSeconds(10));

        // STEP 3e: Attendance Window check (max 30 mins)
        var minutesSinceStart = (DateTime.UtcNow - session.StartedAt).TotalMinutes;
        if (minutesSinceStart > 30)
            throw new AppException("ATTENDANCE_WINDOW_CLOSED", "Attendance can only be recorded within 30 minutes of session start.");

        // STEP 4: Enrolled Check
        if (!await _enrollmentRepo.ExistsAsync(studentId, session.CourseId))
            throw new AppException("NOT_ENROLLED", "You are not enrolled in this course.");

        // STEP 5: Duplicate Check
        if (await _attendanceRepo.ExistsAsync(session.Id, studentId))
            throw new AppException("ALREADY_CHECKED_IN", "You have already recorded attendance for this session.");

        // STEP 6: Accuracy Guard
        if (request.Accuracy > 50.0)
            throw new AppException("GPS_ACCURACY_LOW", "GPS accuracy is too low. Move to an area with better reception.");

        // STEP 7a: Mock GPS Check
        if (request.IsMockLocation)
            throw new AppException("GPS_MOCK_DETECTED", "Mock GPS locations are strictly prohibited.");

        // STEP 7b: Distance Check (<= 400m from Doctor's starting location)
        var distance = GeoUtils.CalculateDistanceInMeters(session.LocationLat, session.LocationLng, request.StudentLat, request.StudentLng);
        if (distance > 400.0)
            throw new AppException("OUT_OF_RANGE", $"You are {distance:N0}m away from the lecture hall. Maximum allowed distance is 400m.");

        // STEP 7c: Speed Anomaly (Suspicious Log, no throw)
        bool isSuspicious = false;
        var lastRecord = await _attendanceRepo.GetLastRecordTodayAsync(studentId);
        if (lastRecord is not null && lastRecord.SessionId != session.Id)
        {
            var hoursSinceLast = (DateTime.UtcNow - lastRecord.ScannedAt).TotalHours;
            if (hoursSinceLast > 0)
            {
                var distanceSinceLast = GeoUtils.CalculateDistanceInMeters(
                    lastRecord.Session.LocationLat, lastRecord.Session.LocationLng,
                    request.StudentLat, request.StudentLng);
                
                var speedKmh = (distanceSinceLast / 1000.0) / hoursSinceLast;
                if (speedKmh > 120.0) // 120 km/h threshold
                {
                    isSuspicious = true;
                    _logger.LogWarning($"Speed anomaly detected for student {studentId}: {speedKmh:N0} km/h.");
                }
            }
        }

        // Determine Status
        var finalStatus = minutesSinceStart <= 15 ? AttendanceStatus.Present : AttendanceStatus.Late;

        // Create Record
        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            StudentId = studentId,
            Status = finalStatus,
            ScannedAt = DateTime.UtcNow,
            StudentLat = request.StudentLat,
            StudentLng = request.StudentLng,
            Distance = distance,
            IsSuspicious = isSuspicious,
            SuspiciousReason = isSuspicious ? "Speed anomaly flagged." : null
        };

        await _attendanceRepo.CreateAsync(record);
        await _sessionRepo.IncrementPresentCountAsync(session.Id);

        // Audit Log
        await _audit.LogAsync(studentId, AuditAction.AttendanceScan, 
            $"{session.Id}|Dist:{distance:N0}m|Acc:{request.Accuracy:N0}m|{finalStatus}");

        // Broadcast via WebSocket - include attendance data for the live roster
        var attendanceNotification = await BuildAttendanceUpdatePayloadAsync(
            studentId,
            record.Id,
            finalStatus,
            record.ScannedAt,
            record.Distance,
            record.IsSuspicious);
        await _notifier.SendToGroupAsync($"session:{session.Id}", "AttendanceUpdate", attendanceNotification);

        return new AttendanceRecordDTO(
            record.Id, record.Status, record.ScannedAt, record.Distance, 
            session.Course.Name, session.Course.Doctor.FullName, record.IsSuspicious);
    }

    // ─── M6-T3: GET STUDENT SUMMARY ────────────────────────────────────────────

    public async Task<IReadOnlyCollection<AttendanceSummaryItemDTO>> GetSummaryAsync(Guid studentId)
    {
        var enrollments = await _attendanceRepo.GetStudentEnrollmentsWithHistoryAsync(studentId);
        var results = new List<AttendanceSummaryItemDTO>();

        foreach (var e in enrollments)
        {
            var course = e.Course;
            int totalSessions = course.Sessions.Count; // only Ended sessions were eager loaded
            
            var allRecords = course.Sessions.SelectMany(s => s.AttendanceRecords).ToList();
            
            int presentAndLate = allRecords.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late);
            int missed = totalSessions - presentAndLate;

            // PRD: Absence Limit logic. Course.AbsenceLimit might be 5.
            var limit = course.AbsenceLimit;

            double percentage = totalSessions == 0 ? 100.0 : ((double)presentAndLate / totalSessions) * 100.0;
            
            string status = "Safe";
            if (missed >= limit) status = "Danger";
            else if (missed >= limit - 2) status = "Warning"; // Warning if 1 or 2 absences away from failing

            results.Add(new AttendanceSummaryItemDTO(
                course.Id,
                course.Code,
                course.Name,
                totalSessions,
                presentAndLate,
                missed,
                Math.Round(percentage, 1),
                limit,
                missed,
                status
            ));
        }

        return results;
    }

    // ─── M6-T4: DOCTOR OVERRIDE ──────────────────────────────────────────────────

    public async Task OverrideAttendanceAsync(Guid doctorId, Guid recordId, OverrideAttendanceRequest request)
    {
        var record = await _attendanceRepo.GetByIdAsync(recordId)
            ?? throw new AppException("NOT_FOUND", "Attendance record not found.");

        if (record.Session.Course.DoctorId != doctorId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor can override this attendance.");

        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length < 5)
            throw new AppException("VALIDATION_ERROR", "Reason must be at least 5 characters.");

        var oldStatus = record.Status;
        if (oldStatus == request.Status) return; // No change

        record.Status = request.Status;
        record.SuspiciousReason = $"[Doctor Override] {request.Reason} (Was: {oldStatus})";

        await _attendanceRepo.UpdateAsync(record);

        // Adjust Session TotalPresent dynamically
        if (oldStatus is AttendanceStatus.Absent && 
            request.Status is AttendanceStatus.Present or AttendanceStatus.Late)
        {
            await _sessionRepo.IncrementPresentCountAsync(record.Session.Id);
        }

        await _audit.LogAsync(doctorId, AuditAction.AttendanceManualOverride, 
            $"{recordId}|{oldStatus}->{request.Status}|{request.Reason}");

        var attendanceNotification = await BuildAttendanceUpdatePayloadAsync(
            record.StudentId,
            record.Id,
            record.Status,
            record.ScannedAt,
            record.Distance,
            record.IsSuspicious);
        await _notifier.SendToGroupAsync($"session:{record.SessionId}", "AttendanceUpdate", attendanceNotification);
    }

    // ─── M6-T5: DOCTOR MANUAL ADD ────────────────────────────────────────────────

    public async Task ManualAddAttendanceAsync(Guid doctorId, Guid sessionId, ManualAttendanceRequest request)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new AppException("NOT_FOUND", "Session not found.");

        if (session.Course.DoctorId != doctorId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor can manually add attendance.");

        if (!await _enrollmentRepo.ExistsAsync(request.StudentId, session.CourseId))
            throw new AppException("NOT_ENROLLED", "Student is not enrolled in this course.");

        if (await _attendanceRepo.ExistsAsync(sessionId, request.StudentId))
            throw new AppException("ALREADY_CHECKED_IN", "An attendance record already exists for this student in this session.");

        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length < 5)
            throw new AppException("VALIDATION_ERROR", "Reason must be at least 5 characters.");

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            StudentId = request.StudentId,
            Status = request.Status,
            ScannedAt = DateTime.UtcNow,
            StudentLat = 0,
            StudentLng = 0,
            Distance = 0,
            IsSuspicious = false,
            SuspiciousReason = $"[Manual Add] {request.Reason}"
        };

        await _attendanceRepo.CreateAsync(record);

        if (request.Status is AttendanceStatus.Present or AttendanceStatus.Late)
        {
            await _sessionRepo.IncrementPresentCountAsync(sessionId);
        }

        await _audit.LogAsync(doctorId, AuditAction.AttendanceManualAdd, $"{request.StudentId}|{request.Status}|{request.Reason}");
        var attendanceNotification = await BuildAttendanceUpdatePayloadAsync(
            request.StudentId,
            record.Id,
            record.Status,
            record.ScannedAt,
            record.Distance,
            record.IsSuspicious);
        await _notifier.SendToGroupAsync($"session:{sessionId}", "AttendanceUpdate", attendanceNotification);
    }

    // ─── Phase 7: ATTENDANCE ARCHIVE ─────────────────────────────────────────────

    public async Task<CourseArchiveDTO> GetCourseArchiveAsync(Guid courseId, Guid userId, string role)
    {
        var course = await _db.Courses
            .Include(c => c.Doctor)
            .FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (role != "Admin" && course.DoctorId != userId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor or an admin can access this archive.");

        var enrollments = await _db.Enrollments
            .Include(e => e.Student)
            .ThenInclude(s => s.StudentProfile)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();

        var sessions = await _db.Sessions
            .Where(s => s.CourseId == courseId)
            .OrderBy(s => s.StartedAt)
            .ToListAsync();

        var sessionIds = sessions.Select(s => s.Id).ToList();

        var records = await _db.AttendanceRecords
            .Where(r => sessionIds.Contains(r.SessionId))
            .ToListAsync();

        return new CourseArchiveDTO(
            CourseId: course.Id,
            CourseCode: course.Code,
            CourseName: course.Name,
            CreditHours: course.CreditHours,
            DoctorName: course.Doctor.FullName,
            Students: enrollments.Select(e => new ArchiveStudentDTO(
                e.StudentId, e.Student.StudentProfile?.StudentId ?? "N/A", e.Student.FullName)).ToList(),
            Sessions: sessions.Select(s => new ArchiveSessionDTO(
                s.Id, s.StartedAt, s.EndedAt)).ToList(),
            Records: records.Select(r => new ArchiveRecordDTO(
                r.StudentId, r.SessionId, r.Status.ToString())).ToList()
        );
    }

    public async Task AdminToggleAttendanceAsync(Guid adminId, AdminToggleAttendanceRequest request)
    {
        var session = await _db.Sessions.FindAsync(request.SessionId)
            ?? throw new AppException("NOT_FOUND", "Session not found.");
            
        if (!Enum.TryParse<AttendanceStatus>(request.Status, true, out var parsedStatus))
            throw new AppException("VALIDATION_ERROR", "Invalid status.");

        var existingRecord = await _db.AttendanceRecords
            .FirstOrDefaultAsync(r => r.SessionId == request.SessionId && r.StudentId == request.StudentId);

        if (existingRecord is not null)
        {
            var oldStatus = existingRecord.Status;
            if (oldStatus == parsedStatus) return;

            existingRecord.Status = parsedStatus;
            existingRecord.SuspiciousReason = $"[Admin Toggle] Status changed from {oldStatus} to {parsedStatus}.";
            
            if (oldStatus == AttendanceStatus.Absent && (parsedStatus == AttendanceStatus.Present || parsedStatus == AttendanceStatus.Late))
                session.TotalPresent += 1;
            else if ((oldStatus == AttendanceStatus.Present || oldStatus == AttendanceStatus.Late) && parsedStatus == AttendanceStatus.Absent)
                session.TotalPresent -= 1;
        }
        else
        {
            var newRecord = new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                StudentId = request.StudentId,
                Status = parsedStatus,
                ScannedAt = DateTime.UtcNow,
                IsSuspicious = false,
                SuspiciousReason = $"[Admin Toggle] Forced {parsedStatus}."
            };
            _db.AttendanceRecords.Add(newRecord);

            if (parsedStatus == AttendanceStatus.Present || parsedStatus == AttendanceStatus.Late)
                session.TotalPresent += 1;
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync(adminId, AuditAction.AttendanceManualOverride, $"Admin toggled {request.StudentId} to {parsedStatus} in {request.SessionId}");
    }
}
