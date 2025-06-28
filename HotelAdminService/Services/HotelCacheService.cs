using HotelAdminService.Models.DTOs;
using StackExchange.Redis;
using System.Text.Json;

namespace HotelAdminService.Services
{
    public class HotelCacheService
    {
        private readonly IDatabase _redisDb;

        public HotelCacheService(IConnectionMultiplexer redis)
        {
            _redisDb = redis.GetDatabase();
        }
        public async Task CacheHotelAsync(string hotelId, HotelWithRoomsDto hotel)
        {
            var json = JsonSerializer.Serialize(hotel);
            await _redisDb.StringSetAsync($"hotel:{hotelId}", json);
        }
        public async Task<HotelWithRoomsDto?> GetHotelAsync(string hotelId)
        {
            var json = await _redisDb.StringGetAsync($"hotel:{hotelId}");
            return json.IsNullOrEmpty ? null : JsonSerializer.Deserialize<HotelWithRoomsDto>(json!);
        }
    }
}