import { GameObject } from './gameObject.mjs';
import { Application } from './pixi.mjs';

// Apply pixi extras
import _NOTHING_ from './pixi-extras.mjs';
import { gsap } from '../GSAP/index.mjs';

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

        // USES GSAP TICKER
        this.app.ticker.stop();

        gsap.ticker.add((time, delta, frame) => {
            this.app.ticker.update(time);
        })
    }

    static addEvent(type, callback, target = this){
        switch(type){
            case "tick":
                gsap.ticker.add((time, delta, frame) => {
                    callback.bind(target)(delta);
                });
                break;
            case "click":
                target.onpointertap = callback.bind(target);
                break;
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