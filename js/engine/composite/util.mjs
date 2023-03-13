class Util{
    
    /**
     * 
     * @returns A randomly generated character
     */
    static genChar = () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.random()*62|0);

    /**
     * 
     * @param {Number} length the length of the random string
     * @returns The randomly generated string
     */
    static genString = (length) => Array(length).fill(0).map(x => this.genChar()).join("");
}

export default Util;