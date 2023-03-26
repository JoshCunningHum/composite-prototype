import { GameObject, Geometry } from "../adapter.mjs";
import {
    gsap
} from "../engine/GSAP/index.mjs";
import { Mod } from "./mod.mjs";

class Enemy extends GameObject{
    static types = {};

    // Add Enemies Here
    static {
        this.types.A = new Enemy({
            label: "enemy_a",
            type: "A",
            health: 20,
            dmg: 1,
            armor: 1,
            speed: 7,
            m_reward: 1
        });

        this.types.B = new Enemy({
            label: "enemy_b",
            type: "B",
            health: 10,
            dmg: 1,
            armor: 0,
            speed: 20,
            m_reward: 1
        });

        this.types.C = new Enemy({
            label: "enemy_c",
            type: "C",
            health: 60,
            dmg: 2,
            armor: 2,
            speed: 7,
            m_reward: 2
        });

        this.types.D = new Enemy({
            label: "enemy_c",
            type: "D",
            health: 50,
            dmg: 3,
            armor: 10,
            speed: 3,
            m_reward: 5
        });

        this.types.MINI = new Enemy({
            label: "enemy_mini",
            type: "MINI",
            health: 100,
            dmg: 5,
            armor: 12,
            speed: 5,
            m_reward: 15
        })

        this.types.BOSS = new Enemy({
            label: "enemy_boss",
            type: "BOSS",
            health: 200,
            dmg: 10,
            armor: 50,
            speed: 2,
            m_reward: 50
        })
    }

    sl; // time (ms) left for this enemy to spawn

    _spinit(val){
        this.prop.sl = val;
        this.sl = val;
        return this;
    }

    get modDropChance(){
        const k = 0.15, p = 0.5, c = 0.1;

        return Math.max(0, 1 - (Math.min(1, k * (this.wave_cycle/20)**(-p) + c - this.m_reward/1000) + 0.2));
    }

    get spawnLeft(){
        return this.sl;
    }

    set spawnLeft(val){
        this.prop.sl = val;
        this.sl = val;
    }


    // stats
    hp;
    dmg; // amount of health it reduce to the base
    speed; 
    armor;
    m_reward;

    // for statuses and different types of dmg
    

    get health(){
        return this.hp;
    }

    set health(val){
        this.hp = val;
        // do changes on hp game object
        let r = this.hp / this.ohp;
        if(isNaN(r)) r = 1;

        this.hpBar.scale.set(r, 1);

        // check if dies now
        if(this.hp <= 0){
            this.die();
            // when dying from hp loss, give reward
            game.addMoney(this.m_reward);
            // then calculate for mod drop chance
            const rolled_value = Math.random();

            if(rolled_value < this.modDropChance){
                const props = ["atk", "rng", "spd", "trg", "pen"],
                      modes = ["*", "+"];

                let type_roll = props[Math.floor(Math.random() * props.length * 2) % props.length],
                    mode_roll = Math.random() < 0.75 ? 1 : 0;

                console.log(`CREATED: ${type_roll}`);

                // determine mode by type
                switch(type_roll){
                    case "rng":
                    case "pen":
                        mode_roll = (mode_roll * -1) + 1;
                        break;
                    case "trg":
                        mode_roll = 1;
                }

                mode_roll = modes[mode_roll];
                
                let value_roll = Math.random();

                // determine value base on type
                if(mode_roll == "+"){
                    // increment
                    switch(type_roll){
                        case "atk":
                        case "spd":
                            value_roll = this.wave_cycle * 10 + (this.wave_cycle * (value_roll - 0.5));
                            break;
                        case "rng":
                        case "pen":
                            value_roll = this.wave_cycle + (this.wave_cycle * 0.25 * (value_roll - 0.5));
                            break;
                        case "trg":
                            value_roll = Math.min(5, Math.ceil((this.wave_cycle ** 2 / 10) * (1 + (value_roll - 0.5))));
                            break;
                    }
                }else{
                    // multiplicative
                    switch(type_roll){
                        case "atk":
                        case "spd":
                            value_roll = this.wave_cycle * .25 * (value_roll - 0.05);
                            break;
                        case "rng":
                        case "pen":
                            value_roll = 1.95 / ( 1 + Math.E ** (-1.7 * (this.wave_cycle - 16.8) / 20)) * 2.5
                            break;
                    }
                }

                this.game.addMod(new Mod({prop: type_roll, mode: mode_roll, value: value_roll}));
            }
        }
    }

