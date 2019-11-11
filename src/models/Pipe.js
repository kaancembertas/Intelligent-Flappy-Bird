const PIPE_WIDTH = 100;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 460;

export default class Pipe {
    constructor(ctx, firstHeight, ctxWidth, ctxHeight, space) {
        this.ctx = ctx;
        this.x = ctxWidth;;
        this.y = firstHeight ? firstHeight + space : 0;
        this.isDead = false;
        this.width = PIPE_WIDTH;

        this.height = firstHeight ? ctxHeight - firstHeight - space : Math.random() * (MAX_HEIGHT - space);

        if (this.height < MIN_HEIGHT) this.height = MIN_HEIGHT;
    }

    update = () => {
        this.x = this.x - 1;
        if ((this.x + PIPE_WIDTH) < 0)
            this.isDead = true;
        this.draw();
    }

    draw = () => {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x, this.y, PIPE_WIDTH, this.height);
    }
}