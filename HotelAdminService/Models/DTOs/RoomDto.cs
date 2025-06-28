namespace HotelAdminService.Models.DTOs
{
    public class RoomDto
    {
        public int Id { get; set; }
        public string RoomType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public DateOnly AvailableFrom { get; set; }
        public DateOnly AvailableTo { get; set; }
        public int HotelId { get; set; }
    }
}
