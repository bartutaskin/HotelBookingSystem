using HotelCommentsService.Models.DTOs;
using HotelCommentsService.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelCommentsService.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] AddCommentDto comment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _commentService.AddCommentAsync(comment);
            return Created("", "Comment added successfully.");
        }

        [HttpGet("{hotelId:int}")]
        public async Task<IActionResult> GetComments(int hotelId)
        {
            var comments = await _commentService.GetCommentsByHotelAsync(hotelId);
            return Ok(comments);
        }

        [HttpGet("distribution/{hotelId:int}")]
        public async Task<IActionResult> GetCommentsDistribution(int hotelId)
        {
            var distribution = await _commentService.GetCommentsDistributionAsync(hotelId);
            return Ok(distribution);
        }
    }
}
