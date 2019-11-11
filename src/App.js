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
const TOTAL_BIRDS = 2000;
const GAME_SPEED = 1;

class Bird {
  constructor(ctx,brain) {
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
    if(brain)
    {
      this.brain = brain.copy();
      this.mutate();
    }
    else
    {
       this.brain = new NeuralNetwork(6,10,2);
    }
  }

  draw = () => {
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  update = (pipeX,spaceStartY,spaceEndY) => {
    this.age+=1;
    this.gravity += this.velocity;
    this.gravity = Math.min(4, this.gravity);
    this.y += this.gravity;
    
   
    this.think(pipeX,spaceStartY,spaceEndY);
    this.draw();
   
  }

  jump = () => {
    this.gravity = -3.5;
  }

  think = (pipeX,spaceStartY,spaceEndY) => {
    //input
    //[bird.x, bird.y]
    //[closestPipe.x,closestPipe.y]
    //[closestPipe.x, closestPipe.y + closestPipe.height]

    const inputs = [
      (pipeX-this.x)/WIDTH,
      (pipeX-this.x+SPACE)/WIDTH,
      this.y/HEIGHT,
      spaceStartY/HEIGHT,
      spaceEndY/HEIGHT,
      this.gravity/4

            
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
        const offset = Math.random()*0.5;
        return x + offset;
      }
      return x;
    });
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
    this.draw();
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
    this.startGame();
  }

  startGame = () => {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.setState({frameCount:0});
    if(this.loop) clearInterval(this.loop);
    
    this.birds = this.generateBirds();
    this.deadBirds = [];
    this.pipes = [];
    this.generatePipe();

    this.loop = setInterval(this.GameLoop, 1000 / (FPS*GAME_SPEED));
  }

  onKeyDown = (e) => {

    if (e.code === "Space") {
      this.birds.forEach(bird => {
        bird.jump();
      });
    }
  }

  generateBirds = () =>{
    const birds = [];
    for(let i = 0;i<TOTAL_BIRDS;i++) {
    const brain = this.deadBirds.length ? this.pickOne().brain : null;
    const newBird = new Bird(this.ctx, brain); 
    birds.push(newBird);
    }
    return birds;
  }

  generatePipe = () =>
  {
    let pipe1 = new Pipe(this.ctx, null);
    let pipe2 = new Pipe(this.ctx, pipe1.height);
    this.pipes.push(pipe1);
    this.pipes.push(pipe2);
  }

  getNextPipe = (bird) =>{
    for(let i=0;i<this.pipes.length;i++)
    {
      if(this.pipes[i].x > bird.x)
      {
        return this.pipes[i];
      }
    }
  }

  

  GameLoop = () => {
    this.setState({ frameCount: this.state.frameCount + 1 }, () => {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      if (this.state.frameCount % (FPS * NEW_PIPE_TIME) === 0) {
        this.generatePipe();
      }

      //update pipe positions
      this.pipes.forEach(pipe => pipe.update());      

      //update bird positions
     
      this.birds.forEach(bird => {
        const nextPipe = this.getNextPipe(bird);
        const pipeY = nextPipe.y+nextPipe.height;
        bird.update(nextPipe.x,pipeY,pipeY+SPACE);
      });

      //delete off-screen pipes
      this.pipes = this.pipes.filter(pipe => !pipe.isDead);
      
      //delete dead birds
      this.updateBirdDeadState();
      this.deadBirds.push(...this.birds.filter(bird => bird.isDead));
      this.birds = this.birds.filter(bird => !bird.isDead);
      //console.log(this.birds.length);
      if(this.birds.length===0)
      {
        let totalAge = 0;
        //Calculate cumutlative age
        this.deadBirds.forEach(deadBird => totalAge+=deadBird.age);

        //Calculate fitness raio
        this.deadBirds.forEach(deadBird => deadBird.fitness=deadBird.age/totalAge);       
       
        
        //TODO

        this.startGame();

      }

    });

  }

  pickOne = () => {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
      r -= this.deadBirds[index].fitness;
      index += 1;
    }
    index -= 1;
    return this.deadBirds[index];
  }

  updateBirdDeadState = () => {
   
    this.birds.forEach(bird => {
      if (bird.y < 0 || bird.y > HEIGHT) bird.isDead = true;
      this.pipes.forEach(pipe => {

        

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
