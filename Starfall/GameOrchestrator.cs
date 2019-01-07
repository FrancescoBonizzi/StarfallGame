﻿using FbonizziMonoGame.Drawing;
using FbonizziMonoGame.Drawing.Abstractions;
using FbonizziMonoGame.PlatformAbstractions;
using FbonizziMonoGame.StringsLocalization.Abstractions;
using FbonizziMonoGame.TransformationObjects;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Starfall.About;
using Starfall.Assets;
using Starfall.Menu;
using System;

namespace Starfall
{
    public class GameOrchestrator
    {
        public enum GameStates
        {
            Menu,
            Incipit,
            Playing,
            GameOver,
            Score,
            Protip
        }

        private GameStates _currentState;

        private readonly Func<StarfallGame> _gameFactory;
        private StarfallGame _game;

        private readonly Func<MainMenuPage> _menuFactory;
        private MainMenuPage _menu;

        private readonly Func<IncipitPage> _incipitFactory;
        private IncipitPage _incipit;

        private readonly Func<ScorePage> _scoreFactory;
        private ScorePage _score;

        private ProtipsShower _proTipsShower;
        
        private readonly AssetsLoader _assets;
        private readonly ISettingsRepository _settingsRepository;
        private readonly IWebPageOpener _webPageOpener;
        private readonly ILocalizedStringsRepository _localizedStringsRepository;
        private readonly GraphicsDevice _graphicsDevice;
        private readonly Uri _aboutUri = new Uri("https://www.fbonizzi.it");

        private GameOverPage _gameOver;

        private FadeObject _stateTransition;
        private Action _afterTransitionAction;

        private RenderTarget2D _renderTarget;
        private readonly IScreenTransformationMatrixProvider _matrixScaleProvider;

        public bool ShouldEndApplication { get; private set; }
        public bool IsPaused { get; private set; } = false;

        public event EventHandler GameOver;
        private readonly TimeSpan _fadeDuration = TimeSpan.FromMilliseconds(800);

        public GameOrchestrator(
            Func<StarfallGame> gameFactory,
            Func<MainMenuPage> menuFactory,
            Func<IncipitPage> incipitFactory,
            Func<ScorePage> scoreFactory,
            ProtipsShower proTipsShower,
            GraphicsDevice graphicsDevice,
            AssetsLoader assets,
            ISettingsRepository settingsRepository,
            IScreenTransformationMatrixProvider matrixScaleProvider,
            IWebPageOpener webPageOpener,
            ILocalizedStringsRepository localizedStringsRepository)
        {
            _gameFactory = gameFactory ?? throw new ArgumentNullException(nameof(gameFactory));
            _menuFactory = menuFactory ?? throw new ArgumentNullException(nameof(menuFactory));
            _incipitFactory = incipitFactory ?? throw new ArgumentNullException(nameof(incipitFactory));
            _scoreFactory = scoreFactory ?? throw new ArgumentNullException(nameof(scoreFactory));
            _proTipsShower = proTipsShower ?? throw new ArgumentNullException(nameof(proTipsShower));
            _webPageOpener = webPageOpener ?? throw new ArgumentNullException(nameof(webPageOpener));
            _localizedStringsRepository = localizedStringsRepository ?? throw new ArgumentNullException(nameof(localizedStringsRepository));
            _graphicsDevice = graphicsDevice ?? throw new ArgumentNullException(nameof(graphicsDevice));

            _assets = assets ?? throw new ArgumentNullException(nameof(assets));
            _settingsRepository = settingsRepository;

            _matrixScaleProvider = matrixScaleProvider ?? throw new ArgumentNullException(nameof(matrixScaleProvider));
            if (_matrixScaleProvider is DynamicScalingMatrixProvider)
            {
                (_matrixScaleProvider as DynamicScalingMatrixProvider).ScaleMatrixChanged += GameOrchestrator_ScaleMatrixChanged;
            }
            RegenerateRenderTarget();

            ShouldEndApplication = false;

            _stateTransition = new FadeObject(_fadeDuration, Color.White);
            _stateTransition.FadeOutCompleted += _stateTransition_FadeOutCompleted;
        }

        private void GameOrchestrator_ScaleMatrixChanged(object sender, EventArgs e)
            => RegenerateRenderTarget();

        public void Start()
        {
            _currentState = GameStates.Menu;
            _menu = _menuFactory();
            _stateTransition.FadeIn();
        }

        public void RegenerateRenderTarget()
        {
            _renderTarget = new RenderTarget2D(
                _graphicsDevice,
                _matrixScaleProvider.RealScreenWidth,
                _matrixScaleProvider.RealScreenHeight);
        }

        private void _stateTransition_FadeOutCompleted(object sender, EventArgs e)
            => _afterTransitionAction();

