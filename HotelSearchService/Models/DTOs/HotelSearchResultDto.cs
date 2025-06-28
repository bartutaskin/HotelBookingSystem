namespace HotelSearchService.Models.DTOs
{
    public class HotelSearchResultDto
    {
        public int HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<RoomInfoDto> AvailableRooms { get; set; } = new();
    }
}
