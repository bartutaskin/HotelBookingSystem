namespace HotelCommentsService.Models.DTOs
{
    public class CommentResultDto
    {
        public string Id { get; set; } = null!;
        public int HotelId { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? UserId { get; set; }
    }
}
