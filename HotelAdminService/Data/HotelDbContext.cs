using HotelAdminService.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelAdminService.Data
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

        public DbSet<Hotel> Hotels => Set<Hotel>();
        public DbSet<Room> Rooms => Set<Room>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Room>()
                .Property(r => r.AvailableFrom)
                .HasColumnType("date"); // Store only date, no time

            modelBuilder.Entity<Room>()
                .Property(r => r.AvailableTo)
                .HasColumnType("date"); 

            base.OnModelCreating(modelBuilder);
        }
    }
}
