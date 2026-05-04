namespace Mindtag.Core.DTOs;

/// <summary>
/// Generic wrapper for paginated API responses.
/// </summary>
public sealed record PaginatedList<T>(
    IReadOnlyCollection<T> Items,
    int TotalCount,
    int CurrentPage,
    int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => CurrentPage < TotalPages;
    public bool HasPreviousPage => CurrentPage > 1;
}
