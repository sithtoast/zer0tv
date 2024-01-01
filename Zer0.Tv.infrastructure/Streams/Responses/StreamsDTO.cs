using System.Text.Json.Serialization;
using Zer0.Tv.Infrastructure.Shared;

namespace Zer0.Tv.Infrastructure.Streams.Responses
{
    internal class StreamsDTO
    {
        [JsonPropertyName("data")]
        public IEnumerable<StreamDTO> Streams { get; set; }

        [JsonPropertyName("pagination")]
        public PaginationDTO Pagination { get; set; }
    }
}
