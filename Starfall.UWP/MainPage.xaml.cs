using FbonizziMonoGameUWP;
using MonoGame.Framework;
using Starfall.MonogameBootstrap;
using System;
using System.Globalization;
using Windows.Foundation;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace Starfall.UWP
{
    public sealed partial class MainPage : Page
    {
        private const int _width = 1024;
        private const int _height = 614;

        private readonly StarfallBootstrap _game;

        public MainPage()
        {
            InitializeComponent();

            ApplicationView.PreferredLaunchViewSize = new Size(_width, _height);
            ApplicationView.PreferredLaunchWindowingMode = ApplicationViewWindowingMode.PreferredLaunchViewSize;

            var launchArguments = string.Empty;

            _game = XamlGame<StarfallBootstrap>.Create(
            gameConstructor: () => new StarfallBootstrap(
                textFileAssetsLoader: new UWPTextFileImporter(),
                settingsRepository: new UWPSettingsRepository(),
                webPageOpener: new UWPWebPageOpener(Window.Current),
                gameCulture: CultureInfo.CurrentCulture,
                isPc: true,
                isFullScreen: false,
                rateMeUri: new Uri("https://www.microsoft.com/store/apps/9MW4T75WZR28"),
                deviceWidth: _width, deviceHeight: _height),
            window: Window.Current.CoreWindow,
            launchParameters: launchArguments,
            swapChainPanel: swapChainPanel);

            Window.Current.VisibilityChanged += Current_VisibilityChanged;
        }

        private void Current_VisibilityChanged(object sender, Windows.UI.Core.VisibilityChangedEventArgs e)
        {
            if (!e.Visible)
            {
                _game.Pause();
            }
            else
            {
                _game.Resume();
            }
        }
   
    }
}
