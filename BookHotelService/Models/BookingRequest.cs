namespace BookHotelService.Models
{
    public class BookingRequest
    {
        public int HotelId { get; set; }
        public int RoomId { get; set; }
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
        public int Guests { get; set; }
        public int UserId { get; set; } 
    }
}
