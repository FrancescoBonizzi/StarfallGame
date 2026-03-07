import router from './router.ts';
import { SoundManagerInstance } from "../services/SoundInstance.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";
import { unlockHowler } from "../services/AudioUnlocker.ts";

export function renderMenuPage(container: HTMLElement) {
    container.innerHTML = `
<main>
    <section class="menu">
        <div class="menu-content">
            <h1 class="title">Starfall</h1>
            <nav class="menu-actions">
                <a href="/game" class="button primary" data-navigo>GIOCA</a>
                <a href="/incipit" class="button" data-navigo>STORIA</a>
                <a href="/scores" class="button" data-navigo>PUNTEGGIO</a>
                <a href="https://imaginesoftware.it/open-source-projects/starfall"
                   class="button" target="_blank" rel="noopener">ABOUT</a>
                <a class="button" id="audio-button">ATTIVA AUDIO</a>
            </nav>
        </div>
    </section>
</main>`;

    router.updatePageLinks();

    const section = container.querySelector<HTMLElement>('.menu')!;
    attachSpriteBackground(section, 1, 797);

    const audioButton = container.querySelector<HTMLAnchorElement>('#audio-button');
    if (audioButton) {
        audioButton.addEventListener('click', async () => {
            await unlockHowler();
            SoundManagerInstance.playMenuSoundTrack();
        });
    }

    SoundManagerInstance.playMenuSoundTrack();
}
