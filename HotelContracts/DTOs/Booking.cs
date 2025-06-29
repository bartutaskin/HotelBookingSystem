using System.ComponentModel.DataAnnotations;

namespace HotelContracts.DTOs
{
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled
    }
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        public int HotelId { get; set; }
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }

        public int Guests { get; set; }

        public int UserId { get; set; } 

        public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    }
}
