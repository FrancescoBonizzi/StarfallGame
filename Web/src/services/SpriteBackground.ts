import { AssetsRoot } from "../assets/AssetsLoader.ts";

export function attachSpriteBackground(
    section: HTMLElement,
    sx: number, sy: number,
    sw: number = 800, sh: number = 480
): void {
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;' +
        'object-fit:cover;z-index:0;pointer-events:none;';
    section.prepend(canvas);

    const img = new Image();
    img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    };
    img.src = `${AssetsRoot}/images/spriteSheets/others.png`;
}
