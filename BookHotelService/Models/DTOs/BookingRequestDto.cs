using System.ComponentModel.DataAnnotations;

namespace BookHotelService.Models.DTOs
{
    public class BookingRequestDto
    {
        [Required]
        public int HotelId { get; set; }

        [Required]
        public int RoomId { get; set; }  

        [Required]
        public DateOnly CheckIn { get; set; }

        [Required]
        public DateOnly CheckOut { get; set; }

        [Required]
        public int Guests { get; set; }
        [Required]
        public int UserId { get; set; } 
    }
}
