namespace Zer0.Tv.Core.Auth
{
    public interface ITokenProvider
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
    }
}
