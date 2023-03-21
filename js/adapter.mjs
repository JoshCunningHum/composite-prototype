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
              c_spawn = 0x9d0de5;

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

    // TOWER 
    static {
        // TODO: Change tower colors later

        const cs = {
            c_build: 0x999999,
            c_a: 0xffa54c,
            c_b: 0xffa54c,
            c_c: 0xffa54c,
            c_d: 0xffa54c
        }

        const def_size = 10, // radius
              c_range = 0xffffff,
              c_range_thick = 1;

        this.TOWER.REG = function(radius = 10, sides = 4, type = "build"){
            radius = radius * 4 / sides;
            type = this.t_type || type;

            this.beginFill(cs[`c_${type}`])
            .drawRegularPolygon(0, 0, radius, sides, Math.PI / sides)
            .endFill();
        }

        this.TOWER.CIRCLE = function(radius = 10, type = "build"){
            type = this.t_type || type;

            this.beginFill(cs[`c_${type}`])
            .drawEllipse(0, 0, radius / 1.5, radius / 1.5)
            .endFill();
        }

        this.TOWER.RANGE = function(radius = 10){
            this.beginFill(c_range)
            .drawEllipse(0, 0, radius, radius)
            .endFill();

            this.beginHole()
            .drawEllipse(0, 0, ...Array(2).fill(radius - c_range_thick))
            .endFill();
        }
    }

    // ENEMY
    static {
        const c_a = 0x0ec74c,
              cs_a = 0x0f7a33,

              c_b = 0x0c7a99,
              cs_b = 0x097487,

              c_c = 0xbabc20,
              cs_c = 0x89891a,

              c_d = 0xbf6115,
              cs_d = 0x894511,

              c_mini = 0xbc1a1a,
              cs_mini = 0x7f1313,

              c_boss = 0xa018c9,
              cs_boss = 0x6f1889,

              c_hp = 0xed2222,
              def_size = 10,
              def_stroke = 5;

        this.ENEMY.A = function(){
            this.def_c = c_a;
            this.def_sc = cs_a;
            this._c = c_a;
            this._sc = cs_a;

            this.beginFill(cs_a)
            .drawRegularPolygon(0, 0, def_size, 4, Math.PI)
            .endFill();

            this.beginFill(c_a)
            .drawRegularPolygon(0, 0, def_size - def_stroke, 4, Math.PI)
            .endFill();
        }

        this.ENEMY.B = function(){
            this.def_c = c_b;
            this.def_sc = cs_b;
            this._c = c_b;
            this._sc = cs_b;

            this.beginFill(cs_b)
            .drawRegularPolygon(0, 0, def_size, 3, Math.PI)
            .endFill();

            this.beginFill(c_b)
            .drawRegularPolygon(0, 0, def_size - def_stroke, 3, Math.PI)
            .endFill();
        }

        this.ENEMY.C = function(){
            this.def_c = c_c;
            this.def_sc = cs_c;
            this._c = c_c;
            this._sc = cs_c;

            this.beginFill(cs_c)
            .drawEllipse(0, 0, def_size, def_size)
            .endFill();

            this.beginFill(c_c)
            .drawEllipse(0, 0, def_size - def_stroke, def_size - def_stroke)
            .endFill();
        }

        this.ENEMY.D = function(){
            this.def_c = c_d;
            this.def_sc = cs_d;
            this._c = c_d;
            this._sc = cs_d;

            this.beginFill(cs_d)
            .drawRegularPolygon(0, 0, def_size, 5, Math.PI)
            .endFill();

            this.beginFill(c_d)
            .drawRegularPolygon(0, 0, def_size - def_stroke, 5, Math.PI)
            .endFill();
        }

        this.ENEMY.MINI = function(){
            this.def_c = c_mini;
            this.def_sc = cs_mini;
            this._c = c_mini;
            this._sc = cs_mini;

            this.beginFill(cs_mini)
            .drawRegularPolygon(0, 0, def_size * 1.5, 4, Math.PI)
            .endFill();

            this.beginFill(c_mini)
            .drawRegularPolygon(0, 0, def_size * 1.5 - def_stroke, 4, Math.PI)
            .endFill();
        }

        this.ENEMY.BOSS = function(){
            this.def_c = c_boss;
            this.def_sc = cs_boss;
            this._c = c_boss;
            this._sc = cs_boss;

            this.beginFill(cs_boss)
            .drawRegularPolygon(0, 0, def_size * 1.5, 6, Math.PI)
            .endFill();

            this.beginFill(c_boss)
            .drawRegularPolygon(0, 0, def_size * 1.5 - def_stroke, 6, Math.PI)
            .endFill();
        }

        this.ENEMY.hpBar = function(){
            this.beginFill(c_hp)
            .drawRect(-def_size, def_size, def_size * 2, 2)
            .endFill();
        }
    }

    // PROJECTILE
    static {
        const c_bullet = 0xffffff,
              c_wave = 0x999999;

        this.PROJECTILE.BULLET = function(){
            this.beginFill(c_bullet)
            .drawRect(0, 0, 2, 2)
            .endFill();
        }

        this.PROJECTILE.WAVE = function(){
            const {x, y, __tower_radius} = this.tower;

            this.beginFill(c_wave)
            .drawEllipse(0, 0, __tower_radius, __tower_radius)
            .endFill();

            this.beginHole(c_wave)
            .drawEllipse(0, 0, __tower_radius - 1, __tower_radius - 1)
            .endHole();
        }
    }

}

export {
    GameObject,
    Engine,
    Geometry,
    TextObject
};