using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using MudBlazor.Services;
using Zer0.Tv.Auth;
using Zer0.Tv.Core.Auth;
using Zer0.Tv.Infrastructure.Categories;
using Zer0.Tv.Infrastructure.Streams;
using Zer0.Tv.ServiceRegistration.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var config = builder.Configuration;
var twitchOptions = config.GetSection(nameof(TwitchOptions)).Get<TwitchOptions>();

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

builder.Services.AddHttpClient<TwitchCategoriesClient>(
    client =>
    {
        // Set the base address of the typed client.
        client.BaseAddress = new Uri(twitchOptions.BaseUrl);
        client.DefaultRequestHeaders.Add("Client-Id", twitchOptions.ClientId);
        client.DefaultRequestHeaders.Add("Accepts", "*/*");
    });

builder.Services.AddHttpClient<TwitchStreamsClient>(
    client =>
    {
        // Set the base address of the typed client.
        client.BaseAddress = new Uri(twitchOptions.BaseUrl);
        client.DefaultRequestHeaders.Add("Client-Id", twitchOptions.ClientId);
        client.DefaultRequestHeaders.Add("Accepts", "*/*");
    });

builder.Services.AddMudServices();

builder.Services
    .AddAuthentication(opt =>
    {
        opt.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        opt.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect("oidc", opt =>
    {
        opt.Authority = twitchOptions.AuthUrl;
        opt.ClientId = twitchOptions.ClientId;
        opt.ClientSecret = twitchOptions.ClientSecret;
        opt.ResponseType = "code";
        opt.SaveTokens = true;
        opt.UseTokenLifetime = true;
        opt.Scope.Add("openid");
        opt.Scope.Remove("profile");
        opt.TokenValidationParameters = new TokenValidationParameters { NameClaimType = "preferred_username" };
        opt.CallbackPath = "/auth/twitch/callback/";
        opt.Events = new OpenIdConnectEvents
        {
            OnAccessDenied = context =>
            {
                context.HandleResponse();
                context.Response.Redirect("/");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<ITokenProvider, TokenProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
