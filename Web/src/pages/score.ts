import router from './router.ts';
import ScoreRepository from "../services/ScoreRepository.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";

export function renderScorePage(container: HTMLElement) {
    container.innerHTML = `
    <main>
      <section class="score">
        <div class="score-content">
            <h1 class="title">Record</h1>
            <div class="score-second-row">
                <div class="score-table">
                    <div class="score-row">
                        <div class="score-label">Miglior tempo:</div>
                        <div class="score-value">${ScoreRepository.getScore('aliveTime', 'record')}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Glow raccolti:</div>
                        <div class="score-value">${ScoreRepository.getScore('glows', 'record')}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Miglior salto:</div>
                        <div class="score-value">${ScoreRepository.getScore('bestJump', 'record')}</div>
                    </div>
                </div>
                <nav class="menu-actions">
                    <a href="/" class="button primary" data-navigo>INDIETRO</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

    router.updatePageLinks();

    const section = container.querySelector<HTMLElement>('.score')!;
    attachSpriteBackground(section, 1, 1);
}
