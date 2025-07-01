using HotelSearchService.Models;
using HotelSearchService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSearchService.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class HotelSearchController : ControllerBase
    {
        private readonly IHotelSearchService _hotelSearchService;
        private readonly IHotelCacheService _hotelCacheService;

        public HotelSearchController(IHotelSearchService hotelSearchService, IHotelCacheService hotelCacheService)
        {
            _hotelSearchService = hotelSearchService;
            _hotelCacheService = hotelCacheService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllHotels([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0) pageSize = 10;

            var allHotels = await _hotelCacheService.GetAllCachedHotelsAsync();

            // Pagination logic (in-memory pagination since cached)
            int totalCount = allHotels.Count;
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pagedHotels = allHotels
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var pagedResult = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Items = pagedHotels
            };

            return Ok(pagedResult);
        }


        [HttpPost("search")]
        public async Task<IActionResult> SearchHotels(
                [FromBody] HotelSearchRequest request,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10)
        {
            bool isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var result = await _hotelSearchService.SearchAsync(request, isAuthenticated, pageNumber, pageSize);
            return Ok(result);
        }
    }
}
