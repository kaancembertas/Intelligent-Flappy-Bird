import { NeuralNetwork } from '../lib/nn.js';

export default class Bird {
    constructor(ctx, brain,space,ctxWidth,ctxHeight) {
      this.ctx = ctx;
      this.x = 150;
      this.y = 150;
      this.gravity = 0;
      this.velocity = 0.1;
      this.isDead = false;
      this.age = 0;
      this.fitness = 0;
      this.space = space;
      this.ctxWidth = ctxWidth;
      this.ctxHeight = ctxHeight;
  
      //input
      //[bird.x, bird.y]
      //[closestPipe.x,closestPipe.y]
      //[closestPipe.x, closestPipe.y + closestPipe.height]
      if (brain) {
        this.brain = brain.copy();
        this.mutate();
      }
      else {
        this.brain = new NeuralNetwork(5, 10, 2);
      }
    }
  
    draw = () => {
      this.ctx.fillStyle = 'red';
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  
    update = (pipeX, spaceStartY, spaceEndY) => {
      this.age += 1;
      this.gravity += this.velocity;
      this.gravity = Math.min(4, this.gravity);
      this.y += this.gravity;
  
  
      this.think(pipeX, spaceStartY, spaceEndY);
      this.draw();
  
    }
  
    jump = () => {
      this.gravity = -3.5;
    }
  
    think = (pipeX, spaceStartY, spaceEndY) => {
 
      const inputs = [
        (pipeX - this.x) / this.ctxWidth,
        (pipeX - this.x + this.space) / this.ctxWidth,
        (this.y - spaceStartY) / this.ctxHeight,
        (spaceEndY - this.y) / this.ctxHeight,
        this.gravity / 4
  
  
      ];
      //range 0,1
      const output = this.brain.predict(inputs);
  
      if (output[0] < 0.5) {
        this.jump();
      }
    }
  
    mutate = () => {
      this.brain.mutate((x) => {
        if (Math.random() < 0.1) {
          const offset = Math.random() * 0.5;
          return x + offset;
        }
        return x;
      });
    }
  
  
  }