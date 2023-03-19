// TODO: Import Classes Here
import {
    GameObject as PIXI_Graphics,
} from './engine/PIXI/gameObject.mjs';

import {
    Engine as PIXI_Engine
} from './engine/PIXI/engine.mjs';

import {
    Text as PIXI_Text
} from './engine/PIXI/pixi.mjs';

const use_pixi = true;

// Used for switching between PIXI and custom engine
const GameObject = use_pixi ? class extends PIXI_Graphics{} : null;
const Engine = use_pixi ? class extends PIXI_Engine{} : null;
const TextObject = use_pixi ? class extends PIXI_Text{} : null;

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

        // gap per block
        const g_block = 5;

        // geometries
        this.BLOCK.Path = function(){
            const [x, y] = this.blockSize;

            this._c = c_path;
            this.def_c = c_path;

            this.beginFill(c_path)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Site = function(){
            const [x, y] = this.blockSize;

            this._c = c_site;
            this.def_c = c_site;

            this.beginFill(c_site)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Base = function(){
            const [x, y] = this.blockSize;

            this._c = c_base;
            this.def_c = c_base;
            
            this.beginFill(c_base)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }
        this.BLOCK.Spawn = function(){
            const [x, y] = this.blockSize;

            this._c = c_spawn;
            this.def_c = c_spawn;

            this.beginFill(c_spawn)
            // TODO: Import PIXI Graphics Extras
            .drawRect(-x / 2 + g_block / 2, -y /2 + g_block / 2, x - g_block, y - g_block)
            .endFill();
        }

        // events
    }

    // ENEMY
    static {
        const c_a = 0x0ec74c,
              cs_a = 0x282828,
              c_hp = 0xed2222,
              def_size = 10,
              def_stroke = 5;

        this.ENEMY.A = function(){
            this.def_c = c_a;
            this.def_sc = cs_a;
            this._c = c_a;
            this._sc = cs_a;

            this.beginFill(cs_a)
            .drawRegularPolygon(0, 0, def_size, 3, Math.PI)
            .endFill();

            this.beginFill(c_a)
            .drawRegularPolygon(0, 0, def_size - def_stroke, 3, Math.PI)
            .endFill();
        }

        this.ENEMY.hpBar = function(){
            this.beginFill(c_hp)
            .drawRect(-def_size, def_size, def_size * 2, 2)
            .endFill();
        }
    }
}

export {
    GameObject,
    Engine,
    Geometry,
    TextObject
};