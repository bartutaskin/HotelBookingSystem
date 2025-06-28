using HotelSearchService.Models.DTOs;
using HotelSearchService.Models;

namespace HotelSearchService.Services
{
    public interface IHotelSearchService
    {
        Task<List<HotelSearchResultDto>> SearchAsync(HotelSearchRequest request, bool isAuthenticated);
    }
}
