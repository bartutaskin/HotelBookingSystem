
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

                if (request.Guests > room.Capacity)
                {
                    return new BookingResult { Success = false, Message = "Requested guests exceed room capacity." };
                }

                // Check if user already has a booking for this room & overlapping dates
                var existingBooking = await _context.Bookings
                    .FirstOrDefaultAsync(b =>
                        b.RoomId == request.RoomId &&
                        b.UserId == request.UserId &&
                        b.Status == BookingStatus.Confirmed &&
                        b.CheckIn < request.CheckOut &&
                        b.CheckOut > request.CheckIn);

                if (existingBooking != null)
                {
                    return new BookingResult
                    {
                        Success = false,
                        Message = "You already have a booking for this room during the requested dates."
                    };
                }

                // Calculate capacity with all confirmed overlapping bookings
                var overlappingBookings = await _context.Bookings
                    .Where(b => b.RoomId == request.RoomId &&
                                b.Status == BookingStatus.Confirmed &&
                                b.CheckIn < request.CheckOut &&
                                b.CheckOut > request.CheckIn)
                    .ToListAsync();

                int bookedGuests = overlappingBookings.Sum(b => b.Guests);
                int availableCapacity = room.Capacity - bookedGuests;

                if (availableCapacity < request.Guests)
                {
                    return new BookingResult { Success = false, Message = "Not enough capacity available for the requested dates." };
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
