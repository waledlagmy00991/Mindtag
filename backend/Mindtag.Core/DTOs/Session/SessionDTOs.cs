namespace Mindtag.Core.DTOs.Session;

// ─── Requests ──────────────────────────────────────────────────────────────

public sealed record StartSessionRequest(
    Guid CourseId,
    double LocationLat,
    double LocationLng);

// ─── Responses ─────────────────────────────────────────────────────────────

public sealed record SessionDTO(
    Guid Id,
    Guid CourseId,
    Guid DoctorId,
    string Status,
    DateTime StartedAt,
    DateTime? EndedAt,
    int PresentCount);

public sealed record QrPayload(
    Guid SessionId,
    string Token,
    string CourseCode,
    string ProfessorName,
    string Room,
    long Iat,
    long Exp,
    string Signature);