    get clone(){
        return new Enemy({label: this.label, ...this.prop});
    }
    
    constructor({label, ...prop}){
        super(label);

        // set original values
        this.ohp = prop.health;

        this.label = label;
        this.prop = prop;

        // actual drawable
        this.draw = new GameObject("enemy_drawable");

        // hp
        this.hpBar = new GameObject("enemy_hp");

        this.addChild(this.draw, this.hpBar);

        Object.assign(this, prop);

    }

    get dmgReduction(){
        const calc = this.armor / (this.armor + 10);
        return calc > 0.95 ? 0.95 : calc;
    }

    // TODO: Add damage types
    damage(dmg){
        // reduce damage from armor
        dmg *= 1 - this.dmgReduction;
        this.health -= dmg;

        if(this.health <= 0){
            this.die();
        }
    }

    multStat(wave_cycle){
        this.ohp *= (4 * Math.log(wave_cycle) + 1) * (4 * Math.log(wave_cycle) / 30) + 1;
        this.hp *= (4 * Math.log(wave_cycle) + 1) * (4 * Math.log(wave_cycle) / 30) + 1;

        this.ohp = Math.ceil(this.ohp);
        this.hp = Math.ceil(this.hp);

        this.dmg *= Math.floor(Math.log(wave_cycle) + 1);

        if(this.armor == 0 && wave_cycle >= 2) this.armor = 1;

        this.armor *= Math.ceil(2 * Math.log(wave_cycle) + 1);

        this.m_reward *= Math.log(wave_cycle) + 1;
        this.m_reward = Math.floor(this.m_reward);

        this.speed *= Math.ceil(2 * Math.log(wave_cycle) + 1);

        const b_prop = {
            health: this.ohp,
            dmg: this.dmg,
            armor: this.armor,
            speed: this.speed,
            m_reward: this.m_reward,
            wave_cycle: wave_cycle
        };

        Object.assign(this.prop, b_prop);

        return this;
    }

    dead = false;

    die(){
        if(this.dead) return; // if already dead, don't die again
        this.dead = true;

        // TODO: PIXI JS Exlusive
        this.parent.removeChild(this);
        this.hide();
    }

    /**
     * 
     * @param {Array} path The path on where the enemy will follow
     */
    spawn(path){
        // initiates geometry base on type and then start movement sequence
        this.path = path;
        
        this._initGeometry();
        this.move();
    }

    pathIndex = 0;
    buffer = null;

    _initGeometry(){
        Geometry.ENEMY[this.type].bind(this.draw)();
        Geometry.ENEMY.hpBar.bind(this.hpBar)();

        // setting this object position on the first path
        this.position.copyFrom(this.path[0].position);
        this.pathIndex = 1;
        this.angle = 180;
    }


    move(){
        if(this.pathIndex >= this.path.length) return;
        if(this.dead) return; // if dead, don't move lol

        const nb = this.path[this.pathIndex];

        this.buffer = {x: this.x, y: this.y, r: this.draw.angle};

        const target = {
            x: nb.x,
            y: nb.y,
            r: (nb.dirTo != undefined ? nb.dirTo * 90 : this.buffer.r)
        };

        this.game.tl.to( this.buffer, {
            ...target,
            duration: 10 / this.speed,

            ease: "linear",

            callbackScope: this,
            onUpdate: (buffer) => {
                this.position.set(buffer.x, buffer.y);
                this.draw.angle = buffer.r;
            },
            onUpdateParams: [this.buffer],
            onComplete: () => {
                this.pathIndex++;
                // check if already in the base, if yes, then do dmg
                if(nb.label == "Base"){
                    nb.dmg(this);
                    this.die();
                }
                this.move();
            }
        }, this.game.tl.totalTime());


    }
}

export {
    Enemy
};