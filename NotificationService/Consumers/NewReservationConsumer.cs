using HotelContracts.Events;
using MassTransit;

namespace NotificationService.Consumers
{
    public class NewReservationConsumer : IConsumer<NewReservation>
    {
        private readonly ILogger<NewReservationConsumer> _logger;

        public NewReservationConsumer(ILogger<NewReservationConsumer> logger)
        {
            _logger = logger;
        }

        public Task Consume(ConsumeContext<NewReservation> context)
        {
            var reservation = context.Message;

            // Simulated notification
            _logger.LogInformation("📬 Reservation Received: {@Reservation}", reservation);

            // You could add email logic here
            return Task.CompletedTask;
        }
    }
}
