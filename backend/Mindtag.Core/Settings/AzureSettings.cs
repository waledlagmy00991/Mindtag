namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for Azure Blob Storage.
/// Bound to the "Azure" section of appsettings.json.
/// </summary>
public sealed class AzureSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "Azure";

    /// <summary>
    /// Connection string for Azure Blob Storage.
    /// </summary>
    public string BlobStorageConnectionString { get; set; } = string.Empty;

    /// <summary>
    /// Name of the blob container used for avatar uploads.
    /// </summary>
    public string BlobContainerName { get; set; } = "avatars";
}
