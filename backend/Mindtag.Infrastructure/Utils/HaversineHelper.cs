namespace Mindtag.Infrastructure.Utils;

/// <summary>
/// Haversine formula — calculates great-circle distance between two GPS coordinates.
/// Returns distance in meters.
/// </summary>
public static class HaversineHelper
{
    private const double EarthRadiusMeters = 6_371_000.0;

    /// <summary>
    /// Calculate the distance in meters between two latitude/longitude points.
    /// </summary>
    public static double Calculate(double lat1, double lng1, double lat2, double lng2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLng = ToRadians(lng2 - lng1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusMeters * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
