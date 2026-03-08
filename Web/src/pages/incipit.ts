import router from './router.ts';
import { SoundManagerInstance } from "../services/SoundInstance.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";

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

let animationId = 0;

export function renderIncipitPage(container: HTMLElement) {
    const myId = ++animationId;

    container.innerHTML = `
    <main>
      <section class="incipit" id="incipit-section">
        <div class="incipit-content">
          <div class="incipit-texts">
            ${incipitTexts.map(t => `<p class="incipit-text">${t}</p>`).join('\n')}
          </div>
          <nav class="menu-actions">
            <a href="/" class="button primary" data-navigo>Indietro</a>
          </nav>
        </div>
      </section>
    </main>`;

    const section = container.querySelector<HTMLElement>('.incipit')!;
    attachSpriteBackground(section, 803, 1);

    router.updatePageLinks();
    SoundManagerInstance.playIncipitSoundTrack();

    const textEls = Array.from(
        container.querySelectorAll<HTMLElement>('.incipit-text')
    );

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const fadeInMs = 2000;
    const holdMs = 2000;
    const finalPauseMs = 2000;

    (async () => {
        for (let i = 0; i < textEls.length; i++) {
            if (animationId !== myId) return;

        // Reveal each line and keep it visible for a cumulative poetic effect.
            textEls[i]!.style.opacity = '1';

        await sleep(fadeInMs + holdMs);
        }

        if (animationId !== myId) return;
      await sleep(finalPauseMs);
        if (animationId !== myId) return;
        router.navigate('/');
    })();
}
