﻿namespace HotelContracts.DTOs
{
    public class HotelCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? Latitude { get; set; }  
        public double? Longitude { get; set; }
    }
}
