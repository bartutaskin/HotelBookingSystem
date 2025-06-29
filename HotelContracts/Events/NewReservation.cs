using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelContracts.Events
{
    public record NewReservation
    {
        public int BookingId { get; init; }
        public int HotelId { get; init; }
        public int RoomId { get; init; }
        public int UserId { get; init; }
        public DateOnly CheckIn { get; init; }
        public DateOnly CheckOut { get; init; }
        public int Guests { get; init; }
    }
}
