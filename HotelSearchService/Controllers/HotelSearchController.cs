using HotelSearchService.Models;
using HotelSearchService.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelSearchService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class HotelSearchController : ControllerBase
    {
        private readonly IHotelSearchService _hotelSearchService;

        public HotelSearchController(IHotelSearchService hotelSearchService)
        {
            _hotelSearchService = hotelSearchService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchHotels([FromBody] HotelSearchRequest request)
        {
            // Check if user is authenticated to apply discount
            bool isAuthenticated = User.Identity?.IsAuthenticated ?? false;

            var results = await _hotelSearchService.SearchAsync(request, isAuthenticated);

            return Ok(results);
        }
    }
}
