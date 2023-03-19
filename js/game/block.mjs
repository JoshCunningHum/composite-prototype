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

        this.addEvent("click", () => {
            console.log("CLICK!");
        })

        // TODO: DEV PURPOSES
        // this.onpointertap = () => {
        //     console.log(this._gid);
        // }
    }
}

export {
    Block
}