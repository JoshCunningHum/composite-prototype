// TODO: Import Classes Here
import {
    GameObject as PIXI_Graphics
} from './engine/PIXI/gameObject.mjs';

import {
    Engine as PIXI_Engine
} from './engine/PIXI/engine.mjs';

const use_pixi = true;

// Used for switching between PIXI and custom engine
class GameObject{

    constructor(...args){

        if(use_pixi) return new PIXI_Graphics(...args) // return pixi class
        else null// return custom engine class
    }

    // TODO: Add Events

    // TODO: Positioning Elements
}

class Engine {

    constructor(...args){

        if(use_pixi) return new PIXI_Engine(...args);
        else null
    }
}

class Geometry{
    static BLOCK = {};
    static TOWER = {};
    static ENEMY = {};
    static PROJECTILE = {};

    // NOTE: USES PIXI ONLY
    // TODO: Add custom engine geometries

    // BLOCK
    static {
        this.BLOCK.Path = function(){
            const {x, y} = this.position;

            this.beginFill();
            // TODO: Import PIXI Graphics Extras
            this.drawRegularPolygon(x, y, )
        }
    }
}

export {
    GameObject,
    Engine
};