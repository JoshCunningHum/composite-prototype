import { GameObject, Geometry } from "../adapter.mjs";
import {
    gsap
} from "../engine/GSAP/index.mjs";

class Enemy extends GameObject{
    static types = {};

    // Add Enemies Here
    static {
        this.types.A = new Enemy({
            label: "enemy_a",
            type: "A",
            health: 20,
            dmg: 1,
            speed: 7,
            m_reward: 1
        });
    }

    sl; // time (ms) left for this enemy to spawn

    _spinit(val){
        this.prop.sl = val;
        this.sl = val;
        return this;
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
        dmg.value *= 1 - this.dmgReduction;

        if(this.health <= 0) die();
    }

    die(){
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
        this._startMoveSequence();
    }

    _startMoveSequence(){
        this.move();
    }

    pathIndex = 0;
    move_sequence = null;
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

        const nb = this.path[this.pathIndex];

        this.buffer = {x: this.x, y: this.y, r: this.draw.angle};

        const target = {
            x: nb.x,
            y: nb.y,
            r: (nb.dirTo ? nb.dirTo * 90 : this.buffer.r)
        };

        this.move_sequence = gsap.to( this.buffer, {
            ...target,
            id: `${this._gid}_ms`,
            duration: 10 / this.speed, // TODO: Change base on enemy speed

            ease: "linear",

            callbackScope: this,
            onUpdate: (buffer) => {
                this.position.set(buffer.x, buffer.y);
                this.draw.angle = buffer.r;
            },
            onUpdateParams: [this.buffer],
            onComplete: () => {
                // check if already in the base, if yes, then do dmg
                if(nb.label == "Base"){
                    nb.dmg(this);
                    this.die();
                }
                this.move();
            }
        })

        this.pathIndex++;

    }
}

export {
    Enemy
};