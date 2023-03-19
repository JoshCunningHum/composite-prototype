import {
    GameObject
} from "../adapter.mjs";
import { Block } from './block.mjs';
import {
    Util
} from './util.mjs';

class Map extends GameObject {

    /**
     * 
     * @param {Number} x width of the map
     * @param {Number} y height of the map
     * @returns String that represents the map
     */
    static gen(x, y) {

        const spawn = [Util.genInt(x - 1), 0],
            path = [spawn], // numbers [x, y, direction],
            mapSize = x * y,
            halfOfMap = mapSize / 2,
            thirdOfMap = mapSize / 3;

        function t(direction) {
            switch (direction) {
                case -1:
                    return "down";
                case 1:
                    return "up";
                case 2:
                    return "right";
                case -2:
                    return "left";
            }
        }

        function hasBlock(tx, ty) {
            return path.some(p => p[0] == tx && p[1] == ty);
        }

        function isGenDirSafe(tx, ty) {
            return !hasBlock(tx, ty) && Util.isInBound(0, x - 1, tx) && Util.isInBound(0, y - 1, ty);
        }

        function chooseDir(except = []) {
            const choices = [1, 2, -1, -2].filter(c => !(except.includes(c)));
            if (choices.length == 0) return null;
            else if (choices.length == 1) return choices[0];
            return choices[Util.genInt(choices.length) - 1];
        }

        // debugger;

        // in generating path, when path amount is larger than
        // the third of the map, greater the chance of generating base block and stopping
        // generation

        while (true) {
            const last = [...path.at(-1)],
                [lx, ly] = last,
                exceptions = new Set(), // top right bot left
                cbs = [
                    // 0
                    [lx, ly + 2, -1], // top

                    // 1
                    [lx - 1, ly + 1, -1, -2],
                    [lx, ly + 1, -1],
                    [lx + 1, ly + 1, -1, 2],

                    // 4
                    [lx - 2, ly, -2],
                    [lx - 1, ly, -2],
                    [lx + 1, ly, 2],
                    [lx + 2, ly, 2],

                    // 8
                    [lx - 1, ly - 1, 1, -2],
                    [lx, ly - 1, 1],
                    [lx + 1, ly - 1, 1, 2],

                    // 11
                    [lx, ly - 2, 1] // bottom
                ];

            // check for these coordinates:
            /* 
              O    - 0 No Top
             OXO   - 1 2 No Top, No left if left part, No right if right part
            OX*XO  - 3 4 No Left if left part, No Right if right part
             OXO   - 5 6 No Bottom, No Left if left part, No Right if right part
              O    - 7 No Bottom
            */


            let count = 0;
            for (let [cx, cy, ...ex] of cbs) {
                if (!isGenDirSafe(cx, cy)) {
                    ex.forEach(exs => exceptions.add(exs));
                }
                count++;
            }
            if (exceptions.size == 4) {
                console.log("No available path");
                break; // means that no availble path
            }

            const rolled = chooseDir([...exceptions]),
                abs = Math.abs(rolled),
                sign = Math.sign(rolled);


            switch (abs) {
                case 1: // vertical
                    last[1] += -sign; // negative direction means downward, which in canvas positioning is positive
                    break;
                case 2:
                    last[0] += sign;
                    break;
            }

            path.push([...last]);

            // check if path is greater than 3rd of map, if yes, then roll (for increasingly higher chances) that the generation will stop, guarantee if path reaches half of map
            if (thirdOfMap < path.length) {
                if (Util.genInt(halfOfMap - path.length) == 0) {
                    console.log("CLOSED FOR BREAKING");
                    break;
                }
            }

        }

        let mapAsc = new Array(y).fill(0).map(r => new Array(x).fill(0));
        path.forEach(coord => {
            const [cx, cy] = coord;
            mapAsc[cy][cx] = 1;
        })

        // debugger;

        // format base and spawn
        const last = path.at(-1);
        mapAsc[spawn[1]][spawn[0]] = "8";
        mapAsc[last[1]][last[0]] = "O";

        mapAsc = mapAsc.map(row => {
            return row.map(col => {
                return col == 1 ? "+" : typeof col == "number" ? "_" : col;
            }).join("");
        }).join("\n");

        return {
            ascii: mapAsc,
            char_map: "+_O8".split(""),
            path_length: path.length,
            path_coord: path
        }
    }

