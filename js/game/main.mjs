import { Map } from "./map.mjs";
import { Tower } from "./tower.mjs";
import { Engine } from '../adapter.mjs';

// Acts as the game loop
class Game{
    

    /**
     * 
     * @param {Engine} Engine The engine used for this game (decided in adapter.js)
     */
    constructor(Engine){
        
    }

    // Initialization
    _init(){
        
        // add loop event to the engine
        Engine.addEvent("tick", this._loop);
    }

    // Loop (Add this to engine tick event)
    _loop(){
        // 
    }

}

export {
    Game
}