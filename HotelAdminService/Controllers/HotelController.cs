using AutoMapper;
using HotelAdminService.Data;
using HotelAdminService.Models;
using HotelAdminService.Services;
using HotelContracts.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelAdminService.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public class HotelController : ControllerBase
    {
        private readonly HotelDbContext _context;
        private readonly IMapper _mapper;
        private readonly HotelCacheService _hotelCacheService;

        public HotelController(HotelDbContext context, IMapper mapper, HotelCacheService hotelCacheService)
        {
            _context = context;
            _mapper = mapper;
            _hotelCacheService = hotelCacheService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllHotels([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0) pageSize = 10;

            var totalHotels = await _context.Hotels.CountAsync();

            var hotels = await _context.Hotels
                .Include(h => h.Rooms)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var hotelDtos = _mapper.Map<List<HotelWithRoomsDto>>(hotels);

            var pagedResult = new PagedResult<HotelWithRoomsDto>
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalHotels,
                TotalPages = (int)Math.Ceiling(totalHotels / (double)pageSize),
                Items = hotelDtos
            };

            return Ok(pagedResult);
        }

        [HttpGet("{hotelId}")]
        public async Task<IActionResult> GetHotelById(int hotelId)
        {
            var cachedHotel = await _hotelCacheService.GetHotelAsync(hotelId.ToString());
            if (cachedHotel != null)
                return Ok(cachedHotel);

            var hotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            if (hotel == null)
                return NotFound("Hotel not found");

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(hotel);
            await _hotelCacheService.CacheHotelAsync(hotelId.ToString(), hotelWithRoomsDto);

            return Ok(hotelWithRoomsDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateHotel(HotelCreateDto dto)
        {
            var hotel = _mapper.Map<Hotel>(dto);
            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            var savedHotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotel.Id);

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(savedHotel);
            await _hotelCacheService.CacheHotelAsync(hotel.Id.ToString(), hotelWithRoomsDto);

            return Ok(hotelWithRoomsDto);
        }

        [HttpPut("{hotelId}")]
        public async Task<IActionResult> UpdateHotel(int hotelId, HotelCreateDto updatedHotelDto)
        {
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null)
                return NotFound("Hotel not found");

            hotel.Name = updatedHotelDto.Name;
            hotel.City = updatedHotelDto.City;
            hotel.Address = updatedHotelDto.Address;
            hotel.Latitude = updatedHotelDto.Latitude;      
            hotel.Longitude = updatedHotelDto.Longitude;    

            await _context.SaveChangesAsync();

            var updatedHotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(updatedHotel);
            await _hotelCacheService.CacheHotelAsync(hotelId.ToString(), hotelWithRoomsDto);

            return Ok(hotelWithRoomsDto);
        }

        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetRoomById(int roomId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null)
                return NotFound("Room not found");

            var roomDto = _mapper.Map<RoomDto>(room);
            return Ok(roomDto);
        }

        [HttpPost("{hotelId}/room")]
        public async Task<IActionResult> AddRoom(int hotelId, RoomCreateDto dto)
        {
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null)
                return NotFound("Hotel not found");

            var room = _mapper.Map<Room>(dto);
            room.HotelId = hotelId;

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            // Re-fetch hotel with rooms
            var updatedHotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(updatedHotel);
            await _hotelCacheService.CacheHotelAsync(hotelId.ToString(), hotelWithRoomsDto);

            var roomDto = _mapper.Map<RoomDto>(room);
            return Ok(roomDto);
        }

        [HttpPut("room/{roomId}")]
        public async Task<IActionResult> UpdateRoom(int roomId, RoomCreateDto updatedRoomDto)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null)
                return NotFound("Room not found");

            _mapper.Map(updatedRoomDto, room);
            await _context.SaveChangesAsync();

            // Re-fetch hotel with rooms
            var hotelId = room.HotelId;
            var updatedHotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(updatedHotel);
            await _hotelCacheService.CacheHotelAsync(hotelId.ToString(), hotelWithRoomsDto);

            var roomDto = _mapper.Map<RoomDto>(room);
            return Ok(roomDto);
        }
    }
}
