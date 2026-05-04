using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mindtag.Core.Settings;

namespace Mindtag.Infrastructure.Utils;

/// <summary>
/// JWT utility for generating and validating access and refresh tokens.
/// </summary>
public sealed class JwtHelper
{
    private readonly JwtSettings _settings;
    private readonly SigningCredentials _signingCredentials;
    private readonly TokenValidationParameters _validationParameters;

    public JwtHelper(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.AccessSecret));
        _signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        _validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    }

    /// <summary>
    /// Generate a signed JWT access token with userId, role, and email claims.
    /// Expires after <see cref="JwtSettings.AccessExpiryMinutes"/> minutes.
    /// </summary>
    public string GenerateAccessToken(Guid userId, string role, string email)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.AccessExpiryMinutes),
            signingCredentials: _signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generate a cryptographically random refresh token (32 hex characters).
    /// The raw token is returned to the client; only its SHA256 hash is stored in DB.
    /// </summary>
    public static string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N"); // 32 hex chars
    }

    /// <summary>
    /// Validate an access token and return the ClaimsPrincipal.
    /// Returns null if the token is invalid or expired.
    /// </summary>
    public ClaimsPrincipal? ValidateAccessToken(string token)
    {
        try
        {
            var principal = new JwtSecurityTokenHandler()
                .ValidateToken(token, _validationParameters, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Returns the TokenValidationParameters for use in JWT Bearer authentication middleware.
    /// </summary>
    public TokenValidationParameters GetValidationParameters() => _validationParameters;
}
