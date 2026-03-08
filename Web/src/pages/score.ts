import ScoreRepository from "../services/ScoreRepository.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";
import router from "./router.ts";

export function renderScorePage(container: HTMLElement) {
  const bestJumpMs = ScoreRepository.getScore("bestJump", "record");
  const bestJumpSec = (bestJumpMs / 1000).toFixed(2);

  container.innerHTML = `
    <main>
      <section class="score">
        <div class="score-content">
            <h1 class="title">Miglior punteggio</h1>
            <div class="score-second-row">
                <div class="score-table">
                    <div class="score-row">
                        <div class="score-label">Tempo in vita:</div>
                        <div class="score-value">${ScoreRepository.getScore("aliveTime", "record")} s</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Glow raccolti:</div>
                        <div class="score-value">${ScoreRepository.getScore("glows", "record")}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Durata salto più lungo:</div>
                        <div class="score-value">${bestJumpSec} s</div>
                    </div>
                </div>
                <nav class="menu-actions">
                    <a href="/" class="button primary" data-navigo>Indietro</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

  router.updatePageLinks();

  const section = container.querySelector<HTMLElement>(".score")!;
  attachSpriteBackground(section, 1, 1);
}
