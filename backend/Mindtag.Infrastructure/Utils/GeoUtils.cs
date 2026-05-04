namespace Mindtag.Infrastructure.Utils;

public static class GeoUtils
{
    /// <summary>
    /// Calculates distance between two GPS coordinates in meters using the Haversine formula.
    /// </summary>
    public static double CalculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371e3; // Earth's radius in meters
        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaPhi = (lat2 - lat1) * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;

        var a = Math.Sin(deltaPhi / 2) * Math.Sin(deltaPhi / 2) +
                Math.Cos(phi1) * Math.Cos(phi2) *
                Math.Sin(deltaLambda / 2) * Math.Sin(deltaLambda / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c; 
    }
}
