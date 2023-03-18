// TODO: Import Classes Here
import {
    GameObject as PIXI_Graphics
} from './engine/PIXI/gameObject.mjs';

import {
    Engine as PIXI_Engine
} from './engine/PIXI/engine.mjs';

const use_pixi = true;

// Used for switching between PIXI and custom engine
const GameObject = use_pixi ? class extends PIXI_Graphics{} : null;
const Engine = use_pixi ? class extends PIXI_Engine{} : null;

class Geometry{
    static BLOCK = {};
    static TOWER = {};
    static ENEMY = {};
    static PROJECTILE = {};

    // NOTE: USES PIXI ONLY
    // TODO: Add custom engine geometries

    // BLOCK
    static {
        const c_path = 0x333333,
              c_site = 0x555555,
              c_base = 0x2020ed,
              c_spawn = 0xed2020;

        const g_block = 1;

        this.BLOCK.Path = function(){
            const [x, y] = this.blockSize;

            this.beginFill(c_path)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Site = function(){
            const [x, y] = this.blockSize;

            this.beginFill(c_site)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Base = function(){
            const [x, y] = this.blockSize;

            this.beginFill(c_base)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Spawn = function(){
            const [x, y] = this.blockSize;

            this.beginFill(c_spawn)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }

    }
}

export {
    GameObject,
    Engine,
    Geometry
};