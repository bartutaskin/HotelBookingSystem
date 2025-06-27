
using AuthService.Data;
using AuthService.Services;
using Microsoft.EntityFrameworkCore;

namespace AuthService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddScoped<IAuthService, AuthService.Services.AuthService>();


            builder.Services.AddControllers();
            builder.Services.AddDbContext<AuthDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV"; 
                options.SubstituteApiVersionInUrl = true;
            });

            builder.Services.AddSwaggerGen();

            builder.Services.AddApiVersioning(options =>
            {
                options.AssumeDefaultVersionWhenUnspecified = true; // If client doesn't specify version, use default
                options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0); // Default version is v1.0
                options.ReportApiVersions = true; // Return API supported versions in response headers
                options.ApiVersionReader = new Microsoft.AspNetCore.Mvc.Versioning.HeaderApiVersionReader("x-api-version"); // Optional: read version from header
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
