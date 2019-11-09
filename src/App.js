import React, { Component } from 'react';
import './App.css';

const WIDTH = 800;
const HEIGHT = 500;
const PIPE_WIDTH = 60;
const SPACE = 80;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 460;
const FPS = 60;
const NEW_PIPE_TIME = 3; //Seconds

class Pipe {
  constructor(ctx, firstHeight) {
    this.ctx = ctx;
    this.x = WIDTH;
    this.firstHeight = firstHeight;

    this.height = firstHeight ? HEIGHT - firstHeight - SPACE : Math.random() * (MAX_HEIGHT - SPACE);
    if (this.height < MIN_HEIGHT) firstHeight = MIN_HEIGHT;
  }

  update = () => {
    this.x = this.x - 1;
  }

  draw = () => {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.x, this.firstHeight ? this.firstHeight + SPACE : 0, PIPE_WIDTH, this.height);
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();    
    this.frameCount = 0;
    this.pipes = [];
  }

  componentDidMount = () => {
    this.ctx = this.canvasRef.current.getContext("2d");

    setInterval(this.GameLoop, 1000 / FPS);
  }

  GameLoop = () => {
    this.frameCount++;
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if(this.frameCount % (FPS*NEW_PIPE_TIME) === 0)
    {
      let pipe1 = new Pipe(this.ctx, null);
      let pipe2 = new Pipe(this.ctx, pipe1.height);
      this.pipes.push(pipe1);
      this.pipes.push(pipe2);
    }
    
    this.pipes.forEach(pipe => {
      pipe.update();
      pipe.draw();
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
      </div>
    );
  }
}
export default App;
