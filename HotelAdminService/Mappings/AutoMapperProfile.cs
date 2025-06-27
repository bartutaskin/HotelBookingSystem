using AutoMapper;
using HotelAdminService.Models.DTOs;
using HotelAdminService.Models;

namespace HotelAdminService.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<HotelDto, Hotel>();
            CreateMap<Hotel, HotelDto>();
            CreateMap<HotelCreateDto, Hotel>();

            // Room mappings
            CreateMap<Room, RoomDto>();
            CreateMap<RoomDto, Room>();
            CreateMap<RoomCreateDto, Room>();

        }
    }
}
