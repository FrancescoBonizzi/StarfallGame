using Android.App;
using Android.Content.PM;
using Android.Views;
using FbonizziMonoGame.PlatformAbstractions;
using FbonizziMonoGameAndroid;
using Starfall.MonogameBootstrap;
using System;
using System.Globalization;

namespace Starfall.Android
{
    [Activity(
        Label = "Starfall",
        Icon = "@drawable/icon",
        MainLauncher = true,
        AlwaysRetainTaskState = true,
        LaunchMode = LaunchMode.SingleInstance,
        ScreenOrientation = ScreenOrientation.Landscape,
        ConfigurationChanges = ConfigChanges.Orientation |
        ConfigChanges.KeyboardHidden |
        ConfigChanges.Keyboard)]
    public class MainActivity : FbonizziMonoGameActivity
    {
        private StarfallBootstrap _game;

        protected override IFbonizziGame StartGame(CultureInfo cultureInfo)
        {
            _game = new StarfallBootstrap(
                textFileAssetsLoader: new AndroidTextFileImporter(Assets),
                settingsRepository: new AndroidSettingsRepository(this),
                webPageOpener: new AndroidWebPageOpener(this),
                gameCulture: cultureInfo,
                isFullScreen: true,
                rateMeUri: new Uri("market://details?id=com.francescobonizzi.starfall"));

            _game.Run();
            SetContentView((View)_game.Services.GetService(typeof(View)));

            return _game;
        }

        protected override void DisposeGame()
        {
            _game?.Dispose();
            _game = null;
        }
    }
}