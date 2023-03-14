import { Engine } from '../../adapter.mjs';
import { Graphics } from './pixi.mjs';

class GameObject extends Graphics{

    // TODO: Add Events
    // TODO: Positioning Elements
    // TODO: Draw Sequence

    _draw = null;
    _engine = null;

    /**
     * 
     * @param {String} label label of the game object (also acts like ID)
     */
    constructor(label){
        super()

        this.label = label;
    }

    /**
     * All game objects needs to be initialized for use
     * @param {Engine} e the reference to the engine used
     * @param {Function} draw the draw sequence of the object, determines how it will be drawed, scope will be the object itself. Should use ES5 Functions
     */
    _init({e, draw}){
        this._engine = e;
        this._draw = draw.bind(this);
    }

    draw(){
        this._draw();
    }

    addEvent(type, callback){
        this._engine.addEvent(type, callback, this);
    }
    
}

export {
    GameObject
}