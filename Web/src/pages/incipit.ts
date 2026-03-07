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
            <a href="/" class="button primary" data-navigo>INDIETRO</a>
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

    (async () => {
        for (let i = 0; i < textEls.length; i++) {
            if (animationId !== myId) return;

            // Hide previous text instantly
            if (i > 0) {
                const prev = textEls[i - 1]!;
                prev.style.transition = 'none';
                prev.style.opacity = '0';
            }

            // Fade in current text
            textEls[i]!.style.opacity = '1';
            await new Promise<void>(r => setTimeout(r, 2000));
        }
        if (animationId !== myId) return;
        router.navigate('/game');
    })();
}
