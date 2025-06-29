using HotelCommentsService.Models.DTOs;

namespace HotelCommentsService.Services
{
    public interface ICommentService
    {
        Task AddCommentAsync(AddCommentDto commentDto);
        Task<List<CommentResultDto>> GetCommentsByHotelAsync(int hotelId);
        Task<List<CommentsDistributionDto>> GetCommentsDistributionAsync(int hotelId);
    }
}
