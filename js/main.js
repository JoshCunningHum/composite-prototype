const Engine = req("Engine"),
      Tween =  req("Tween"),
      Block = req("Block"),
      Game = req("Game"),
      Graphics = req("Graphics");

// Find container for the game
const game = new Game(
    document.getElementById("game"),
    540, 700
)

// Initialize the game
game._init();