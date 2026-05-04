using System;
using System.Collections.Generic;

namespace Mindtag.Core.DTOs.Attendance;

public sealed record CourseArchiveDTO(
    Guid CourseId,
    string CourseCode,
    string CourseName,
    int CreditHours,
    string DoctorName,
    IReadOnlyCollection<ArchiveStudentDTO> Students,
    IReadOnlyCollection<ArchiveSessionDTO> Sessions,
    IReadOnlyCollection<ArchiveRecordDTO> Records
);

public sealed record ArchiveStudentDTO(
    Guid Id,
    string AcademicId,
    string FullName
);

public sealed record ArchiveSessionDTO(
    Guid Id,
    DateTime StartedAt,
    DateTime? EndedAt
);

public sealed record ArchiveRecordDTO(
    Guid StudentId,
    Guid SessionId,
    string Status
);

public sealed record AdminToggleAttendanceRequest(
    Guid StudentId,
    Guid SessionId,
    string Status
);
