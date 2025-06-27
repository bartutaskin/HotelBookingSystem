namespace HotelAdminService.Models.DTOs
{
    public class RoomCreateDto
    {
        public string RoomType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
    }
}