    width = 500;
    height = 500;
    _path = null;

    // TODO: Create positioning for the map (Extend as another GameObject)

    // TODO: Create setter and getters for updating 
    cs = 10;
    rs = 10;
    set rows(val) {
        this.rs = val;
    }

    set cols(val) {
        this.cs = val;
    }

    get rows() {
        return this.rs
    }
    get cols() {
        return this.cs
    }

    get path(){
        if(this._path == null) this._generatePath();
        return this._path;
    }

    set path(val){
        this._path = val;
    }

    get spawn(){
        this.path[0];
    }

    get base(){
        this.path.at(-1);
    }

    getBlockFrom(block, x, y){
        return this.getAt(block.mapX + x, block.mapY - y);
    }

    _generatePath(){
        // will be basing on children
        if(this.children.length == 0) return new Error("No blocks in map");
        const pc = this.pathCollection,
              spawn = pc.find(b => b.label = "Spawn");
        this._path = [spawn];

        let last = spawn, count = 0;
        // now scan the last block in path for path blocks (i.e. path and base)
        while(last.label != "Base"){
            const adj = last.adj;

            // console.log(last._gid + ": ", adj.map(e => `${e?._gid} - ${e?.label}`));

            adj.forEach((b, i) => {
                if(b == null) return;
                if(this._path.some(p => p._gid == b._gid)) return;
                if(b.label == "Path" || b.label == "Base"){
                    this._path.push(b);
                    b.dirFrom = i;
                    last.dirTo = i;
                }
            })

            count++;
            last = this._path[count];
            if(count > pc.length) break;
        }
    }


    // TODO: Change structure to one dimensional array
    // children = [];

    /**
     * 
     * @param {Number} width Width of map in pixel
     * @param {Number} height Height of map in pixel
     * @param {Number} cols Number of columns in the map
     * @param {Number} rows Number of rows in the map
     */
    constructor(width, height, cols, rows) {
        // TODO: Initialize Game Object
        super();

        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
    }

    get blockWidth() {
        return this.width / this.cols;
    }

    get blockHeight() {
        return this.height / this.rows;
    }

    get blockSize() {
        return [this.blockWidth, this.blockHeight];
    }

    _cellPos(x, y){
        const [bX, bY] = this.blockSize,
              [hX, hY] = [bX / 2, bY / 2];

        return [x * bX + hX + this.position.x,
                y * bY + hY + this.position.y]
    }

    get cellCoords() {
        // returns an array of coordinates for each block (center), should be in relative of the map
        return this.mapCell((cell, r, c) => this._cellPos(c, r));
    }


    /**
     * 
     * @param {Number} i the nth number of the cell in a one dimension
     * @returns an array containing the 2D representation of the index (X, Y)
     */
    _getTwoR(i) {
        return [i % this.cols, Math.floor(i / this.cols)];
    }

    /**
     * 
     * @param {Number} i the vertical index
     * @param {Number} j the horinzontal index
     * @returns the one dimensional representation of the map coordinates
     */
    _getOneR(i, j) {
        return i * this.cols + j;
    }

    /**
     * 
     * @param {Function} callback A callback on what you want to do with the cells
     */
    loopCell(callback) {
        this.children.forEach((cell, i) => callback(cell, ...this._getTwoR(i).reverse(), i));
    }

    /**
     * 
     * @param {Function} callback A callback on what you want to map
     * @returns A mapped array (1 Dimensional)
     */
    mapCell(callback) {
        return this.children.map((cell, i) => callback(cell, ...this._getTwoR(i).reverse(), i));
    }

    /**
     * 
     * @param {Function} callback A predicate condition to what you want to find
     * @returns the first cell that satisfy the predicate condition
     */
    findCell(callback) {
        return this.children.find((cell, i) => callback(cell, ...this._getTwoR(i).reverse(), i));
    }

