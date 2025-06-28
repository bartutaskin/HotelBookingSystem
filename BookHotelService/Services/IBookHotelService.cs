using BookHotelService.Models;

namespace BookHotelService.Services
{
    public interface IBookHotelService
    {
        Task<BookingResult> BookHotelAsync(BookingRequest request);
    }
}
