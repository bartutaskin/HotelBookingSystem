using AutoMapper;
using HotelAdminService.Models;
using HotelContracts.DTOs;

namespace HotelAdminService.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<HotelDto, Hotel>();
            CreateMap<Hotel, HotelDto>();
            CreateMap<HotelCreateDto, Hotel>();
            CreateMap<Hotel, HotelWithRoomsDto>();

            // Room mappings
            CreateMap<Room, RoomDto>();
            CreateMap<RoomDto, Room>();
            CreateMap<RoomCreateDto, Room>();

        }
    }
}
