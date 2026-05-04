namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for Firebase Cloud Messaging.
/// Bound to the "Firebase" section of appsettings.json.
/// </summary>
public sealed class FirebaseSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "Firebase";

    /// <summary>
    /// Firebase project identifier.
    /// </summary>
    public string ProjectId { get; set; } = string.Empty;

    /// <summary>
    /// File path to the Firebase service account credentials JSON.
    /// </summary>
    public string CredentialsPath { get; set; } = string.Empty;
}
