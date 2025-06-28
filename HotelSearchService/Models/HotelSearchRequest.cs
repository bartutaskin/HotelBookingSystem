namespace HotelSearchService.Models
{
    public class HotelSearchRequest
    {
        public string Destination { get; set; } = string.Empty;
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
        public int Guests { get; set; }
    }
}
