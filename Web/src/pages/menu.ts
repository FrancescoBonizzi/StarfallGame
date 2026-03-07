import router from './router.ts';
import {SoundManagerInstance} from "../services/SoundInstance.ts";

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
            </nav>
        </div>
    </section>
</main>
`;

    router.updatePageLinks();
    SoundManagerInstance.playMenuSoundTrack();
}
