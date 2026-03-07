import router from './router.ts';
import ScoreRepository from "../services/ScoreRepository.ts";
import { SoundManagerInstance } from "../services/SoundInstance.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";

export function renderGameOverPage(container: HTMLElement) {

    container.innerHTML = `
    <main>
      <section class="gameover">
        <div class="score-content">
            <h1 class="title">GAME OVER</h1>
            <div class="score-second-row">
                <div class="score-table">
                    <div class="score-row">
                        <div class="score-label">Tempo in vita:</div>
                        <div class="score-value">${ScoreRepository.getScore('aliveTime', 'gameover')}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Glow raccolti:</div>
                        <div class="score-value">${ScoreRepository.getScore('glows', 'gameover')}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Miglior salto:</div>
                        <div class="score-value">${ScoreRepository.getScore('bestJump', 'gameover')}</div>
                    </div>
                </div>
                <nav class="menu-actions">
                    <a href="/" class="button primary" data-navigo>MENU</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

    router.updatePageLinks();

    const section = container.querySelector<HTMLElement>('.gameover')!;
    attachSpriteBackground(section, 1, 1);

    SoundManagerInstance.playMenuSoundTrack();
}
