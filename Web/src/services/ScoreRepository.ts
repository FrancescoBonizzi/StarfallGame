import stringHelper from "./StringHelper.ts";

const ScorePrefix = 'starfall-score';
export type ScoreType = 'aliveTime' | 'glows' | 'bestJump';
export type ScoreSource = 'gameover' | 'record';

const makeKey = (type: ScoreType, source: ScoreSource) => `${ScorePrefix}-${source}-${type}`;

export default {
    getScore: (type: ScoreType, source: ScoreSource) => {
        // Con lo storage bloccato (navigazione privata, dati del sito vietati) getItem lancia: senza try
        // menu dei punteggi e game over non si disegnerebbero.
        try {
            return toNumberOr0(localStorage.getItem(makeKey(type, source)));
        } catch {
            return 0;
        }
    },

    setScore: (type: ScoreType, source: ScoreSource, value: number) => {
        try {
            localStorage.setItem(makeKey(type, source), value.toString());
        } catch {
            // Storage bloccato o pieno: il punteggio non si salva, la partita prosegue.
        }
    }
}

const toNumberOr0 = (value: string | null | undefined): number => {
    if (stringHelper.isNullOrWhitespace(value)) {
        return 0;
    }

    const number = Number(value);
    if (isNaN(number)) {
        return 0;
    }

    return number;
}
