const Engine = req("Engine"),
      Block = req("Block"),
      Game = req("Game"),
      Graphics = req("Graphics");

let width = window.innerWidth,
    height = window.innerHeight;

// For PCs
if(height < width) {
    width = 400;
    height = 700;
}

// alert(`${width} ${height}`)

// Find container for the game
const game = new Game(
    document.getElementById("game"),
    width, height
)

// Initialize the game
game._init();
game._start();