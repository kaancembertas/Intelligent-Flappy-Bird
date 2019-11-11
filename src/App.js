import React, { Component } from 'react';
import './App.css';
import {Bird,Pipe} from './models';


const WIDTH = 800;
const HEIGHT = 500;
const SPACE = 80;

const FPS = 120;
const NEW_PIPE_TIME = 3; //Seconds
const TOTAL_BIRDS = 250;

class App extends Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      frameCount: 0,
      generation: 0,
      aliveBirds: 0,
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
    this.setState({generation: this.state.generation+1});
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.setState({ frameCount: 0 });
    if (this.loop) clearInterval(this.loop);

    this.birds = this.generateBirds();
    this.deadBirds = [];
    this.pipes = [];
    this.generatePipe();

    this.loop = setInterval(this.GameLoop, 1000 / (FPS));
  }

  onKeyDown = (e) => {

    if (e.code === "Space") {
      this.birds.forEach(bird => {
        bird.jump();
      });
    }
  }

  generateBirds = () => {
    const birds = [];
    for (let i = 0; i < TOTAL_BIRDS; i++) {
      const brain = this.deadBirds.length ? this.pickOne().brain : null;
      const newBird = new Bird(this.ctx, brain,SPACE,WIDTH,HEIGHT);
      birds.push(newBird);
    }
    return birds;
  }

  generatePipe = () => {
    let pipe1 = new Pipe(this.ctx, null,WIDTH,HEIGHT,SPACE);
    let pipe2 = new Pipe(this.ctx, pipe1.height,WIDTH,HEIGHT,SPACE);
    this.pipes.push(pipe1);
    this.pipes.push(pipe2);
  }

  getNextPipe = (bird) => {
    for (let i = 0; i < this.pipes.length; i++) {
      if (this.pipes[i].x+this.pipes[i].width >= bird.x) {
        return this.pipes[i];
      }
    }
  }



  GameLoop = () => {
    this.setState({
      frameCount: this.state.frameCount + 1,
      aliveBirds: this.birds.length
    }, () => {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

      this.ctx.font = "15px Arial";
      this.ctx.fillText("Generation: "+this.state.generation,5,25);
      this.ctx.fillText("Alive Birds: "+this.state.aliveBirds,5,50);
      if (this.state.frameCount % (FPS * NEW_PIPE_TIME) === 0) {
        this.generatePipe();
      }

      //update pipe positions
      this.pipes.forEach(pipe => pipe.update());

      //update bird positions

      this.birds.forEach(bird => {
        const nextPipe = this.getNextPipe(bird);
        const pipeY = nextPipe.y + nextPipe.height;
        bird.update(nextPipe.x, pipeY, pipeY + SPACE);
      });

      //delete off-screen pipes
      this.pipes = this.pipes.filter(pipe => !pipe.isDead);

      //delete dead birds
      this.updateBirdDeadState();
      this.deadBirds.push(...this.birds.filter(bird => bird.isDead));
      this.birds = this.birds.filter(bird => !bird.isDead);
      //console.log(this.birds.length);
      if (this.birds.length === 0) {
        let totalAge = 0;
        //Calculate cumutlative age
        this.deadBirds.forEach(deadBird => totalAge += deadBird.age);

        //Calculate fitness raio
        this.deadBirds.forEach(deadBird => deadBird.fitness = deadBird.age / totalAge);


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
