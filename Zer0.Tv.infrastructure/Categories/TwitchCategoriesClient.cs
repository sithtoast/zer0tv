using System.Net.Http.Json;
using System.Web;
using Zer0.Tv.Core.Auth;
using Zer0.Tv.Domain;
using Zer0.Tv.Infrastructure.Categories.Responses;

namespace Zer0.Tv.Infrastructure.Categories
{
    public class TwitchCategoriesClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly ITokenProvider _tokenProvider;

        public TwitchCategoriesClient(HttpClient httpClient, ITokenProvider tokenProvider)
        {
            _httpClient = httpClient;
            _tokenProvider = tokenProvider;

            if (!_httpClient.DefaultRequestHeaders.Any(x => x.Key == "Authorization"))
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_tokenProvider.AccessToken}");
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync()
        {
            var response = await _httpClient.GetFromJsonAsync<CategoriesDTO>("/helix/games/top?first=50");

            return response.Categories.Any()
                ? response.Categories.Select(Map)
                : new List<Category>().AsEnumerable();
        }

        public async Task<IEnumerable<Category>> SearchCategoriesAsync(string searchQuery)
        {
            var response = await _httpClient.GetFromJsonAsync<CategoriesDTO>($"/helix/search/categories?query={HttpUtility.UrlEncode(searchQuery)}");

            return response.Categories.Any()
                ? response.Categories.Select(Map)
                : new List<Category>().AsEnumerable();
        }

        private Category Map(CategoryDTO category)
        {
            return new Category
            {
                Id = category.Id,
                Name = category.Name,
                BoxArtUrl = category.BoxArtUrl.Replace("52x72", "150x220").Replace("{width}x{height}", "150x220")
            };
        }

        public void Dispose() => _httpClient?.Dispose();
    }
}
