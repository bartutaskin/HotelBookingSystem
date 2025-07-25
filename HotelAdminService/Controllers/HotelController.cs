﻿using AutoMapper;
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

        [HttpGet("capacity")]
        public async Task<IActionResult> GetHotelCapacitiesForNextMonth()
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = startDate.AddMonths(1);

            var hotels = await _context.Hotels
                .Include(h => h.Rooms)
                .ToListAsync();

            var results = new List<object>();

            foreach (var hotel in hotels)
            {
                int totalCapacity = 0;
                foreach (var room in hotel.Rooms)
                {
                    if (room.AvailableTo >= startDate && room.AvailableFrom <= endDate)
                    {
                        totalCapacity += room.Capacity;
                    }
                }

                // Get bookings for rooms of this hotel overlapping next month
                var bookings = await _context.Bookings
                    .Where(b => b.Status == BookingStatus.Confirmed &&
                                b.HotelId == hotel.Id &&
                                b.CheckIn < endDate &&
                                b.CheckOut > startDate)
                    .ToListAsync();

                int bookedGuests = bookings.Sum(b => b.Guests);

                double capacityPercent = totalCapacity == 0 ? 0 : ((totalCapacity - bookedGuests) / (double)totalCapacity) * 100;

                results.Add(new
                {
                    HotelId = hotel.Id,
                    HotelName = hotel.Name,
                    CapacityPercentage = capacityPercent,
                    AdminEmail = "admin@example.com" // Replace with real admin emails if available
                });
            }

            return Ok(results);
        }
        [HttpGet("{hotelId}/bookedguests")]
        public async Task<IActionResult> GetBookedGuestsCount(
            int hotelId,
            [FromQuery] DateOnly start,
            [FromQuery] DateOnly end)
        {
            // Validate dates
            if (start > end)
            {
                return BadRequest("Start date must be before end date.");
            }

            // Check if hotel exists
            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == hotelId);
            if (!hotelExists)
            {
                return NotFound("Hotel not found.");
            }

            // Query confirmed bookings for rooms in the hotel overlapping the date range
            var bookedGuests = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed &&
                            b.HotelId == hotelId &&
                            b.CheckIn < end &&
                            b.CheckOut > start)
                .SumAsync(b => b.Guests);

            return Ok(bookedGuests);
        }

        [HttpDelete("{hotelId}")]
        public async Task<IActionResult> DeleteHotel(int hotelId)
        {
            var hotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            if (hotel == null)
                return NotFound("Hotel not found");

            _context.Rooms.RemoveRange(hotel.Rooms);
            _context.Hotels.Remove(hotel);           
            await _context.SaveChangesAsync();

            await _hotelCacheService.RemoveHotelAsync(hotelId.ToString()); // Clear cache if needed

            return NoContent();
        }

        [HttpDelete("room/{roomId}")]
        public async Task<IActionResult> DeleteRoom(int roomId)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null)
                return NotFound("Room not found");

            var hotelId = room.HotelId;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            var updatedHotel = await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId);

            var hotelWithRoomsDto = _mapper.Map<HotelWithRoomsDto>(updatedHotel);
            await _hotelCacheService.CacheHotelAsync(hotelId.ToString(), hotelWithRoomsDto);

            return NoContent();
        }
    }
}
