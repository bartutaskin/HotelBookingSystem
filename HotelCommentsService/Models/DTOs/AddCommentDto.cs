namespace HotelCommentsService.Models.DTOs
{
    public class AddCommentDto
    {
        public int HotelId { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Text { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }
}
