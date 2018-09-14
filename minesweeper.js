//creates each cell on the board
class Cell {
  constructor(board, y, x) {
    this.board = board;    // board object
    this.y = y;
    this.x = x;
    this.id = `r${y}c${x}`;
    this.mine = false;     // is this a mine?
    this.revealed = false; // is this cell revealed?
    this.number = 0;       // Number of mine neighbors  
    this.flagged = false;
  }
  // checks through all neighboring cells
  neighbors() {
    let out = [];
    for (let xdelta = -1; xdelta <= 1; xdelta++) {
      for (let ydelta = -1; ydelta <= 1; ydelta++) {
        // if x and y are the same break this iteration and move on to the next one
        if (xdelta === 0 && ydelta === 0) continue;
        let newX = this.x + xdelta;
        let newY = this.y + ydelta;
        //check if x and y coords are inside the board
        if (newX >= 0 && newX < this.board.width
          && newY >= 0 && newY < this.board.height)
          out.push(this.board.cells[newY][newX]);
      }
    }
    return out;
  }

  //runs when user clicks a cell
  handleClick() {
    if (this.flagged) return;
    //reveal cell clicked and check neighbors
    this.revealAndCheckNeighbors();
    //if cell clicked is a mine the game is over
    if (this.mine) {
      return this.board.game.endGame()
      //if no more mines left user wins
    } else if (this.board.remaining === 0) {
      return this.board.game.endGame(true)
    }
  }

  //right click flags a cell as a mine and makes it unclickable
  handleRightClick(evt) {
    evt.preventDefault();
    if (this.revealed) return;
    this.flagged = !this.flagged;
    this.show(true);
    this.toggledFlagged()
  }

  toggledFlagged() {
    if (this.flagged) {
      document.getElementById(this.id).className = 'flagged'
    } else {
      document.getElementById(this.id).className = 'unflagged'
    }
  }

  //reveals cell and checks if neighbors are mines
  revealAndCheckNeighbors() {
    //show cell
    this.show();
    //array of cells to check
    let toCheck = [this];
    //set of cells that have been seen(?) or checked
    const seen = new Set;

    while (toCheck.length > 0) {
      // pop last cell to check it
      const cell = toCheck.pop();
      // if it's already been checked move on to the next iteration
      if (seen.has(cell)) continue;
      // add cell to seen set
      seen.add(cell.id);

      // if the cell is NOT a mine and NOT yet revealed then reveal it
      if (!cell.mine && !cell.revealed) {
        cell.revealed = true;
        cell.show();
        this.board.remaining -= 1;
        // if cell has no neighboring mines (so it's number is a 0) then add its neighbors to the toCheck array
        if (cell.number === 0) {
          toCheck.push(...cell.neighbors())
        }
      }
    }
  }

  getContent(showMines) {
    if (!showMines && !this.revealed) {
      return null;
    } else if (this.mine) {
      return "mine";
    } else if (this.flagged) {
      return 'flagged';
    } else {
      return "n" + this.number;
    }
  }

  show(showMines) {
    // assigns a class name to the cell 
    document.getElementById(this.id).className = this.getContent(showMines);
  }
}

//creates board 
class Board {
  constructor(game, width, height) {
    this.game = game;             // game object
    this.width = width;
    this.height = height;
    this.remaining = width * height; //cells remaining starts at a full board before anything is clicked on
    this.cells = []
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Cell(this, y, x));
      }
      this.cells.push(row);
    }
  }
  // randomly place numMines mines in game board
  placeMines(numMines) {
    let placed = 0;
    while (placed < numMines) {
      const y = Math.floor(Math.random() * this.height);
      const x = Math.floor(Math.random() * this.width);
      const cell = this.cells[y][x]
      if (!cell.mine) {
        // turn cell into mine
        cell.mine = true;
        //increase number of cells placed by 1
        placed += 1;
        //decrease remaining non-mine, non-revealed cells by 1
        this.remaining -= 1;
        for (let n of cell.neighbors()) {
          //increase cells number to reflect correct number of remaining mines
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
        tcell.addEventListener("contextmenu", cell.handleRightClick.bind(cell))

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

  endGame(winner) {
    for (let row of this.board.cells) {
      for (let cell of row) {
        cell.show(true);
      }
    }
    if (!winner) {
      alert("You lose");
      playingGame = false;
    } else {
      alert('YOU WIN!')
      playingGame = false;
    }
  }
}


var playingGame = false;
document.getElementById("playgame").addEventListener('click', function () {
  if (!playingGame) {
    playingGame = true;
    let board = document.getElementById('board');
    board.innerHTML = '';
    let game = new Game(11, 11, 11);
  }
})