using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;

namespace Mindtag.Infrastructure.Data;

/// <summary>
/// Application database context — single source of truth for all EF Core entity mappings.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─── Core Entities ─────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<DoctorProfile> DoctorProfiles => Set<DoctorProfile>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseSchedule> CourseSchedules => Set<CourseSchedule>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<StudentScheduleSlot> StudentScheduleSlots => Set<StudentScheduleSlot>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // ─── Security Entities (PRD §14) ───────────────────────────────────────
    public DbSet<DeviceBinding> DeviceBindings => Set<DeviceBinding>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ───────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.FullName).HasMaxLength(200);
            e.Property(u => u.PasswordHash).HasMaxLength(200);
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        });

        // ── StudentProfile ─────────────────────────────────────────────────
        modelBuilder.Entity<StudentProfile>(e =>
        {
            e.HasIndex(sp => sp.UserId).IsUnique();
            e.HasIndex(sp => sp.StudentId).IsUnique();
            e.Property(sp => sp.StudentId).HasMaxLength(50);
            e.Property(sp => sp.Department).HasMaxLength(200);
            e.HasOne(sp => sp.User)
                .WithOne(u => u.StudentProfile)
                .HasForeignKey<StudentProfile>(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DoctorProfile ──────────────────────────────────────────────────
        modelBuilder.Entity<DoctorProfile>(e =>
        {
            e.HasIndex(dp => dp.UserId).IsUnique();
            e.Property(dp => dp.Department).HasMaxLength(200);
            e.Property(dp => dp.Title).HasMaxLength(50);
            e.HasOne(dp => dp.User)
                .WithOne(u => u.DoctorProfile)
                .HasForeignKey<DoctorProfile>(dp => dp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Course ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Course>(e =>
        {
            e.HasIndex(c => c.Code).IsUnique();
            e.Property(c => c.Name).HasMaxLength(200);
            e.Property(c => c.Code).HasMaxLength(20);
            e.Property(c => c.LocationName).HasMaxLength(200);
            e.HasOne(c => c.Doctor)
                .WithMany(u => u.TaughtCourses)
                .HasForeignKey(c => c.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── CourseSchedule ─────────────────────────────────────────────────
        modelBuilder.Entity<CourseSchedule>(e =>
        {
            e.HasIndex(cs => new { cs.CourseId, cs.DayOfWeek, cs.StartTime }).IsUnique();
            e.Property(cs => cs.DayOfWeek).HasConversion<string>().HasMaxLength(20);
            e.Property(cs => cs.Room).HasMaxLength(100);
            e.HasOne(cs => cs.Course)
                .WithMany(c => c.Schedules)
                .HasForeignKey(cs => cs.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Enrollment ─────────────────────────────────────────────────────
        modelBuilder.Entity<Enrollment>(e =>
        {
            e.HasIndex(en => new { en.StudentId, en.CourseId }).IsUnique();
            e.Property(en => en.RiskStatus).HasConversion<string>().HasMaxLength(20);
            e.HasOne(en => en.Student)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(en => en.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(en => en.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(en => en.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── StudentScheduleSlot ────────────────────────────────────────────
        modelBuilder.Entity<StudentScheduleSlot>(e =>
        {
            e.Property(s => s.SubjectName).HasMaxLength(200);
            e.Property(s => s.Location).HasMaxLength(200);
            e.Property(s => s.InstructorName).HasMaxLength(200);
            e.Property(s => s.DayOfWeek).HasConversion<string>().HasMaxLength(20);
            e.HasOne(s => s.Student)
                .WithMany(u => u.ScheduleSlots)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Course)
                .WithMany()
                .HasForeignKey(s => s.CourseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Session ────────────────────────────────────────────────────────
        modelBuilder.Entity<Session>(e =>
        {
            e.HasIndex(s => new { s.CourseId, s.Status });
            e.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(s => s.CurrentQrToken).HasMaxLength(128);
            e.HasOne(s => s.Course)
                .WithMany(c => c.Sessions)
                .HasForeignKey(s => s.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Doctor)
                .WithMany(u => u.Sessions)
                .HasForeignKey(s => s.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── AttendanceRecord ───────────────────────────────────────────────
        modelBuilder.Entity<AttendanceRecord>(e =>
        {
            e.HasIndex(ar => new { ar.SessionId, ar.StudentId }).IsUnique();
            e.Property(ar => ar.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(ar => ar.SuspiciousReason).HasMaxLength(100);
            e.HasOne(ar => ar.Session)
                .WithMany(s => s.AttendanceRecords)
                .HasForeignKey(ar => ar.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ar => ar.Student)
                .WithMany(u => u.AttendanceRecords)
                .HasForeignKey(ar => ar.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Announcement ───────────────────────────────────────────────────
        modelBuilder.Entity<Announcement>(e =>
        {
            e.Property(a => a.Title).HasMaxLength(300);
            e.HasOne(a => a.Course)
                .WithMany(c => c.Announcements)
                .HasForeignKey(a => a.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Author)
                .WithMany()
                .HasForeignKey(a => a.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Notification ───────────────────────────────────────────────────
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasIndex(n => new { n.UserId, n.IsRead });
            e.Property(n => n.Type).HasConversion<string>().HasMaxLength(30);
            e.Property(n => n.Title).HasMaxLength(300);
            e.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── RefreshToken ───────────────────────────────────────────────────
        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(rt => rt.Token).IsUnique();
            e.Property(rt => rt.Token).HasMaxLength(128);
            e.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DeviceBinding (§14.3) ──────────────────────────────────────────
        modelBuilder.Entity<DeviceBinding>(e =>
        {
            e.HasIndex(db => new { db.UserId, db.IsActive });
            e.Property(db => db.DeviceId).HasMaxLength(256);
            e.Property(db => db.Platform).HasMaxLength(100);
            e.HasOne(db => db.User)
                .WithMany()
                .HasForeignKey(db => db.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── AuditLog (§14.9) ──────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasIndex(al => new { al.UserId, al.Action, al.CreatedAt });
            e.HasIndex(al => new { al.Action, al.CreatedAt });
            e.Property(al => al.Action).HasConversion<string>().HasMaxLength(40);
            e.Property(al => al.TargetId).HasMaxLength(100);
            e.Property(al => al.IpAddress).HasMaxLength(45);
            e.Property(al => al.UserAgent).HasMaxLength(200);
            e.HasOne(al => al.User)
                .WithMany()
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
