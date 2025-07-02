using HotelSearchService.Models.DTOs;
using HotelSearchService.Models;
using HotelContracts.DTOs;

namespace HotelSearchService.Services
{
    public interface IHotelSearchService
    {
        Task<PagedResult<HotelSearchResultDto>> SearchAsync(HotelSearchRequest request, bool isAuthenticated, int pageNumber, int pageSize);

    }
}
