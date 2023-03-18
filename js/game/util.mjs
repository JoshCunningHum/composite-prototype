class Util{

    /**
     * 
     * @param {Object} obj The object to be copied
     * @returns A deep copy of the object
     */
    static objCopy = (obj) => {
        const copy = {};
        $.extend(true, copy, obj);
        return copy;
    }

    static genInt = (max = 100, min = 0) => {
        return Math.ceil(Math.random() * (max - min) + min);
    }

    /**
     * 
     * @param {Number} min minimum value
     * @param {Number} max maximum value
     * @param {Number} value number that should be in between to return true
     * @param {Number} mode determines if it is inclusive or exlusive, in exact order: [0, 1, 2, 3] = [in-both, both-both, in-min, in-max]
     * @returns Boolean value wether if the value parameter is in bound max and min
     */
    static isInBound = (min, max, value, mode = 0) => {
        switch(mode){
            case 0:
                return min <= value && max >= value;
            case 1:
                return min < value && max > value;
            case 2:
                return min <= value && max > value;
            case 3:
                return min < value && max >= value;
        }
    }
}

export {
    Util
};