        public void SetScoreState()
        {
            if (_currentState == GameStates.Score)
                return;

            if (_stateTransition.IsFading)
                return;

            ShouldEndApplication = false;
            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    _currentState = GameStates.Score;
                    _incipit = null;
                    _game = null;
                    _menu = null;
                    _score = _scoreFactory();
                });
        }

        public void SetProtipGameState()
        {
            if (_currentState == GameStates.Protip)
                return;

            if (_stateTransition.IsFading)
                return;

            ShouldEndApplication = false;
            _proTipsShower.NextProtip();

            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    _currentState = GameStates.Protip;
                    _incipit = null;
                    _game = null;
                    _menu = null;
                    _score = null;
                });
        }

        public void SetMenuState()
        {
            if (_currentState == GameStates.Menu)
                return;

            if (_stateTransition.IsFading)
                return;

            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    if (_currentState == GameStates.Playing && _game.IsGameOver)
                    {
                        // Significa che sono uscito dal gioco
                        // perché ho perso
                        GameOver?.Invoke(this, EventArgs.Empty);
                    }

                    _currentState = GameStates.Menu;
                    _game = null;
                    _incipit = null;
                    _score = null;
                    _menu = _menuFactory();
                });
        }

        public void SetAboutState()
            => _webPageOpener.OpenWebpage(_aboutUri);

        public void SetGameState()
        {
            if (_currentState == GameStates.Playing)
                return;

            if (_stateTransition.IsFading)
                return;

            ShouldEndApplication = false;
            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    _currentState = GameStates.Playing;
                    _game = _gameFactory();
                    _incipit = null;
                    _menu = null;
                    _score = null;
                });
        }

        public void SetIncipitState()
        {
            if (_currentState == GameStates.Incipit)
                return;

            if (_stateTransition.IsFading)
                return;

            ShouldEndApplication = false;
            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    _currentState = GameStates.Incipit;
                    _game = null;
                    _incipit = _incipitFactory();
                    _menu = null;
                    _score = null;
                });
        }

        public void SetGameOverState(
            TimeSpan? thisGameBestJump,
            TimeSpan thisGameAliveTime,
            int thisGameNumberOfGlows)
        {
            if (_currentState == GameStates.GameOver)
                return;

            if (_stateTransition.IsFading)
                return;

            ShouldEndApplication = false;
            _stateTransition.FadeOut();
            _afterTransitionAction = new Action(
                () =>
                {
                    _stateTransition.FadeIn();

                    _currentState = GameStates.GameOver;
                    _game = null;
                    _menu = null;
                    _score = null;
                    _gameOver = new GameOverPage(
                        _matrixScaleProvider,
                        _assets,
                        _settingsRepository,
                        thisGameBestJump,
                        thisGameAliveTime,
                        thisGameNumberOfGlows,
                        _localizedStringsRepository);
                });
        }

        public void HandleInput(Vector2? touchLocation = null)
        {
            switch (_currentState)
            {
                case GameStates.Menu:
                    if (touchLocation == null)
                        return;

                    _menu.HandleInput(touchLocation.Value, this);
                    break;

                case GameStates.Incipit:
                    _incipit.HandleInput(this);
                    break;

                case GameStates.Playing:
                    _game.HandleInput();
                    break;

                case GameStates.GameOver:
                    _gameOver.HandleInput(this);
                    break;

                case GameStates.Protip:
                    SetMenuState();
                    break;

                case GameStates.Score:
                    SetMenuState();
                    break;
            }
        }

        public void Update(TimeSpan elapsed)
        {
            if (IsPaused)
                return;

            if (_stateTransition.IsFading)
            {
                _stateTransition.Update(elapsed);
            }

            switch (_currentState)
            {
                case GameStates.Menu:
                    _menu.Update(elapsed);
                    break;

                case GameStates.Incipit:
                    _incipit.Update(elapsed);
                    break;

                case GameStates.Playing:
                    _game.Update(elapsed);
                    break;

                case GameStates.GameOver:
                    _gameOver.Update(elapsed);
                    break;

                case GameStates.Score:
                    _score.Update(elapsed);
                    break;
            }

        }

        public void Resume()
        {
            _game?.Resume();
            IsPaused = false;
        }

        public void Pause()
        {
            _game?.Pause();
            IsPaused = true;
        }

        public void TogglePause()
        {
            if (IsPaused)
                Resume();
            else Pause();
        }

        public void Back()
        {
            switch (_currentState)
            {
                case GameStates.Menu:
                    ShouldEndApplication = true;
                    break;

                case GameStates.Incipit:
                    _incipit.StopMusic();
                    SetMenuState();
                    break;

                case GameStates.Playing:
                    _game.StopMusic();
                    SetMenuState();
                    break;

                case GameStates.GameOver:
                    SetProtipGameState();
                    break;

                case GameStates.Protip:
                    SetMenuState();
                    break;

                case GameStates.Score:
                    SetMenuState();
                    break;
            }
        }

        public void Draw(SpriteBatch spriteBatch, GraphicsDevice graphics)
        {
            if (IsPaused)
                return;

            // Disegno tutto su un render target...
            graphics.SetRenderTarget(_renderTarget);
            graphics.Clear(Color.Black);

            switch (_currentState)
            {
                case GameStates.Menu:
                    _menu.Draw(spriteBatch);
                    break;

                case GameStates.Incipit:
                    _incipit.Draw(spriteBatch);
                    break;

                case GameStates.Playing:
                    _game.Draw(spriteBatch);
                    break;

                case GameStates.GameOver:
                    _gameOver.Draw(spriteBatch);
                    break;

                case GameStates.Protip:
                    _proTipsShower.Draw(spriteBatch, _matrixScaleProvider.ScaleMatrix);
                    break;

                case GameStates.Score:
                    _score.Draw(spriteBatch);
                    break;
            }

            // ...per poter fare il fade dei vari componenti in modo indipendente
            graphics.SetRenderTarget(null);
            graphics.Clear(Color.Black);
            spriteBatch.Begin();
            spriteBatch.Draw(_renderTarget, Vector2.Zero, _stateTransition.OverlayColor);
            spriteBatch.End();
        }

    }
}
