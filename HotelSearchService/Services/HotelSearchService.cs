using HotelSearchService.Models;
using HotelSearchService.Models.DTOs;

namespace HotelSearchService.Services
{
    public class HotelSearchService : IHotelSearchService
    {
        private readonly HotelCacheService _hotelCacheService;

        public HotelSearchService(HotelCacheService hotelCacheService)
        {
            _hotelCacheService = hotelCacheService;
        }

        public async Task<List<HotelSearchResultDto>> SearchAsync(HotelSearchRequest request, bool isAuthenticated)
        {
            var allHotels = await _hotelCacheService.GetAllCachedHotelsAsync();

            var filteredHotels = allHotels
                .Where(h => h.City.Equals(request.Destination, StringComparison.OrdinalIgnoreCase))
                .ToList();

            var results = new List<HotelSearchResultDto>();

            foreach (var hotel in filteredHotels)
            {
                var availableRooms = hotel.Rooms.Where(room =>
                    room.Capacity >= request.Guests &&
                    room.AvailableFrom <= request.CheckIn &&
                    room.AvailableTo >= request.CheckOut
                ).ToList();

                if (availableRooms.Any())
                {
                    var roomDtos = availableRooms.Select(room =>
                    {
                        var price = room.Price;
                        var discountedPrice = isAuthenticated ? price * 0.85m : price;

                        return new RoomInfoDto
                        {
                            RoomId = room.Id,
                            RoomType = room.RoomType,
                            Capacity = room.Capacity,
                            Price = price,
                            DiscountedPrice = discountedPrice
                        };
                    }).ToList();

                    results.Add(new HotelSearchResultDto
                    {
                        HotelId = hotel.Id,
                        HotelName = hotel.Name,
                        City = hotel.City,
                        Address = hotel.Address,
                        Latitude = hotel.Latitude,
                        Longitude = hotel.Longitude,
                        AvailableRooms = roomDtos
                    });
                }
            }

            return results;
        }
    }
}
