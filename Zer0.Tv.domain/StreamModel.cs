namespace Zer0.Tv.Domain
{
    public class StreamModel
    {
        public string Id { get; set; }

        public string UserId { get; set; }

        public string UserLogin { get; set; }

        public string UserName { get; set; }

        public string GameId { get; set; }

        public string GameName { get; set; }

        public string Type { get; set; }

        public string Title { get; set; }

        public string[] Tags { get; set; }

        public int ViewerCount { get; set; }

        public DateTime StartedAt { get; set; }

        public string Language { get; set; }

        public string ThumbnailUrl { get; set; }

        public object[] TagIds { get; set; }

        public bool IsMature { get; set; }
    }
}
