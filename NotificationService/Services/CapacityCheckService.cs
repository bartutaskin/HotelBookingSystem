using HotelAdminService.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NotificationService.Services
{
    public class CapacityCheckService : BackgroundService
    {
        private readonly ILogger<CapacityCheckService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _runTime = TimeSpan.FromHours(0); // Midnight UTC

        public CapacityCheckService(ILogger<CapacityCheckService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var isTest = false; // or get from config/env

            if (isTest)
            {
                _logger.LogInformation("Starting immediate capacity check for testing...");
                await CheckCapacitiesAndNotifyAsync(stoppingToken);
                _logger.LogInformation("Test run completed.");

                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            else
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Starting capacity check...");
                    await CheckCapacitiesAndNotifyAsync(stoppingToken);
                    _logger.LogInformation("Capacity check completed. Sleeping for 24 hours.");
                    await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                }
            }
        }

        private async Task CheckCapacitiesAndNotifyAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Running capacity check...");

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HotelDbContext>();

            var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = startDate.AddMonths(1);

            var hotels = await context.Hotels
                .Include(h => h.Rooms)
                .ToListAsync(cancellationToken);

            foreach (var hotel in hotels)
            {
                int totalCapacity = 0;
                foreach (var room in hotel.Rooms)
                {
                    if (room.AvailableTo >= startDate && room.AvailableFrom <= endDate)
                        totalCapacity += room.Capacity;
                }

                var bookings = await context.Bookings
                    .Where(b => b.Status == HotelContracts.DTOs.BookingStatus.Confirmed &&
                                b.HotelId == hotel.Id &&
                                b.CheckIn < endDate &&
                                b.CheckOut > startDate)
                    .ToListAsync(cancellationToken);

                int bookedGuests = bookings.Sum(b => b.Guests);
                double capacityPercent = totalCapacity == 0 ? 0 : ((totalCapacity - bookedGuests) / (double)totalCapacity) * 100;

                if (capacityPercent < 20)
                {
                    _logger.LogWarning($"Hotel {hotel.Name} (ID: {hotel.Id}) capacity low: {capacityPercent:F2}% remaining. Notify admin!");
                }
            }
        }
    }
}
