
class Cell {
  constructor(board, y, x) {
    this.board = board;    // board object
    this.y = y;
    this.x = x;
    this.id = `r${y}c${x}`;
    this.mine = false;     // is this a mine?
    this.revealed = false; // is this cell revealed?
    this.number = 0;       // Number of mine neighbors                     
  }


  // checks through all neighboring cells
  neighbors() {
    // new array of coords... what are these?
    let out = [];
    // iterate from -1 to 1... what is xdelta? x change?
    for (let xdelta = -1; xdelta <= 1; xdelta++) {
      // y iteration
      for (let ydelta = -1; ydelta <= 1; ydelta++) {
        // if x and y are the same break this iteration and move on to the next one
        if (xdelta === 0 && ydelta === 0) continue;
        // define new xy coords
        let newX = this.x + xdelta;
        let newY = this.y + ydelta;
        //chec if x and y coords are inside the board
        if (newX >= 0 && newX < this.board.width
          && newY >= 0 && newY < this.board.height)
          out.push(this.board.cells[newY][newX]);
      }
    }
    return out;
  }


  handleClick() {
    this.revealAndCheckNeighbors();
    if (this.mine) {
      return this.board.game.endGame(false)
    } else {
      if (this.board.left === 0) {
        return this.board.game.endGame(true);
      }
    }
  }


  revealAndCheckNeighbors() {
    this.show();

    let toCheck = [this];
    const seen = new Set;

    while (toCheck.length > 0) {
      const cell = toCheck.pop();
      if (seen.has(cell)) continue;
      seen.add(cell.id);

      if (!cell.mine && !cell.revealed) {
        cell.revealed = true;
        cell.show();
        this.board.left -= 1;
        if (cell.number === 0) {
          toCheck.push(...cell.neighbors())
        }
      }
    }
  }

  getContent(showMines) {
    console.log('getContent')
    if (!showMines && !this.revealed) {
      return null;
    } else if (this.mine) {
      return "mine";
    } else {
      return "n" + this.number;
    }
  }

  show(showMines) {
    document.getElementById(this.id).className = this.getContent(showMines);
  }
}


class Board {
  constructor(game, width, height) {
    this.game = game;             // game object
    this.width = width;
    this.height = height;
    this.left = width * height;   // non-mine, non-revealed cells
    this.cells = []
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Cell(this, y, x));
      }
      this.cells.push(row);
    }
  }


  placeMines(numMines) {
    let placed = 0;
    while (placed < numMines) {
      const y = Math.floor(Math.random() * this.height);
      const x = Math.floor(Math.random() * this.width);
      const cell = this.cells[y][x]
      if (!cell.mine) {
        cell.mine = true;
        this.left -= 1;
        placed += 1;
        for (let n of cell.neighbors()) {
          n.number += 1;
        }
      }
    }
  }

  makeBoard() {
    const board = document.getElementById("board");
    for (let row of this.cells) {
      const trow = document.createElement("tr");
      for (let cell of row) {
        const tcell = document.createElement("td");
        tcell.id = cell.id;
        tcell.className = cell.getContent(false);
        tcell.addEventListener("click", cell.handleClick.bind(cell))
        trow.appendChild(tcell);
      }
      board.appendChild(trow);
    }
  }
}

class Game {
  constructor(width, height, numMines) {
    this.board = new Board(this, width, height);
    this.board.placeMines(numMines);
    this.board.makeBoard();
  }

  endGame(isWin) {
    for (let row of this.board.cells) {
      for (let cell of row) {
        cell.show(true);
      }
    }
    alert(isWin);
  }
}

const game = new Game(11, 11, 11);