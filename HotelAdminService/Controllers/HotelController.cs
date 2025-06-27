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
