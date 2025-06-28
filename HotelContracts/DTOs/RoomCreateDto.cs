namespace HotelContracts.DTOs
{
    public class RoomCreateDto
    {
        public string RoomType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public DateOnly AvailableFrom { get; set; }
        public DateOnly AvailableTo { get; set; }
    }
}
