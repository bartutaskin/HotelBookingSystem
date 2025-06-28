﻿namespace HotelAdminService.Models.DTOs
{
    public class HotelWithRoomsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public List<RoomDto> Rooms { get; set; } = new();
    }
}
