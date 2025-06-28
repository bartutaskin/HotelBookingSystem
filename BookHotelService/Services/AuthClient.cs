namespace BookHotelService.Services
{
    public class AuthClient : IAuthClient
    {
        private readonly HttpClient _httpClient;

        public AuthClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> UserExistsAsync(int userId)
        {
            var response = await _httpClient.GetAsync($"/api/v1/Auth/users/{userId}");
            return response.IsSuccessStatusCode;
        }
    }
}
