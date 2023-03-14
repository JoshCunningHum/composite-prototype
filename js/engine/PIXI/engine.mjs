import {
    Tween,
    update as TweenUpdate
} from '../tween/index.mjs';
import { GameObject } from './gameObject.mjs';
import { Application } from './pixi.mjs';

// Acts as a bridge for PIXI application
class Engine{

    static _app = null;
    static scene = null;

    static _init({
        container
    }){


        this._app = new Application({ resizeTo: container });
        container.append(this._app.view);
        
        this.scene = _app.stage;
    }

    static addEvent(type, callback, target = this){
        if(type == "tick"){
            this._app.ticker.add(callback, target);
        }
    }

    static removeEvent(type, callback, target = this){
        if(type == "tick"){
            this._app.ticker.remove(callback, target);
        }
    }
}

export {
    Engine
};