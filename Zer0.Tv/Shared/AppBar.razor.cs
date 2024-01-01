using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;

namespace Zer0.Tv.Shared
{
    public partial class AppBar : ComponentBase
    {
        [CascadingParameter]
        private Task<AuthenticationState>? AuthenticationState { get; set; }

        [Parameter]
        public EventCallback<string> SearchTextChanged { get; set; }

        [Parameter]
        public string SearchText { get; set; }

        private string? Username { get; set; }

        protected override async Task OnInitializedAsync()
        {
            if (AuthenticationState is not null)
            {
                var authState = await AuthenticationState;
                var user = authState?.User;

                if (user?.Identity is not null && user.Identity.IsAuthenticated)
                {
                    Username = user.Identity.Name;
                }
            }
        }

        private Task OnSearchTextChanged(string text)
        {
            return SearchTextChanged.InvokeAsync(text);
        }
    }
}
