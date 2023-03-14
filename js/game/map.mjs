import { GameObject } from "../adapter.mjs";

// Map Blocks
class Block extends GameObject{
    static typeData = [];
    static get types(){
        const o = {};
        this.typeData.forEach(type => o[type.label] = type);
        return o;
    }

    mx;
    my;

    set mapPos([x, y]){
        this.mapX = x;
        this.mapY = y;
    }

    set mapX(val){
        this.mx = val;
        // TODO: GameObject coordinates 
    }

    set mapY(val){
        this.my = val;
        // TODO: GameObject coordinates
    }

    get mapY(){
        return this.my;
    }

    get mapX(){
        return this.mx;
    }

    get mapPos(){
        return [this.mx, this.my];
    }

    get clone(){
        return new Block({label: this.label, ...this.prop});
    }

    /**
     * 
     * @param {Block} block Block to add in block types
     * @returns Nothing
     */
    static add = (block) => (this.getIndex(block.label) == -1) && this.typeData.push(block);
    /**
     * 
     * @param {String} label label of the block
     * @returns Block that matches with the label parameter
     */
    static get = (label) => this.typeData.find(b => b.label == label);
    /**
     * 
     * @param {String} label label of the block
     * @returns Index of the Block in Block.types that matches with the label parameter
     */
    static getIndex = (label) => this.typeData.findIndex(b => b.label == label);
    /**
     * 
     * @param {String} label label of the block
     * @returns Removes the first block in Block.types that matches with the label parameter
     */
    static remove = (label) => this.typeData.splice(this.getIndex(label), 1);

    static {
        // Initialize blocks here
        [
            // Path
            new Block({
                label: "Path",
                walkable: true,
                isGenerated: true
            }),
            // Site (Where to build towers)
            new Block({
                label: "Site",
                buildable: true,
                tower: null,
                filler: true
            }),
            // Base
            new Block({
                label: "Base",
                destination: true
            }),
            // Where the enemy spawns (Not needed to be in the edge)
            new Block({
                label: "Spawner",
                spawnable: true
            }),

            // Add more blocks in the future
        ].forEach(block => this.add(block));
    }

    constructor({label, ...prop}){
        // TODO: Initialize Game Object 
        super();

        // apply properties
        this.label = label;
        this.prop = prop;
        Object.assign(this, prop);
    }

    /**
     * 
     * @param {Block} block Other block to compare to
     */
    equals(block){
        if(!(block instanceof Block)) return false;
        return this.label == block.label;
    }
}

class Map extends GameObject{

    static gen(){
        // Do backtracking here
    }

    // TODO: Delete this after making the backtracking generator
    static dev_gen(x, y){
        const def_blocks = {
            P: Block.getIndex("Path"),
            S: Block.getIndex("Site")
        }

        const def_map = [
            "_8________",
            "_*_****___",
            "_*_*__*___",
            "_***__*___",
            "______*___",
            "______*___",
            "______*___",
            "______*___",
            "______*___",
            "______O___",
        ];

        // TODO: Add initialization of blocks
        return def_map;
    }

    width = 500;
    height = 500;

    // TODO: Create positioning for the map (Extend as another GameObject)

    // TODO: Create setter and getters for updating 
    cs = 10;
    rs = 10;
    set rows(val){
        this.rs = val;
    }

    set cols(val){
        this.cs = val;
    }

    get rows(){return this.rs};
    get cols(){return this.cs};


    // TODO: Change structure to one dimensional array
    children = [];

    /**
     * 
     * @param {Number} width Width of map in pixel
     * @param {Number} height Height of map in pixel
     * @param {Number} cols Number of columns in the map
     * @param {Number} rows Number of rows in the map
     */
    constructor(width, height, cols, rows){
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
    }

    get blockWidth(){
        return this.width / this.cols;
    }

    get blockHeight(){
        return this.height / this.rows;
    }

    get blockSize(){
        return [this.blockWidth, this.blockHeight];
    }

    get cellCoords(){
        // returns an array of coordinates for each block (center), should be in relative of the map
        const [bX, bY] = this.blockSize;

        return this.mapCell(cell => [cell.mapX * bX, cell.mapY * bY]);
    }

