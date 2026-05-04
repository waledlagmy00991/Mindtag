using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Mindtag.Core.DTOs.Session;

namespace Mindtag.Infrastructure.Utils;

/// <summary>
/// Handles time-synchronized cryptographic QR generation and verification (PRD §14.1 & §6.4).
/// </summary>
public static class QrGenerator
{
    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    /// <summary>
    /// Generates a secure random 32-byte hex token.
    /// </summary>
    public static string GenerateCryptoToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    /// <summary>
    /// Constructs the QR payload JSON with an HMAC-SHA256 signature.
    /// </summary>
    public static string GenerateQrPayloadJson(
        Guid sessionId, 
        string token, 
        string courseCode, 
        string professorName, 
        string room, 
        long iat, 
        long exp, 
        string secretKey)
    {
        var signature = ComputeSignature(sessionId, token, iat, exp, secretKey);

        var payload = new QrPayload(
            SessionId: sessionId,
            Token: token,
            CourseCode: courseCode,
            ProfessorName: professorName,
            Room: room,
            Iat: iat,
            Exp: exp,
            Signature: signature
        );

        return JsonSerializer.Serialize(payload, _jsonOptions);
    }

    /// <summary>
    /// Verifies the payload signature using constant-time comparison to prevent timing attacks.
    /// Does NOT check time bounds (caller should check iat/exp separately).
    /// </summary>
    public static bool VerifySignature(QrPayload payload, string secretKey)
    {
        var expectedSignature = ComputeSignature(payload.SessionId, payload.Token, payload.Iat, payload.Exp, secretKey);
        
        // Convert hex strings to bytes for safe comparison
        var expectedBytes = Encoding.UTF8.GetBytes(expectedSignature);
        var providedBytes = Encoding.UTF8.GetBytes(payload.Signature);

        return CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }

    /// <summary>
    /// Builds the canonical string (v2:id:token:iat:exp) and computes HMAC-SHA256.
    /// </summary>
    private static string ComputeSignature(Guid sessionId, string token, long iat, long exp, string secretKey)
    {
        var canonicalString = $"v2:{sessionId}:{token}:{iat}:{exp}";
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var dataBytes = Encoding.UTF8.GetBytes(canonicalString);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
