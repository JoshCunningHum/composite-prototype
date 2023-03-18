import { Map, Block} from "./map.mjs";
import { Tower } from "./tower.mjs";
import { Engine, GameObject } from '../adapter.mjs';

// Acts as the game loop
class Game{
    static defaults = {
        mapCols: 10,
        mapRows: 10,
        minPath: 40
    }
    
    map = null;

    menus = [];

    /* Game Values */
    wave_num;
    wave_time; // time left for another wave
    enemy_queue; // enemy spawn queues

    /* Quick Getters */
    get base_block(){
        return this.map.findCell(cell => cell.label == Block.types.Base);
    }

    /**
     * 
     * @param {HTMLElement} container A container on where to display the game
     * @param {Number} width Display width in pixel
     * @param {Number} height Display height in pixel
     */
    constructor(container, width, height){

        // Initialize Engine 
        width ??= container.clientWidth;
        height ??= container.clientHeight;
        [this.width, this.height] = [width, height]

        Engine._init({
            container: container,
            width: this.width,
            height: this.height
        });
    }

    // Initialization
    _init(){
        
        // Initialize Menus (Navigates the game and also additional interfaces)
        this.menus.push(...[
            new GameObject("menu_Main"),
            new GameObject("menu_Game")
        ])
        
        this.menus.forEach(m => {
            Engine.scene.addChild(m);
            if(m.label != "menu_Main") m.visible = false;
            else m.visible = true;
        })

        // TODO: Interfaces here (Should always be at last of the Engine.scene)

        
        // Initialize Map
        this.map = new Map(
            this.width - 100, this.width,
            Game.defaults.mapCols, Game.defaults.mapRows
        )
        this.map.position.x = 25;

        Engine.scene.addChild(this.map);

        // Reset values
        let generatedMap = Map.gen(Game.defaults.mapCols, Game.defaults.mapRows);
        while(generatedMap.path_length < Game.defaults.minPath){
            generatedMap = Map.gen(Game.defaults.mapCols, Game.defaults.mapRows);
        }
        this.map.setFromAscii(generatedMap.ascii, generatedMap.char_map);
        // console.log(Map.gen(Game.defaults.mapCols, Game.defaults.mapRows));
        // this.map.setFromAscii(...);
    }

    _start(){

        // Reset values
        console.log(Map.gen(Game.defaults.mapCols, Game.defaults.mapRows));
        // this.map.setFromAscii(Map.dev_gen(0, 0), "*_O8".split(""));

        // Start Loop
        // Engine.addEvent("tick", this._loop);
    }

    // Loop (Add this to engine tick event)
    // Only handle game events, not rendering, as the engine does that
    _loop(delta){
        // 
    }

    

    _stop(){
        Engine.removeEvent("tick", this._loop);
    }

    

}

export {
    Game
}