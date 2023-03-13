import Util from "./util.mjs";

class Event{
    type;
    callback;
    id;
    target = null;

    /**
     * 
     * @param {String} type the type of event
     * @param {Function} callback the function that will fire
     * @param {Object} target the scope of the callback
     */
    constructor(type, callback, target){
        this.type = type;
        this.callback = callback;
        this.target = target;
        this.id = Util.genString(16);
    }

    /**
     * 
     * @param {Function} condition A predicate for assessing trigger conditions
     * @returns What the predicate will return
     */
    check(condition){
        return condition(this.target)();
    }

    fire = () => this.callback.bind(this.target)();
}

export default Event;