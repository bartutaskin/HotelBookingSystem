using BookHotelService.Models;
using BookHotelService.Models.DTOs;
using BookHotelService.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookHotelService.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class BookingController : ControllerBase
    {
        private readonly IBookHotelService _bookHotelService;
        private readonly IAuthClient _authClient;

        public BookingController(IBookHotelService bookHotelService, IAuthClient authClient)
        {
            _bookHotelService = bookHotelService;
            _authClient = authClient;
        }

        [HttpPost]
        public async Task<IActionResult> BookHotel([FromBody] BookingRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if user exists in AuthService
            bool userExists = await _authClient.UserExistsAsync(request.UserId);
            if (!userExists)
                return BadRequest("User does not exist.");

            var bookingRequest = new BookingRequest
            {
                HotelId = request.HotelId,
                RoomId = request.RoomId,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                Guests = request.Guests,
                UserId = request.UserId
            };

            var result = await _bookHotelService.BookHotelAsync(bookingRequest);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }
    }

}