    /**
     * 
     * @param {Function} callback A callback on what you want to do with the cells
     */
    loopCell(callback){
        this.children.forEach((row, r) => {
            row.forEach((cell, c) => callback(cell, r, c));
        })
    }

    /**
     * 
     * @param {Function} callback A callback on what you want to map
     * @returns A mapped array (2 Dimensional)
     */
    mapCell(callback){
        return this.children.map((row, r) => {
            return row.map((cell, c) => callback(cell, r, c));
        })
    }
    
    findCell(callback){
        return this.children.find(row => {
            return row.find(cell => callback(cell));
        })
    }

    get dataInt(){
        return this.mapCell((cell) => Block.getIndex(cell.label));
    }

    get dataLabels(){
        return this.mapCell((cell) => cell.label);
    }

    // Returns ascii version of the map, used for developing purposes
    get _asciiMap(){
        return this.mapCell(cell => cell.label[0]).map(row => row.join("")).join("\n");
    }

    get path(){
        return this.map.reduce(acc, row => {
            acc.push(...row.filter())
        }, [])
    }

    // Only for blocks (Positioning in the canvas)
    _applyCoordsByPosition(){
        const coords = this.cellCoords;

        this.loopCell((cell, r, c) => {
            const i = r * this.cols + c;
            // TODO: GameObject property usage
            cell.pos = coords[i];
        })
    }

    /**
     * 
     * @param {String} str the string that represents the map
     * @param {Array} char_map the array which represents blocks according to their index in Block.types
     */
    setFromAscii(str, char_map){
        // Rows are separated by new lines
        str = str.split("\n").map(r => r.split(""));

        // create hashmap for parsing
        const bs = char_map.reduce((obj, char, index) => {
            obj[char] = Block.typeData[index].clone;
        }, {})

        // pass to setFromArray function
        this.setFromDArray(str.map(r => {
            return r.map(c => {
                return bs[c];
            })
        }))
    }

    /**
     * Changes map data and overwrite cols and rows
     * @param {Array} arr A two dimensional array that represents blocks
     */
    setFromDArray(arr){
        const r = arr.length,
              largestCol = 0;
        for(let i = 0; i < r; i++){
            const c = arr[i].length;
            if(c > largestCol) largestCol = c;

            for(let j = 0; j < c; j++){
                this.setAt(i, j, arr[i, j]);
            }
        }

        // Change map data
        this.rows = r;
        this.cols = largestCol;

        // reposition blocks
        this._applyCoordsByPosition();
    }

    /**
     * Follows the rows and columns format of the map
     * @param {Array} arr An array containing data that represents blocks
     */
    setFromArray(arr){
        const [r, c] = [this.rows, this.cols];
        for(let i = 0; i < r; i++){
            for(let j = 0; j < c; j++){
                this.setAt(i, j, arr[i * c + j]);
            }
        }
        
        // reposition blocks
        this._applyCoordsByPosition();
    }

    /**
     * 
     * @param {Number} x the X (Horizontal) of the block in the map
     * @param {Number} y the Y (Vertical) of the block in the map
     * @param {Number} block 
     * @param {String} block
     * @param {Block} block
     */
    setAt(x, y, block){
        switch(block.constructor.name){
            case "Number":
                block = Block.typeData[block].clone;
                break;
            case "String":
                block = Block.get(block).clone;
                break;
        }

        // If the same existing block is already in the map, cancel
        if(this.children[y][x].equals(block)) return;

        // change map data
        this.children[y][x] = block;
        // change blocks properties
        block.mapPos = [x, y];
        block.position.set(block.mapX * this.blockWidth, block.mapY * this.blockWidth);
    }

    /**
     * 
     * @param {Number} x The Horizontal position or index in the map
     * @param {Number} y The Vertical position or index in the map
     * @returns The Block that is in the (x, y) coordinate in the map
     */
    getAt(x, y){
        if(x > this.cols || y > this.rows || x < 0 || y < 0) return null;
        return this.children[y][x];
    }

}

export {
    Map,
    Block
}