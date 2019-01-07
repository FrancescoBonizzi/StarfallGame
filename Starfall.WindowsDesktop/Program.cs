using FbonizziMonoGameWindowsDesktop;
using Starfall.MonogameBootstrap;
using System;
using System.Globalization;

namespace Starfall.Windows
{
    public static class Program
    {
        [STAThread]
        static void Main()
        {
            using (var game = new StarfallBootstrap(
                textFileAssetsLoader: new WindowsTextFileImporter(),
                settingsRepository: new FileWindowsSettingsRepository("starfall-settings.txt"),
                webPageOpener: new WindowsWebSiteOpener(),
                gameCulture: CultureInfo.CreateSpecificCulture("it-IT"),
                isPc: true,
                isFullScreen: false,
                rateMeUri: new Uri("https://www.fbonizzi.it"),
                deviceWidth: 1024, deviceHeight: 614))
            {
                game.Run();
            }
        }
    }
}
