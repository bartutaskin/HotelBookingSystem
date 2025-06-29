using BookHotelService.Models;
using HotelAdminService.Data;
using HotelContracts.DTOs;
using HotelContracts.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BookHotelService.Services
{
    public class BookHotelService : IBookHotelService
    {
        private readonly HotelDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public BookHotelService(HotelDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<BookingResult> BookHotelAsync(BookingRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var room = await _context.Rooms
                    .FirstOrDefaultAsync(r => r.Id == request.RoomId && r.HotelId == request.HotelId);

                if (room == null)
                {
                    return new BookingResult { Success = false, Message = "Room not found." };
                }

                // Validate check-in/check-out dates
                if (request.CheckOut <= request.CheckIn)
                {
                    return new BookingResult
                    {
                        Success = false,
                        Message = "Check-out date must be after check-in date."
                    };
                }

                // Validate requested booking dates are within room availability
                if (request.CheckIn < room.AvailableFrom || request.CheckOut > room.AvailableTo)
                {
                    return new BookingResult
                    {
                        Success = false,
                        Message = $"Booking dates must be within room availability: {room.AvailableFrom:yyyy-MM-dd} to {room.AvailableTo:yyyy-MM-dd}."
                    };
                }

                if (request.Guests > room.Capacity)
                {
                    return new BookingResult { Success = false, Message = "Requested guests exceed room capacity." };
                }

                // Check for overlapping confirmed bookings (any user)
                var overlappingBookingExists = await _context.Bookings
                    .AnyAsync(b =>
                        b.RoomId == request.RoomId &&
                        b.Status == BookingStatus.Confirmed &&
                        b.CheckIn < request.CheckOut &&    // Existing booking starts before requested booking ends
                        b.CheckOut > request.CheckIn);    // Existing booking ends after requested booking starts

                if (overlappingBookingExists)
                {
                    return new BookingResult
                    {
                        Success = false,
                        Message = "This room is already booked for the requested dates."
                    };
                }

                var booking = new Booking
                {
                    HotelId = request.HotelId,
                    RoomId = request.RoomId,
                    CheckIn = request.CheckIn,
                    CheckOut = request.CheckOut,
                    Guests = request.Guests,
                    UserId = request.UserId,
                    Status = BookingStatus.Confirmed
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Publish event message after booking is saved
                await _publishEndpoint.Publish(new NewReservation
                {
                    BookingId = booking.Id,
                    HotelId = booking.HotelId,
                    RoomId = booking.RoomId,
                    UserId = booking.UserId,
                    CheckIn = booking.CheckIn,
                    CheckOut = booking.CheckOut,
                    Guests = booking.Guests
                });

                await transaction.CommitAsync();

                return new BookingResult { Success = true, Message = "Booking successful." };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
