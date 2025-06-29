
using BookHotelService.Services;
using HotelAdminService.Data;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Serilog;

namespace BookHotelService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddScoped<IBookHotelService, BookHotelService.Services.BookHotelService>();
            builder.Services.AddDbContext<HotelDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });
            builder.Services.AddApiVersioning(options =>
            {
                options.AssumeDefaultVersionWhenUnspecified = true; // If client doesn't specify version, use default
                options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0); // Default version is v1.0
                options.ReportApiVersions = true; // Return API supported versions in response headers
                options.ApiVersionReader = new Microsoft.AspNetCore.Mvc.Versioning.HeaderApiVersionReader("x-api-version"); // Optional: read version from header
            });
            var authServiceUrl = builder.Configuration["AuthService:BaseUrl"];
            builder.Services.AddHttpClient<IAuthClient, AuthClient>(client =>
            {
                client.BaseAddress = new Uri(authServiceUrl); // AuthService URL
            });
            builder.Services.AddMassTransit(x =>
            {
                x.AddConsumer<NewReservationConsumer>();

                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host("localhost", "/", h =>
                    {
                        h.Username("guest");
                        h.Password("guest");
                    });

                    cfg.ReceiveEndpoint("new_reservations_queue", e =>
                    {
                        e.ConfigureConsumer<NewReservationConsumer>(context);
                    });
                });
            });
            builder.Logging.AddFile("Logs/log-{Date}.txt");
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
