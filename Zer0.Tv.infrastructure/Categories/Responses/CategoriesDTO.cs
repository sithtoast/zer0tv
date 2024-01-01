using System.Text.Json.Serialization;

namespace Zer0.Tv.Infrastructure.Categories.Responses
{
    public class CategoriesDTO
    {
        [JsonPropertyName("data")]
        public IEnumerable<CategoryDTO> Categories { get; set; }
    }
}
