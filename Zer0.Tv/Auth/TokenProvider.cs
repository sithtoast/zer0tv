using Zer0.Tv.Core.Auth;

namespace Zer0.Tv.Auth
{
    public class TokenProvider : ITokenProvider
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
    }
}
