using HotelAdminService.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelAdminService.Data
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

        public DbSet<Hotel> Hotels => Set<Hotel>();
        public DbSet<Room> Rooms => Set<Room>();
    }
}
