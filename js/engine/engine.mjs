import { GameObject } from '../adapter.mjs';
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

    static _init(){

        this.$last_tick = Date.now();
        this.render();
    }

    scene;
    

    
    events = [];

    /**
     * 
     * @param {String} type the type of event
     * @param {Function} callback what will happen if the event is fired, binded to the object the event is binded to
     * @returns 
     */
    static addEvent(type, callback, target = this){
        // returns the ID of the event
        const e = new Event(type, callback, target);
        this.events.push(e);
        return e.id;
    }

    static removeEvent(id){ 
        const index = this.events.findIndex(e => e.id == id);
        if(index == -1) throw new Error("No Event with id: " + id);
        this.events.splice(index, 1);
    }

    /**
     * What happens in each tick of the game
     */
    static tick(){
        // (re)draw objects
        this.draw(this.scene);

        // check events

        // fire triggered events
    }

    // used for rendering, renders all objects
    static draw(parent){
        // recursive function
        if(parent instanceof GameObject) parent.draw();
        if(parent.children.length > 0) parent.children.forEach(o => this.draw(o));
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
        this.tick();

        // Update all tweens
        TweenUpdate(this.delta);
    }
}

export default Engine;