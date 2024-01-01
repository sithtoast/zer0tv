using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using Zer0.Tv.Domain;
using Zer0.Tv.Infrastructure.Streams;

namespace Zer0.Tv.Components
{
    public partial class StreamsGrid : ComponentBase
    {
        [Inject]
        TwitchStreamsClient TwitchStreamsClient { get; set; }

        [CascadingParameter]
        private Task<AuthenticationState>? AuthenticationState { get; set; }

        [Parameter]
        public string GameId { get; set; }

        public IEnumerable<StreamModel> Streams { get; set; }

        protected override async Task OnParametersSetAsync()
        {
            if (AuthenticationState is not null)
            {
                var authState = await AuthenticationState;
                var user = authState?.User;

                if (user?.Identity is not null && user.Identity.IsAuthenticated)
                {
                    if (!string.IsNullOrWhiteSpace(GameId))
                    {
                        Streams = await TwitchStreamsClient.GetStreams(GameId);
                    }
                }
            }

            await base.OnInitializedAsync();
        }
    }
}
