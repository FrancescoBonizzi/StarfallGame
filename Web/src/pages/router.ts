import Navigo from 'navigo';
import {renderMenuPage} from './menu.ts';
import {renderScorePage} from './score.ts';
import {initGame} from './gamebootstrap.ts';
import {renderGameOverPage} from "./gameover.ts";
import {renderIncipitPage} from "./incipit.ts";
import {renderProtipsPage} from "./protips.ts";

const router = new Navigo('/', {
    hash: true,
});

export function initializeRouter() {
    const appElement = document.getElementById('app');

    if (!appElement) {
        console.error('Elemento #app non trovato!');
        return router;
    }

    router
        .on(() => renderMenuPage(appElement))
        .on('/', () => renderMenuPage(appElement!))
        .on(
            '/game',
            () => initGame(document.getElementById('app')!),
            {
                leave: (done) => {
                    import('./gamebootstrap').then(m => {
                        m.destroyGame?.();
                        done();
                    }).catch(() => done());
                }
            })
        .on('/scores', () => renderScorePage(appElement!))
        .on('/gameover', () => renderGameOverPage(appElement!))
        .on('/incipit', () => renderIncipitPage(appElement!))
        .on('/protips', () => renderProtipsPage(appElement!))
        .notFound(() => renderMenuPage(appElement!))
        .resolve();

    router.updatePageLinks();

    return router;
}

export default router;
