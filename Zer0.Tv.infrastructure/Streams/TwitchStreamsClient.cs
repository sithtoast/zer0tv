using System.Net.Http.Json;
using Zer0.Tv.Core.Auth;
using Zer0.Tv.Infrastructure.Streams.Responses;
using StreamModel = Zer0.Tv.Domain.StreamModel;

namespace Zer0.Tv.Infrastructure.Streams
{
    public class TwitchStreamsClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly ITokenProvider _tokenProvider;

        public TwitchStreamsClient(HttpClient httpClient, ITokenProvider tokenProvider)
        {
            _httpClient = httpClient;
            _tokenProvider = tokenProvider;

            if (!_httpClient.DefaultRequestHeaders.Any(x => x.Key == "Authorization"))
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_tokenProvider.AccessToken}");
        }

        public async Task<IEnumerable<StreamModel>> GetStreams(string gameId, string? cursor = null)
        {
            var url = $"/helix/streams?game_id={gameId}&first=100";
            if (!string.IsNullOrWhiteSpace(cursor))
                url += $"after={cursor}";
            var response1 = await _httpClient.GetStringAsync(url);
            var response = await _httpClient.GetFromJsonAsync<StreamsDTO>(url);

            return response.Streams.Select(Map);
        }

        private StreamModel Map(StreamDTO category) => new()
        {
            Id = category.Id,
            UserId = category.UserId,
            UserLogin = category.UserLogin,
            UserName = category.UserName,
            GameId = category.GameId,
            GameName = category.GameName,
            Type = category.Type,
            Title = category.Title,
            Tags = category.Tags,
            ViewerCount = category.ViewerCount,
            StartedAt = category.StartedAt,
            Language = category.Language,
            ThumbnailUrl = category.ThumbnailUrl,
            TagIds = category.TagIds,
            IsMature = category.IsMature
        };

        public void Dispose() => _httpClient?.Dispose();
    }
}
