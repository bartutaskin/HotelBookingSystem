using AuthService.Models.Entities;

namespace AuthService.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(string username, string email, string password, string role);
        Task<string> LoginAsync(string username, string password);
        Task<User?> GetUserByIdAsync(int userId);
    }
}
