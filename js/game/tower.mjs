import { GameObject, Geometry, TextObject } from "../adapter.mjs";
import { Quad } from "../engine/PIXI/pixi.mjs";
import { Bullet, Field } from "./projectile.mjs";


class Tower extends GameObject{

    static uf = 0.5; // upgrade factor
    static base_cap = 3;
    
    /*
        Tower Damage Sequence:
        - Check for targets
            - Once found, call engine to create projectile if not type B
                - Projectile contains information on the damage and homes to the enemy
                - once arrived to enemy call enemy.dmg
                - then call on arrive events on the projectile (like ricochet and aoe effect)
            - If type B, directly call enemy.dmg
            - Calling dmg contains information about the dmg
    */

    // base stats holder
    base = {};

    // stats
    atk; // TODO: Add elemental damage
    spd; // attacks per second
    rng; // range (map block size)
    trg; // target count (how many it can shoot at the same time) (INFINITE FOR TYPE B)
    apr; // armor piercing, ignores specific amount of armor when hitting

    get range(){
        return this.rng;
    }

    set range(val){
        this.rng = val;
        
        // change range finder scale
        if(!this._range_finder) return;
        const [og, curr] = [this._range_finder.og_range, this.calc_range];
        this._range_finder.scale.set(...Array(2).fill(curr / og));
    }

    // other stats
    _lvl = 0;
    cap; // base mod cap
    sl = false; // selected flag

    get lvl(){
        return this._lvl;
    }

    set lvl(val){
        this._lvl = val;

        // set mod cap too
        this.cap++;
        this._lvl_indicator.text = val;
    }

    get selected(){
        return this.sl;
    }

    set selected(val){
        this.sl = val;

        if(val) this._range_finder.show();
        else this._range_finder.hide();
    }

    get upgrade_cost(){
        return this.base_cost * (1 + Tower.uf)**(this.lvl + 1);
    }

    // miscellaneous
    _range_finder = null;
    
    constructor({label, ...prop}){
        super(label);

        this.prop = prop;
        Object.assign(this, prop);
        Object.assign(this.base, prop);

        this.cap = Tower.base_cap;

        this._range_finder = new GameObject("t_rangeFinder");
        this._lvl_indicator = new TextObject("", {
            fontFamily: "ISO",
            fontSize: 20,
            stroke: "white",
            strokeThickness: 2,
            fill: "white",
            align: "center"
        })

        this._lvl_indicator.anchor.set(0.5, 0.5);
        this.addChild(this._range_finder, this._lvl_indicator);
    }

    
    buf_atk_cd = 0;
    test = true;

    // time is delta time, used for attack speed
    check(time){
        // console.log(this.buf_atk_cd);
        if(this.buf_atk_cd == null) this.buf_atk_cd = this.atk_cd
        this.buf_atk_cd -= time;
        if(this.buf_atk_cd > 0) return;


        // TODO: Once tower rotation is applied, rotate to the nearest
        
        // optimization: get preliminary targets within certain x and y values
        const bounding = this.block.getBoundingSquare(this.range),
              p_targets = this.game.getEnemiesAtRange(...bounding);

        
        if(this.test){
            console.log(p_targets);
            this.test = false;
        }    

        // filter enemies by entering required distance to fire, sort by distance, slice by how many targets the tower can fire at the same time
        const targets = p_targets.filter(e => {
            const dist = this.distFromSquare(e) - this.calc_range ** 2;
            e.__c_dist = dist;
            return dist <= 0; // if distance is negative or 0, that means enemy is within range
        }).sort((a, b) => a.__c_dist - b.__c_dist).slice(0, this.trg);


        // Don't fire and reset cooldown if no targets to fire
        if(targets.length == 0) return;

        this.fire(targets);
        this.buf_atk_cd = null;
    }

    get atk_cd(){
        return 1000 / this.spd;
    }

    get calc_range(){
        return this.range * this.block.blockSize[0] + this.block.blockSize[0] / 2;
    }

