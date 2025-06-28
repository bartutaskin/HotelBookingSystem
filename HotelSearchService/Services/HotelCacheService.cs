using HotelContracts.DTOs; 
using StackExchange.Redis;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace HotelSearchService.Services
{
    public class HotelCacheService
    {
        private readonly IDatabase _redisDb;
        private readonly IConnectionMultiplexer _redis;

        public HotelCacheService(IConnectionMultiplexer redis)
        {
            _redis = redis;
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

        public async Task<List<HotelWithRoomsDto>> GetAllCachedHotelsAsync()
        {
            var server = GetServer();
            var keys = server.Keys(pattern: "hotel:*");

            var hotels = new List<HotelWithRoomsDto>();

            foreach (var key in keys)
            {
                var json = await _redisDb.StringGetAsync(key);
                if (!json.IsNullOrEmpty)
                {
                    var hotel = JsonSerializer.Deserialize<HotelWithRoomsDto>(json!);
                    if (hotel != null)
                        hotels.Add(hotel);
                }
            }

            return hotels;
        }

        private IServer GetServer()
        {
            var endpoints = _redis.GetEndPoints();
            return _redis.GetServer(endpoints[0]);
        }
    }
}
