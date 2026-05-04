using AspNetCoreRateLimit;
using StackExchange.Redis;
using Hangfire;
using Hangfire.MemoryStorage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mindtag.API.Middleware;
using Mindtag.Core.Interfaces;
using Mindtag.Core.Settings;
using Mindtag.Infrastructure.Data;
using Mindtag.Infrastructure.Jobs;
using Mindtag.Infrastructure.Services;
using Mindtag.Infrastructure.Utils;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Allow connections from LAN devices (mobile app testing) — only in Development
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

// Fix Windows EventLog permission crash
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ─── Strongly-typed configuration bindings ─────────────────────────────────
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<AttendanceRulesSettings>(
    builder.Configuration.GetSection(AttendanceRulesSettings.SectionName));
builder.Services.Configure<QrSecuritySettings>(
    builder.Configuration.GetSection(QrSecuritySettings.SectionName));
builder.Services.Configure<DeviceSecuritySettings>(
    builder.Configuration.GetSection(DeviceSecuritySettings.SectionName));
builder.Services.Configure<RateLimitingSettings>(
    builder.Configuration.GetSection(RateLimitingSettings.SectionName));
builder.Services.Configure<AuditLogSettings>(
    builder.Configuration.GetSection(AuditLogSettings.SectionName));
builder.Services.Configure<FirebaseSettings>(
    builder.Configuration.GetSection(FirebaseSettings.SectionName));
builder.Services.Configure<AzureSettings>(
    builder.Configuration.GetSection(AzureSettings.SectionName));
builder.Services.Configure<HangfireSettings>(
    builder.Configuration.GetSection(HangfireSettings.SectionName));

// ─── Database (SQL Server → InMemory fallback) ───────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useInMemory = string.IsNullOrEmpty(connectionString);

try
{
    if (!useInMemory)
    {
        // Test if SQL Server is reachable
        using var testConn = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        testConn.Open();
        testConn.Close();
        Console.WriteLine("✅ SQL Server connected successfully.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️  SQL Server unavailable ({ex.Message}). Falling back to InMemory.");
    useInMemory = true;
}

if (useInMemory)
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("Mindtag_DevDB"));
    Console.WriteLine("📦 Using InMemoryDatabase — data will NOT persist between restarts.");
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString, sql =>
            sql.MigrationsAssembly("Mindtag.Infrastructure")));
    Console.WriteLine("🗄️  Using SQL Server — data persists.");
}

// ─── Redis (Real → MemoryCache fallback) ──────────────────────────────────
var redisConnStr = builder.Configuration.GetConnectionString("Redis");
var useRealRedis = false;

try
{
    if (!string.IsNullOrEmpty(redisConnStr))
    {
        var redis = ConnectionMultiplexer.Connect(redisConnStr);
        builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
        builder.Services.AddSingleton<IRedisService, RedisService>();
        useRealRedis = true;
        Console.WriteLine("✅ Redis connected successfully.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️  Redis unavailable ({ex.Message}). Falling back to MemoryCache.");
}

if (!useRealRedis)
{
    builder.Services.AddSingleton<IRedisService, MemoryCacheRedisService>();
    Console.WriteLine("📦 Using MemoryCache as Redis fallback — no distributed caching.");
}

// ─── Hangfire ──────────────────────────────────────────────────────────────
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseMemoryStorage());
builder.Services.AddHangfireServer();

// Register job classes for DI
builder.Services.AddTransient<QrRotationJob>();
builder.Services.AddTransient<LectureReminderJob>();
builder.Services.AddTransient<DailyScheduleJob>();
builder.Services.AddTransient<SessionAutoEndJob>();
builder.Services.AddTransient<NotificationCleanupJob>();
builder.Services.AddTransient<AuditCleanupJob>();
builder.Services.AddTransient<RiskDetectionJob>();

// ─── Rate Limiting ─────────────────────────────────────────────────────────
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ─── Authentication & Authorization ────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>();
var key = Encoding.UTF8.GetBytes(jwtSettings!.AccessSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // Extract token from query string for SignalR WebSockets
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// ─── Firebase Initialization ───────────────────────────────────────────────
var firebasePath = builder.Configuration["Firebase:CredentialsPath"];
if (!string.IsNullOrEmpty(firebasePath) && System.IO.File.Exists(firebasePath))
{
    FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
    {
        Credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(firebasePath)
    });
}

// ─── Services ──────────────────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IUserRepository, Mindtag.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICourseRepository, Mindtag.Infrastructure.Repositories.CourseRepository>();
builder.Services.AddScoped<IEnrollmentRepository, Mindtag.Infrastructure.Repositories.EnrollmentRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ISessionRepository, Mindtag.Infrastructure.Repositories.SessionRepository>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IAttendanceRepository, Mindtag.Infrastructure.Repositories.AttendanceRepository>();
builder.Services.AddScoped<IAttendanceService, Mindtag.Infrastructure.Services.AttendanceService>();
builder.Services.AddScoped<IWebSocketNotifier, Mindtag.API.Services.WebSocketNotifier>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFcmService, FcmService>();
builder.Services.AddScoped<INotificationRepository, Mindtag.Infrastructure.Repositories.NotificationRepository>();
builder.Services.AddScoped<INotificationService, Mindtag.Infrastructure.Services.NotificationService>();
builder.Services.AddScoped<IScheduleRepository, Mindtag.Infrastructure.Repositories.ScheduleRepository>();
builder.Services.AddScoped<IScheduleService, Mindtag.Infrastructure.Services.ScheduleService>();
builder.Services.AddScoped<IAnnouncementRepository, Mindtag.Infrastructure.Repositories.AnnouncementRepository>();
builder.Services.AddScoped<IAnnouncementService, Mindtag.Infrastructure.Services.AnnouncementService>();

