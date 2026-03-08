import ScoreRepository from "../services/ScoreRepository.ts";
import { SoundManagerInstance } from "../services/SoundInstance.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";
import router from "./router.ts";

export function renderGameOverPage(container: HTMLElement) {
  const bestJumpMs = ScoreRepository.getScore("bestJump", "gameover");
  const bestJumpSec = (bestJumpMs / 1000).toFixed(2);

  container.innerHTML = `
    <main>
      <section class="gameover">
        <div class="score-content">
            <h1 class="title">Game over</h1>
            <div class="score-second-row">
                <div class="score-table">
                    <div class="score-row">
                        <div class="score-label">Tempo in vita:</div>
                        <div class="score-value">${ScoreRepository.getScore("aliveTime", "gameover")} s</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Glow raccolti:</div>
                        <div class="score-value">${ScoreRepository.getScore("glows", "gameover")}</div>
                    </div>
                    <div class="score-row">
                        <div class="score-label">Durata salto più lungo:</div>
                        <div class="score-value">${bestJumpSec} s</div>
                    </div>
                </div>
                <nav class="menu-actions">
                    <a href="/" class="button primary" data-navigo>Menu</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

  router.updatePageLinks();

  const section = container.querySelector<HTMLElement>(".gameover")!;
  attachSpriteBackground(section, 1, 1);

  SoundManagerInstance.playMenuSoundTrack();
}
