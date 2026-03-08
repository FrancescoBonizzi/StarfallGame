import { unlockHowler, isAudioUnlocked } from "../services/AudioUnlocker.ts";
import { SoundManagerInstance } from "../services/SoundInstance.ts";
import { attachSpriteBackground } from "../services/SpriteBackground.ts";
import router from "./router.ts";

export function renderMenuPage(container: HTMLElement) {
  container.innerHTML = `
<main>
    <section class="menu">
        <div class="menu-panel">
            <h1 class="title">Starfall</h1>
            <nav class="menu-actions">
                <a href="/game" class="button primary" data-navigo>Gioca</a>
                <a href="/incipit" class="button" data-navigo>Incipit</a>
                <a href="/scores" class="button" data-navigo>Punteggio</a>
                <a href="https://imaginesoftware.it/open-source-projects/starfall"
                   class="button" target="_blank" rel="noopener">About</a>
                <a class="button" id="audio-button">Attiva audio</a>
            </nav>
        </div>
    </section>
</main>`;

  router.updatePageLinks();

  const section = container.querySelector<HTMLElement>(".menu")!;
  attachSpriteBackground(section, 1, 797);

  const audioButton =
    container.querySelector<HTMLAnchorElement>("#audio-button");
  if (audioButton) {
    if (isAudioUnlocked()) {
      audioButton.textContent = "Audio attivo ✓";
      audioButton.classList.add("disabled");
    } else {
      audioButton.addEventListener("click", async () => {
        await unlockHowler();
        SoundManagerInstance.playMenuSoundTrack();
        audioButton.textContent = "Audio attivo ✓";
        audioButton.classList.add("disabled");
      });
    }
  }

  SoundManagerInstance.playMenuSoundTrack();
}
