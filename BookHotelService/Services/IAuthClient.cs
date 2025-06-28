namespace BookHotelService.Services
{
    public interface IAuthClient
    {
        Task<bool> UserExistsAsync(int userId);
    }
}