    filterCell(callback) {
        return this.children.filter((cell, i) => callback(cell, ...this._getTwoR(i).reverse(), i));
    }

    get dataInt() {
        return this.mapCell((cell) => Block.getIndex(cell.label));
    }

    get dataLabels() {
        return this.mapCell((cell) => cell.label);
    }

    static __asciiFormat(char){
        switch(char){
            case "P":
                return "+";
            case "S":
                return "_";
            default:    
                return char;
        }
    }

    // Returns ascii version of the map, used for developing purposes
    get _asciiMap() {
        return this.mapCell((cell, c, r) => `${c == 0 && r > 0 ? "\n" : ""}${Map.__asciiFormat(cell.label[0])}`).join("");
    }

    // Does not necessarily do a pathfinding algo, just returns the path collection
    get pathCollection() {
        return this.filterCell(cell => ["Path", "Base", "Spawn"].includes(cell.label));
    }

    // Only for blocks (Positioning in the canvas)
    _applyCoordsByPosition() {
        const coords = this.cellCoords;

        this.loopCell((cell, r, c, i) => {
            // TODO: GameObject property usage
            cell.position.set(...coords[i]);
        })
    }

    /**
     * 
     * @param {String} str the string that represents the map
     * @param {Array} char_map the array which represents blocks according to their index in Block.types
     */
    setFromAscii(str, char_map) {
        // Rows are separated by new lines
        str = str.split("\n").join("").split("");

        // create hashmap for parsing
        const bs = {};
        char_map.reduce((obj, char, index) => {
            bs[char] = Block.typeData[index].clone;
        }, bs)

        // pass to setFromArray function
        this.setFromArray(str.map(c => bs[c].clone));
    }

    /**
     * Changes map data and overwrite cols and rows
     * @param {Array} arr A two dimensional array that represents blocks
     */
    setFromDArray(arr) {
        const r = arr.length;

        let largestCol = 0;
        for (let i = 0; i < r; i++) {
            const c = arr[i].length;
            if (c > largestCol) largestCol = c;

            for (let j = 0; j < c; j++) {
                this.setAt(i, j, arr[i, j]);
            }
        }

        // Change map data
        this.rows = r;
        this.cols = largestCol;

        // Reposition Blocks
        this._applyCoordsByPosition();

        // Reset path
        this._path = null;
    }

    /**
     * Follows the rows and columns format of the map
     * @param {Array} arr An array containing data that represents blocks
     */
    setFromArray(arr) {
        const [r, c] = [this.rows, this.cols];
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                this.setAt(j, i, arr[this._getOneR(i, j)]);
            }
        }

        // Reposition Blocks
        this._applyCoordsByPosition();
        
        // Reset path
        this._path = null;
    }

    /**
     * 
     * @param {Number} x the X (Horizontal) of the block in the map
     * @param {Number} y the Y (Vertical) of the block in the map
     * @param {Number} block 
     * @param {String} block
     * @param {Block} block
     * @param {Number} i [OPTIONAL] the index of the block if map is one dimensional rep
     */
    setAt(x, y, block, i = null) {
        switch (block.constructor.name) {
            case "Number":
                block = Block.typeData[block].clone;
                break;
            case "String":
                block = Block.types[block].clone;
                break;
        }

        if (i == null) i = this._getOneR(y, x);
        [x, y] = this._getTwoR(i);


        // If the same existing block is already in the map, cancel
        if (this.children[i]?.equals(block)) return;

        // change map data
        this.children[i] = block;
        block.parent = this;
        // change blocks properties
        this.children[i].blockSize = this.blockSize;
        this.children[i].mapPos = [x, y];
        // initialize block
        this.children[i]._initBlock();
    }

    /**
     * 
     * @param {Number} x The Horizontal position or index in the map
     * @param {Number} y The Vertical position or index in the map
     * @returns The Block that is in the (x, y) coordinate in the map
     */
    getAt(x, y) {
        if (x > this.cols || y > this.rows || x < 0 || y < 0) return null;
        return this.children[this._getOneR(y, x)];
    }

}

export {
    Map,
    Block
}