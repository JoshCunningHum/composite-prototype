import Util from "./util";

class Event{
    type;
    callback;
    id;

    /**
     * 
     * @param {String} type the type of event
     * @param {Function} callback the function that will fire
     */
    constructor(type, callback){
        this.type = type;
        this.callback = callback;
        this.id = Util.genString(16);
    }
}

export default Event;