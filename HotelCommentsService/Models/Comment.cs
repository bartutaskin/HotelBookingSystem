using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HotelCommentsService.Models
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public int HotelId { get; set; }

        public string ServiceType { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? UserId { get; set; }
    }
}
