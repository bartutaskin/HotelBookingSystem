using BookHotelService.Messages;
using MassTransit;
using System.Threading.Tasks;

public class NewReservationConsumer : IConsumer<NewReservation>
{
    private readonly ILogger<NewReservationConsumer> _logger;

    public NewReservationConsumer(ILogger<NewReservationConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<NewReservation> context)
    {
        _logger.LogInformation("Received new reservation event: {BookingId} for hotel {HotelId}",
            context.Message.BookingId, context.Message.HotelId);

        return Task.CompletedTask;
    }
}
