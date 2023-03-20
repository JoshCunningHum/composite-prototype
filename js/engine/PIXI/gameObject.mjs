import { Engine } from '../../adapter.mjs';
import { Util } from '../../game/util.mjs';
import { Graphics, Sprite } from './pixi.mjs';

class GameObject extends Graphics{

    // TODO: Add Events
    // TODO: Positioning Elements
    // TODO: Draw Sequence

    static from(image){
        return Sprite.from(image);
    }

    _draw = null;
    _engine = Engine;

    /**
     * 
     * @param {String} label label of the game object (also acts like ID)
     */
    constructor(label){
        super()

        this.label = label;
        this._gid = Math.random().toString(36).substring(2,10);
    }

    /**
     * All game objects needs to be initialized for use
     * @param {Function} draw the draw sequence of the object, determines how it will be drawed, scope will be the object itself. Should use ES5 Functions
     */
    _init({draw}){
        this._draw = draw.bind(this);
    }

    draw(){
        this._draw();
    }

    addEvent(type, callback){
        this._engine.addEvent(type, callback, this);
    }
    
    centerPutAt(x, y){
        this.position.set(
            x - this.width / 2,
            y - this.height / 2
        )
    }


    hide(){
        this.visible = false;
    }

    show(){
        this.visible = true;
    }

    get center(){
        return [this.width / 2, this.height / 2];
    }
}

export {
    GameObject
}