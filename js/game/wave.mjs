import {
    Enemy
} from './enemy.mjs';

// Contains information on enemy management and timings
class Wave{
    // Add more wave types
    static eqs = {};

    static {
        this.eqs.A = [];

        for(let i = 0; i < 15; i++){
            const eg = [Enemy.types.A.clone, 1];
            eg[0].spawnLeft = i;
            this.eqs.A.push(eg);
        }
    }
    

    left; // time left to start wave
    enemyQueue = []; // Enemy queue and when they will spawn (contains time until spawn)
    skipValue; // Money gained when skipping

    spawning = false; // dictates wether wave is now on spawning

    get longestSpawn(){
        return this.enemyQueue.reduce((l, c) => {
            if(l.spawnleft < c.spawnleft) l = c;
        }, this.enemyQueue[0])
    }

    constructor({
        left,
        queue,
        skipValue,
        game // game instance
    }){
        this.left = left,
        this.oleft = left; // original left time
        
        // queue contains [enemy type, quantity] each
        queue.forEach(q => this.enemyQueue.push(...Array(q[1]).fill(0).map(e => q[0].clone)));

        console.log(this.enemyQueue.map(e => e.spawnLeft));

        this.skipValue = skipValue;
        
        this.game = game;
    }

    // time is in ms
    reduce(time){
        time /= 1000;

        this.left -= time;
        if(this.left < 0) this.spawning = true;
        this.tickSpawn(time);

        return this.left;
    }

    tickSpawn(time){    

        if(!this.spawning) return; // Don't spawn if not spawning dugh
        if(this.enemyQueue.length == 0) this.game._waveDone();
        this.enemyQueue.forEach((e, i) => {
            e.spawnLeft -= time;
            if(e.spawnLeft > 0) return;
            this.game._addEnemy(e);
            e.spawn(this.game.map.path);
            this.enemyQueue.splice(i, 1);
        })
        
    }

    get currentSkipValue(){
        return this.skipValue * this.left / this.oleft;
    }

    // also returns skip value to be added in the economy
    skip(){
        // sets time left to countdown to 0
        const tl = this.currentSkipValue;
        this.left = 0;
        return tl;
    }
}  

export {
    Wave
}