// TODO: Import Classes Here

const use_pixi = true;

// Used for switching between PIXI and custom engine
class GameObject{

    constructor(...args){

        if(use_pixi) null // return pixi class
        else null// return custom engine class
    }


    addEvent(type, callback){

    }

    // TODO: Positioning Elements
}

class Engine {

    constructor(...args){

        if(use_pixi) null
        else null
    }
}

export {
    GameObject,
    Engine
};