using AutoMapper;
using HotelAdminService.Data;
using HotelAdminService.Models;
using HotelAdminService.Models.DTOs;
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

        public HotelController(HotelDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
            var hotel = await _context.Hotels.Include(h => h.Rooms).FirstOrDefaultAsync(h => h.Id == hotelId);
            if (hotel == null)
                return NotFound("Hotel not found");

            var hotelDto = _mapper.Map<HotelWithRoomsDto>(hotel);
            return Ok(hotelDto);
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

        [HttpPost]
        public async Task<IActionResult> CreateHotel(HotelCreateDto dto)
        {
            var hotel = _mapper.Map<Hotel>(dto);
            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            var hotelDto = _mapper.Map<HotelDto>(hotel);
            return Ok(hotelDto);
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

            var roomDto = _mapper.Map<RoomDto>(room);
            return Ok(roomDto);
        }

        [HttpPut("room/{roomId}")]
        public async Task<IActionResult> UpdateRoom(int roomId, RoomCreateDto updatedRoomDto)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null)
                return NotFound("Room not found");

            // Map updated DTO to existing room entity
            _mapper.Map(updatedRoomDto, room);

            await _context.SaveChangesAsync();

            var roomDto = _mapper.Map<RoomDto>(room);
            return Ok(roomDto);
        }
    }
}
