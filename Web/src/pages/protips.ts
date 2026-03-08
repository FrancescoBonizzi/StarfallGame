import router from './router.ts';

const protips = [
    "Raccogli le luci per poter saltare!",
    "Premi in qualunque punto dello schermo per saltare!",
    "Premi ripetutamente per continuare a saltare fin quando hai le luci!",
    "Evita i buchi neri!",
    "Raccogli tutte le luci che puoi!",
    "Cerca di sopravvivere per il maggior tempo possibile!",
    "Rimani in salto il maggior tempo possibile!",
];

export function renderProtipsPage(container: HTMLElement) {
    const randomTip = protips[Math.floor(Math.random() * protips.length)] ?? protips[0]!;

    container.innerHTML = `
    <main>
      <section class="protips">
        <div class="score-content">
            <h1 class="title">Suggerimento</h1>
            <div class="score-second-row">
                <div class="score-table">
                    <div class="score-row">
                        <div class="score-label">${randomTip}</div>
                    </div>
                </div>
                <nav class="menu-actions">
                    <a href="/" class="button primary" data-navigo>MENU</a>
                </nav>
            </div>
        </div>
      </section>
    </main>
  `;

    router.updatePageLinks();

    setTimeout(() => {
        router.navigate('/');
    }, 5000);
}
