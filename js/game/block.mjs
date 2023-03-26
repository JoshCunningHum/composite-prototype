import {
    GameObject,
    Geometry
} from "../adapter.mjs";

// Map Blocks
class Block extends GameObject {
    static typeData = [];
    static get types() {
        const o = {};
        this.typeData.forEach(type => o[type.label] = type);
        return o;
    }

    mx;
    my;

    _site_selected = false;

    get selected(){
        return this._site_selected;
    }

    set selected(val){
        this._site_selected = val;

        // change color base on value
        if(val) this.tint = 0x00ff00;
        else this.tint = 0xffffff;
    }

    set mapPos([x, y]) {
        this.mapX = x;
        this.mapY = y;
    }

    set mapX(val) {
        this.mx = val;
        // TODO: GameObject coordinates 
    }

    set mapY(val) {
        this.my = val;
        // TODO: GameObject coordinates
    }

    get mapY() {
        return this.my;
    }

    get mapX() {
        return this.mx;
    }

    get mapPos() {
        return [this.mapX, this.mapY];
    }

    get clone() {
        return new Block({
            label: this.label,
            ...this.prop
        });
    }

    get adj(){
        const m = this.parent; // map

        return [
            m.getAt(this.mx, this.my - 1),
            m.getAt(this.mx + 1, this.my),
            m.getAt(this.mx, this.my + 1),
            m.getAt(this.mx - 1, this.my)
        ]
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
                label: "Spawn",
                spawnable: true
            }),

            // Add more blocks in the future
        ].forEach(block => this.add(block));
    }

    constructor({
        label,
        ...prop
    }) {
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
    equals(block) {
        if (!(block instanceof Block)) return false;
        return this.label == block.label;
    }


    // initialize bounding rects and positions and events
    _initBlock() {
        // Geometry
        Geometry.BLOCK[this.label].bind(this)();
        // Events
        this.eventMode = "static";

        // do not use click as it only works on pc
        this.onpointertap = (evs) => {
            evs.stopPropagation();

            // un select all other blocks
            if(!this.game.__showing_mod_menu) this.game.deselectAll();
            else this.parent.deselectAll();


            if(this.game.__showing_mod_menu) return;
            this.game.hide_i("ibuild_towerCont");
            
            // Only works on site type blocks
            if(this.label != "Site") return;
            if(this.game.hasTowerAtBlock(...this.mapPos)) return;

            // show build tower interface menu, and set this block to selected
            this.selected = true;

            this.game.show_i("ibuild_towerCont");
        }

        // TODO: DEV PURPOSES
        // this.onpointertap = () => {
        //     console.log(this._gid);
        // }
    }

    // optimization for getting targets
    getBoundingSquare(distMult){ // distMult amount of blocks away from this position
        const c = [this.x, this.y], s = this.center[0],
              bs = this.blockSize[0] * distMult + s;

              // minX, minY (top), maxX, maxY (bot)
        return [c[0] - bs, c[1] - bs, c[0] + bs, c[1] + bs];
    }
}

export {
    Block
}