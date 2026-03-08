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

    (async () => {
        for (let i = 0; i < textEls.length; i++) {
            if (animationId !== myId) return;

            // Fade in current text (CSS handles the 2s transition)
            textEls[i]!.style.opacity = '1';

            // Both texts visible together for a moment
            await sleep(2500);
            if (animationId !== myId) return;

            // Fade out previous (CSS transition, not instant)
            if (i > 0) {
                textEls[i - 1]!.style.opacity = '0';
            }

            // Wait before next text
            await sleep(1500);
        }
        if (animationId !== myId) return;
        await sleep(2000);
        if (animationId !== myId) return;
        router.navigate('/');
    })();
}
