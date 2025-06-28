namespace HotelSearchService.Models.DTOs
{
    public class RoomInfoDto
    {
        public int RoomId { get; set; }
        public string RoomType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public decimal DiscountedPrice { get; set; } // Calculate 15% off if logged-in
    }
}
