namespace HotelCommentsService.Models.DTOs
{
    public class CommentsDistributionDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public Dictionary<int, int> RatingCounts { get; set; } = new(); // rating => count
    }
}
