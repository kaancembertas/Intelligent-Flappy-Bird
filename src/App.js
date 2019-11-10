import React, { Component } from 'react';
import './App.css';
import { NeuralNetwork } from './lib/nn';

const WIDTH = 800;
const HEIGHT = 500;
const PIPE_WIDTH = 60;
const SPACE = 120;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 460;
const FPS = 120;
const NEW_PIPE_TIME = 3; //Seconds
const TOTAL_BIRDS = 100;

class Bird {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = 150;
    this.y = 150;
    this.gravity = 0;
    this.velocity = 0.1;
    this.isDead = false;
    this.age = 0;
    this.fitness = 0;

    //input
    //[bird.x, bird.y]
    //[closestPipe.x,closestPipe.y]
    //[closestPipe.x, closestPipe.y + closestPipe.height]
    this.brain = new NeuralNetwork(2, 5, 1);
  }

  draw = () => {
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  update = () => {
    this.age+=1;
    this.gravity += this.velocity;
    this.gravity = Math.min(4, this.gravity);
    this.y += this.gravity;
    
    if(this.y>HEIGHT) this.y = HEIGHT;
    else if(this.y<0) this.y = 0;
    this.think();

   
  }

  jump = () => {
    this.gravity = -3.5;
  }

  think = () => {
    //input
    //[bird.x, bird.y]
    //[closestPipe.x,closestPipe.y]
    //[closestPipe.x, closestPipe.y + closestPipe.height]

    const inputs = [
      this.x/WIDTH,
      this.y/HEIGHT
    ];
    //range 0,1
    const output = this.brain.predict(inputs);
    
    if (output[0] < 0.5) {
      this.jump();
    }
  }


}

class Pipe {
  constructor(ctx, firstHeight) {
    this.ctx = ctx;
    this.x = WIDTH;
    this.y = firstHeight ? firstHeight + SPACE : 0;
    this.isDead = false;
    this.width = PIPE_WIDTH;


    this.height = firstHeight ? HEIGHT - firstHeight - SPACE : Math.random() * (MAX_HEIGHT - SPACE);

    if (this.height < MIN_HEIGHT) this.height = MIN_HEIGHT;
  }

  update = () => {
    this.x = this.x - 1;
    if ((this.x + PIPE_WIDTH) < 0)
      this.isDead = true;
  }

  draw = () => {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.x, this.y, PIPE_WIDTH, this.height);
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      frameCount: 0
    }
    this.pipes = [];
    this.birds = [];
    this.deadBirds = [];
  }

  componentDidMount = () => {
    //document.addEventListener('keydown', this.onKeyDown);
    this.ctx = this.canvasRef.current.getContext("2d");
    
    for(let i = 0;i<TOTAL_BIRDS;i++) this.birds.push(new Bird(this.ctx)); 

    this.loop = setInterval(this.GameLoop, 1000 / FPS);
  }

  onKeyDown = (e) => {

    if (e.code === "Space") {
      this.birds.forEach(bird => {
        bird.jump();
      });
    }
  }

  GameLoop = () => {
    this.setState({ frameCount: this.state.frameCount + 1 }, () => {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      if (this.state.frameCount % (FPS * NEW_PIPE_TIME) === 0) {
        let pipe1 = new Pipe(this.ctx, null);
        let pipe2 = new Pipe(this.ctx, pipe1.height);
        this.pipes.push(pipe1);
        this.pipes.push(pipe2);
      }

      //update pipe positions
      this.pipes.forEach(pipe => {
        pipe.update();
        pipe.draw();
      });      

      //update bird positions
      this.birds.forEach(bird => {
        bird.update();
        bird.draw();
      });

      //delete off-screen pipes
      this.pipes = this.pipes.filter(pipe => !pipe.isDead);
      
      //delete dead birds
      this.updateBirdDeadState();
      this.deadBirds.push(...this.birds.filter(bird => bird.isDead));
      this.birds = this.birds.filter(bird => !bird.isDead);

      if(this.birds.length===0)
      {
        let totalAge = 0;
        //Calculate cumutlative age
        this.deadBirds.forEach(deadBird => totalAge+=deadBird.age);

        //Calculate fitness raio
        this.deadBirds.forEach(bird => totalAge+=bird.age);
        
      }

    });

  }

  updateBirdDeadState = () => {
   
    this.birds.forEach(bird => {
      if (bird.y < 0 || bird.y > HEIGHT) bird.isDead = true;
      this.pipes.forEach(pipe => {

        //const pipeBottomRight = { x: pipe.x + pipe.width, y: pipe.y + pipe.height };

        if (bird.x >= pipe.x && bird.x <= pipe.x + pipe.width &&
          bird.y >= pipe.y && bird.y <= pipe.y + pipe.height) {
          bird.isDead = true;
        }

      });
    });
  }

  render() {
    return (
      <div className="App">
        <canvas
          ref={this.canvasRef}
          id="canvas"
          width={WIDTH}
          height={HEIGHT}
          style={{ marginTop: '10px', border: '1px solid #c3c3c3' }}>
        </canvas>
        <div>
          {this.state.frameCount}
        </div>
      </div>
    );
  }
}
export default App;