    // should be overriden since different towers have different firing methods
    fire(){
        if(this.constructor.name == "Tower") console.error("CALLED FIRE ON BASE CLASS");
    }

    refreshStats(){
        // get base stats then calculate mod improvements
        const b = {};
        Object.assign(b, this.base);

        if(this._mod != null) this._mod.apply(b);

        Object.assign(this, b);
    }

    _mod = null;

    addMod(mod){
        // changes modded stats values
        if(_mod == null) _mod = mod;
        else this._mod.addMod(mod);

        this.refreshStats();
    }

    delMod(mod){
        if(this._mod.equals(mod)) this._mod = this._mod.mod;
        else this._mod.remove(mod); // recursively find that mod
    }

    sell(){
        this.parent.removeChild(this);
        const value = this.lvl == 0 ? 
                      this.base_cost : 
                      this.base_cost * ((1 + Tower.uf)**(this.lvl + 1) - 1) / Tower.uf;
        console.log("SOLD A TOWER: LVL " + this.lvl + " FOR " + value / 2);
        return value / 2;
    }
}

class Quadra extends Tower{
    static cost = 20;

    constructor({
        block // block to put into
    }){
        // put quadra base stats here
        super({
            label: "t_quadra",
            atk: 5,
            spd: 2,
            range: 1, // block size
            trg: 1,
            apr: 0 // armor peircing
        })

        this.block = block;
        this.base_cost = Quadra.cost;
        [this.mx, this.my] = block.mapPos;
    }

    _initTower(){

        // set position same as block
        this.position.copyFrom(this.block.position);

        // draw
        Geometry.TOWER.REG.bind(this)(this.game.map.blockWidth / 2 - 3, 4, "a");
        Geometry.TOWER.RANGE.bind(this._range_finder)(this.calc_range);
        this._range_finder.og_range = this.calc_range;
        this._range_finder.hide();

        this.eventMode = "static";
        this.onpointertap = function(ev){
            ev.stopPropagation();

            this.game.deselectAll();

            this.selected = true;

            this.game.show_i("iman_towerCont");
        }
    }

    fire(targets){
        if(targets.length == 0) return;

        console.log("FIRED");

        // Square tower uses projects, so we access game and add projectiles in there
        targets.forEach(t => {
            this.game.addProjectile(Bullet, this, t);
        })
    }

}

// From Apeiron which means unlimited/boundless/infinite
class Apeira extends Tower{
    static cost = 50;

    constructor({
        block // block to put into
    }){
        // put quadra base stats here
        super({
            label: "t_apeira",
            atk: 2,
            spd: 1.75,
            range: 0.8, // block size
            trg: Infinity,
            apr: 0 // armor peircing
        })

        this.block = block;
        this.base_cost = Quadra.cost;
        [this.mx, this.my] = block.mapPos;

    }

    _initTower(){
        // For drawing wave effect
        this.__tower_radius = this.game.map.blockWidth / 2 - 3;

        // set position same as block
        this.position.copyFrom(this.block.position);

        // draw
        Geometry.TOWER.CIRCLE.bind(this)(this.__tower_radius, "b");
        Geometry.TOWER.RANGE.bind(this._range_finder)(this.calc_range);
        this._range_finder.og_range = this.calc_range;
        this._range_finder.hide();

        this.eventMode = "static";
        this.onpointertap = function(ev){
            ev.stopPropagation();

            this.game.deselectAll();

            this.selected = true;

            this.game.show_i("iman_towerCont");
        }
    }

    fire(targets){
        if(targets.length == 0) return;

        // create field effect that acts as projectile
        const fx = new Field(this);
        this.game.addEffect(fx);
        fx._initProjectile();

        // Circle tower instantly damages all enemies around them
        targets.forEach(t => {
            t.apr -= this.apr;
            t.damage(this.atk);
            t.apr += this.apr;
        })
    }
}

class Penta extends Tower{
    static cost = 40;

}

class Hexa extends Tower{
    static cost = 45;

}

export {
    Tower,
    Quadra,
    Apeira,
    Penta,
    Hexa
}