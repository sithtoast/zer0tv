using System.Text.Json.Serialization;

namespace Zer0.Tv.Infrastructure.Categories.Responses
{
    public class CategoryDTO
    {
        [JsonPropertyName("box_art_url")]
        public string BoxArtUrl { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}
