using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using MudBlazor;
using Zer0.Tv.Domain;
using Zer0.Tv.Infrastructure.Categories;

namespace Zer0.Tv.Components
{
    public partial class TagCloud : ComponentBase
    {
        [Inject]
        public TwitchCategoriesClient TwitchClient { get; set; }

        [CascadingParameter]
        private Task<AuthenticationState>? AuthenticationState { get; set; }

        [CascadingParameter]
        private string SearchText { get; set; }

        [Parameter]
        public EventCallback<string> GameChanged { get; set; }

        private List<Category> DefaultCategories { get; set; } = new List<Category>();
        private List<Category> Categories { get; set; } = new List<Category>();

        protected override async Task OnInitializedAsync()
        {
            if (AuthenticationState is not null)
            {
                var authState = await AuthenticationState;
                var user = authState?.User;

                if (user?.Identity is not null && user.Identity.IsAuthenticated)
                {
                    DefaultCategories = (await TwitchClient.GetCategoriesAsync()).ToList();
                    Categories = DefaultCategories;
                }
            }
        }

        protected override async Task OnParametersSetAsync()
        {
            if (AuthenticationState is not null)
            {
                var authState = await AuthenticationState;
                var user = authState?.User;

                if (user?.Identity is not null && user.Identity.IsAuthenticated)
                {
                    var categories = !string.IsNullOrWhiteSpace(SearchText)
                        ? TwitchClient.SearchCategoriesAsync(SearchText)
                        : Task.FromResult(DefaultCategories.AsEnumerable());

                    Categories = (await categories).ToList();
                }
            }
        }

        private Task OnGameChanged(MudChip chip)
        {
            return GameChanged.InvokeAsync(chip.Value as string);
        }
    }
}
