namespace AuthService.Models.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
