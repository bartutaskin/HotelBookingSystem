using System.ComponentModel.DataAnnotations;

namespace HotelAdminService.Models
{
    public class Room
    {
        [Key]
        public int Id { get; set; }

        public string RoomType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal Price { get; set; }

        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }

        public int HotelId { get; set; }
        public Hotel? Hotel { get; set; }
    }
}
