using HotelContracts.DTOs;

namespace HotelSearchService.Services
{
    public interface IHotelCacheService
    {
        Task CacheHotelAsync(string hotelId, HotelWithRoomsDto hotel);
        Task<HotelWithRoomsDto?> GetHotelAsync(string hotelId);
        Task<List<HotelWithRoomsDto>> GetAllCachedHotelsAsync();
    }
}
