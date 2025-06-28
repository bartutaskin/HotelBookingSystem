using AuthService.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly PasswordHasher<User> _hasher = new();
        private readonly AuthDbContext _db;

        public AuthService(IConfiguration config, AuthDbContext db)
        {
            _config = config;
            _db = db;
        }

        public async Task<string> RegisterAsync(string username, string email, string password, string role)
        {
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Username == username || u.Email == email);
            if (existing != null)
                throw new Exception("User already exists");

            var user = new User
            {
                Username = username,
                Email = email,
                Role = role
            };

            user.PasswordHash = _hasher.HashPassword(user, password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return GenerateJwt(user);
        }

        public Task<string> LoginAsync(string username, string password)
        {
            var user = _db.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                throw new Exception("User not found");

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (result == PasswordVerificationResult.Failed)
                throw new Exception("Invalid password");

            var token = GenerateJwt(user);
            return Task.FromResult(token);
        }

        private string GenerateJwt(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}
