using HotelCommentsService.Models.DTOs;
using HotelCommentsService.Models;
using System.Text.Json;
using MongoDB.Driver;

namespace HotelCommentsService.Services
{
    public class CommentService : ICommentService
    {
        private readonly IMongoCollection<Comment> _commentsCollection;

        public CommentService(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("HotelCommentsDb");
            _commentsCollection = database.GetCollection<Comment>("Comments");
        }

        public async Task AddCommentAsync(AddCommentDto commentDto)
        {
            var comment = new Comment
            {
                HotelId = commentDto.HotelId,
                ServiceType = commentDto.ServiceType,
                Rating = commentDto.Rating,
                Text = commentDto.Text,
                CreatedAt = DateTime.UtcNow,
                UserId = commentDto.UserId
            };
            await _commentsCollection.InsertOneAsync(comment);
        }

        public async Task<List<CommentResultDto>> GetCommentsByHotelAsync(int hotelId)
        {
            var comments = await _commentsCollection.Find(c => c.HotelId == hotelId).ToListAsync();

            return comments.Select(c => new CommentResultDto
            {
                Id = c.Id, 
                HotelId = c.HotelId,
                ServiceType = c.ServiceType,
                Rating = c.Rating,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId
            }).ToList();
        }

        public async Task<List<CommentsDistributionDto>> GetCommentsDistributionAsync(int hotelId)
        {
            var comments = await _commentsCollection.Find(c => c.HotelId == hotelId).ToListAsync();

            return comments
                .GroupBy(c => c.ServiceType)
                .Select(group => new CommentsDistributionDto
                {
                    ServiceType = group.Key,
                    RatingCounts = group
                        .GroupBy(c => c.Rating)
                        .ToDictionary(g => g.Key, g => g.Count())
                })
                .ToList();
        }
    }
}
