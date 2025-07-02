using HotelContracts.DTOs;
using HotelSearchService.Models;
using HotelSearchService.Models.DTOs;

namespace HotelSearchService.Services
{
    public class HotelSearchService : IHotelSearchService
    {
        private readonly IHotelCacheService _hotelCacheService;

        public HotelSearchService(IHotelCacheService hotelCacheService)
        {
            _hotelCacheService = hotelCacheService;
        }

        public async Task<PagedResult<HotelSearchResultDto>> SearchAsync(
            HotelSearchRequest request,
            bool isAuthenticated,
            int pageNumber,
            int pageSize)
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

            int totalCount = results.Count;
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pagedItems = results
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedResult<HotelSearchResultDto>
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Items = pagedItems
            };
        }
    }
}
