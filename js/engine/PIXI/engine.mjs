import {
    Tween,
    update as TweenUpdate
} from '../tween/index.mjs';
import { GameObject } from './gameObject.mjs';
import { Application } from './pixi.mjs';

// Apply pixi extras
// import _NOTHING_ from './pixi-extras.mjs';

// Acts as a bridge for PIXI application
class Engine{

    static app = null;
    static scene = null;

    static _init({
        container, width, height
    }){

        this.app = new Application();
        this.app.renderer.background.color = 0x1c1c1c;
        this.app.renderer.resize(width, height);

        container.append(this.app.view);
        
        this.scene = this.app.stage;
    }

    static addEvent(type, callback, target = this){
        if(type == "tick"){
            this.app.ticker.add(callback, target);

        }
    }

    static removeEvent(type, callback, target = this){
        if(type == "tick"){
            this.app.ticker.remove(callback, target);
        }
    }
}

export {
    Engine
};