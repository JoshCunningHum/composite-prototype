import Event from './event.mjs';
import {
    update as TweenUpdate,
    Tween
} from './tween/index.mjs';

class Engine{
    /*  TODO
        - Rendering
            - Scenes
            - Game Objects
        - Frame Pacing
        - Interfaces
        - Memory Management
        - Utilities
        - Events 
            Object and Engine
            - Mouse Events
                - Click
                - Hover
                - Drag
                - Release (Releasing Drag)

            Engine and Selected Objects
            - Key Events 

            Engine Only
            - Tick Events
                - Interval
                - Frames
            - Exiting Events
            
    */

    constructor(scene, )

    static _init(){

        this.$last_tick = Date.now();
        this.render();
    }

    scene;
    


    events = [];

    static addEvent(type, callback){
        // returns the ID of the event
        const e = new Event(type, callback);
        this.events.push(e);
        return e.id;
    }

    static removeEvent(id){ 
        const index = this.events.findIndex(e => e.id == id);
        if(index == -1) throw new Error("No Event with id: " + id);
        this.events.splice(index, 1);
    }

    // used for rendering, renders all objects
    static draw(parent){

    }

    delta = 0;
    $last_tick = 0;

    static render(){
        requestAnimationFrame(() => this.render());

        // Frame Pacing
        const now = Date.now();
        this.delta = now - this.$last_tick;
        this.$last_tick = now; 

        // Drawing objects
        this.draw(this.scene);

        // Update all tweens
        TweenUpdate(this.delta);
    }
}

export default Engine;