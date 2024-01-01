using System.Text.Json.Serialization;

namespace Zer0.Tv.Infrastructure.Shared
{
    internal class PaginationDTO
    {
        [JsonPropertyName("cursor")]
        public string Cursor { get; set; }
    }
}
