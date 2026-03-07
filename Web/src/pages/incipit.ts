import router from './router.ts';
import {SoundManagerInstance} from "../services/SoundInstance.ts";

const incipitTexts = [
    "Il mio mondo: troppo buio",
    "Cercai un modo per non pensare, per non affrontare...",
    "Costruii un rifugio dentro me stessa.",
    "Cessai di sentire l'universo...",
    "Mi staccai da ogni attrazione...",
    "Un senso d'amputazione,",
    "il bruciore di un'ustione...",
    "...sono cose che dimentico.",
];

export function renderIncipitPage(container: HTMLElement) {
    container.innerHTML = `
    <main>
      <section class="incipit">
        <div class="score-content">
            <h1 class="title">Storia</h1>
            <div class="score-second-row">
                <div class="score-table">
                    ${incipitTexts.map(t => `
                    <div class="score-row">
                        <div class="score-label">${t}</div>
                    </div>`).join('')}
                </div>
                <nav class="menu-actions">
                    <a href="/game" class="button primary" data-navigo>GIOCA</a>
                    <a href="/" class="button" data-navigo>MENU</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

    router.updatePageLinks();
    SoundManagerInstance.playIncipitSoundTrack();
}