builder.Services.AddSingleton<JwtHelper>();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRCors", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Accept all origins for local dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ─── Safe Database Initialization ──────────────────────────────────────────
string? startupError = null;
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (dbContext.Database.IsInMemory())
    {
        dbContext.Database.EnsureCreated();
    }
    else
    {
        if (app.Environment.IsDevelopment())
        {
            // DEV: Drop & recreate for quick iteration
            dbContext.Database.EnsureDeleted();
            dbContext.Database.EnsureCreated();
            Console.WriteLine("🔄 Dev mode: Database dropped & recreated with current schema.");
        }
        else
        {
            // Production: Use EnsureCreated for initial deployment (creates tables if they don't exist)
            dbContext.Database.EnsureCreated();
            Console.WriteLine("✅ Database schema ensured.");
        }
    }

    // Seed test data if the database is empty (first run or InMemory)
    if (!dbContext.Users.Any())
    {
        // 1. Seed Doctor
        var doctorId = Guid.NewGuid();
        dbContext.Users.Add(new Mindtag.Core.Entities.User
        {
            Id = doctorId,
            FullName = "Dr. Test",
            Email = "doctor@university.edu",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = Mindtag.Core.Enums.UserRole.Doctor,
            CreatedAt = DateTime.UtcNow
        });

        dbContext.DoctorProfiles.Add(new Mindtag.Core.Entities.DoctorProfile
        {
            Id = Guid.NewGuid(),
            UserId = doctorId,
            Department = "Computer Science",
            Title = "Prof."
        });
        
        var course = new Mindtag.Core.Entities.Course
        {
            Id = Guid.NewGuid(),
            Code = "CS101",
            Name = "Intro to Testing",
            Description = "A test course for the dashboard",
            CreditHours = 3,
            DoctorId = doctorId
        };
        dbContext.Courses.Add(course);

        // 2. Seed Admin
        dbContext.Users.Add(new Mindtag.Core.Entities.User
        {
            Id = Guid.NewGuid(),
            FullName = "System Admin",
            Email = "admin@mindtag.edu",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = Mindtag.Core.Enums.UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        });

        dbContext.SaveChanges();
        Console.WriteLine("🌱 Seed data created (Doctor + Admin + Course).");
    }
}
catch (Exception ex)
{
    startupError = $"Database init failed: {ex.GetType().Name}: {ex.Message}";
    Console.WriteLine($"❌ {startupError}");
    if (ex.InnerException != null)
    {
        startupError += $" | Inner: {ex.InnerException.Message}";
        Console.WriteLine($"   Inner: {ex.InnerException.Message}");
    }
}

// ─── Middleware pipeline ───────────────────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseIpRateLimiting();

// Swagger enabled in all environments for API testing
app.UseSwagger();
app.UseSwaggerUI();

// app.UseHttpsRedirection(); // Causes socket hang-ups behind local Vite HTTP proxy
app.UseDefaultFiles(); // Added to serve index.html by default
app.UseStaticFiles(); // Serve static files (e.g. uploaded avatars from wwwroot)
app.UseCors("SignalRCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<Mindtag.API.Hubs.SessionHub>("/hubs/session");
app.MapHub<Mindtag.API.Hubs.StudentHub>("/hubs/student");
app.MapFallbackToFile("index.html"); // Added to support React Router SPA routing

// ─── Diagnostics endpoint ──────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new
{
    status = startupError == null ? "healthy" : "degraded",
    error = startupError,
    environment = app.Environment.EnvironmentName,
    time = DateTime.UtcNow
}));

// ─── Hangfire Dashboard ────────────────────────────────────────────────────
app.MapHangfireDashboard("/hangfire");

// ─── Register Recurring Jobs (PRD §10) ─────────────────────────────────────
try
{
    RecurringJob.AddOrUpdate<Mindtag.Infrastructure.Jobs.QrRotationJob>(
        "qr-rotation",
        job => job.ExecuteAsync(),
        "* * * * *"); // Minutely, the job itself loops for 60 seconds

    RecurringJob.AddOrUpdate<Mindtag.Infrastructure.Jobs.LectureReminderJob>(
        "lecture-reminders",
        job => job.ExecuteAsync(),
        Cron.Minutely);

    RecurringJob.AddOrUpdate<Mindtag.Infrastructure.Jobs.DailyScheduleJob>(
        "daily-schedule",
        job => job.ExecuteAsync(),
        "0 21 * * *"); // 21:00 daily

    RecurringJob.AddOrUpdate<Mindtag.Infrastructure.Jobs.SessionAutoEndJob>(
        "session-auto-end",
        job => job.ExecuteAsync(),
        "*/5 * * * *"); // every 5 minutes

    RecurringJob.AddOrUpdate<NotificationCleanupJob>(
        "notification-cleanup",
        job => job.ExecuteAsync(),
        "0 2 * * *"); // 02:00 daily

    RecurringJob.AddOrUpdate<AuditCleanupJob>(
        "audit-cleanup",
        job => job.ExecuteAsync(),
        "0 3 * * *"); // 03:00 daily

    RecurringJob.AddOrUpdate<RiskDetectionJob>(
        "risk-detection",
        job => job.ExecuteAsync(),
        "0 23 * * *"); // 23:00 daily
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Hangfire job registration failed: {ex.Message}");
}

app.Run();
