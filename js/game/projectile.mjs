import { GameObject, Geometry } from "../adapter.mjs";
import { gsap } from "../engine/GSAP/gsap-core.mjs";

class Projectile extends GameObject{

    tl = null;

    constructor({label, ...prop}){
        super(label);

        Object.assign(this, prop);
    }

    // what happens every tick 
    // used by homing by bullets and following of lasers
    // caused by every changing enemy position
    tick(){
        if(this.constructor.name == "Projectile") throw new Error("Should be overriden");
    }

    dead = false;

    killProjectile(){ // supposed to be destroy but pixi uses that
        if(this.dead) return; // if already dead, then don't die again
        this.dead = true;
        this.parent.removeChild(this);
    }
}

class Bullet extends Projectile{

    constructor(from ,target){
        super({
            label: "p_bullet",
            from: from,
            target: target,
            lt: 0.5, // how many seconds this projectile can exist
        })
    }

    _initProjectile(){
        // draw object
        Geometry.PROJECTILE.BULLET.bind(this)();

        // start timeline
        this.home();
    }

    // bullet exlusive only
    home(){
        this.tl = gsap.timeline({onComplete: this.arrive, callbackScope: this})
        .set(this, {x: this.from.x, y: this.from.y})
        .to(this, {x: this.target.x, y:this.target.y, duration: this.lt});
    }

    tick(){
        if(this.dead) return;
        if(this.target.dead){
            this.killProjectile();
            return;
        }

        // saved progress then kill the timeline
        const progress = this.tl.progress();
        this.tl.kill();

        // create back the timeline with the same starting position and target but different tween progress
        this.home();
        this.tl.progress(progress);
    }

    // what happens when tween arrives
    arrive(){
        // damage the enemy base on tower stats
        this.target.armor -= this.from.apr;
        this.target.damage(this.from.atk);
        this.target.armor += this.from.apr;

        this.killProjectile();
    }
}

// Not realy a projectile but an effect, but I'm too lazy to create another file so yeah
class Field extends GameObject{
    constructor(tower){
        super("p_wave");

        this.tower = tower;
        this.position.copyFrom(tower.position);
    }

    _initProjectile(){
        
        // initialized geometry
        Geometry.PROJECTILE.WAVE.bind(this)();

        const sv = this.tower.calc_range / this.tower.__tower_radius;

        // initialize timeline
        gsap.to(this.scale, {
            x: sv, y: sv, duration: .5,
            onComplete: () => {
                this.parent.removeChild(this);
            },
            callbackScope: this
        })

    }
}

class Laser extends Projectile{

}

// almost the same as bullet but has in-built on complete event (aoe) and no homing
class Bomb extends Projectile{

}

export {
    Projectile,
    Bullet,
    Laser,
    Bomb,
    Field
}