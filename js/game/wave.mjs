import {
    Enemy
} from './enemy.mjs';

// Contains information on enemy management and timings
class Wave{
    // Add more wave types
    static eqs = {
        A: [],
        B: [],
        C: [],
        D: [],
        MINI: [],
        BOSS: []
    };

    static {

        for(let i = 0; i < 15; i++){
            const eg = Enemy.types.A.clone;
            eg.spawnLeft = i;
            this.eqs.A.push(eg);
        }

        for(let i = 0; i < 10; i++){
            const eg = Enemy.types.B.clone;
            eg.spawnLeft = i;
            this.eqs.B.push(eg);
        }

        for(let i = 0; i < 7; i++){
            const eg = Enemy.types.C.clone;
            eg.spawnLeft = i;
            this.eqs.C.push(eg);
        }

        for(let i = 0; i < 3; i++){
            const eg = Enemy.types.D.clone;
            eg.spawnLeft = i;
            this.eqs.D.push(eg);
        }

        for(let i = 0; i < 1; i++){
            const eg = Enemy.types.MINI.clone;
            eg.spawnLeft = i * 10;
            this.eqs.MINI.push(eg);
        }

        for(let i = 0; i < 1; i++){
            const eg = Enemy.types.BOSS.clone;
            eg.spawnLeft = i * 20;
            this.eqs.BOSS.push(eg);
        }
    }

    static getWave(waveNum){
        // cycles through waves but have elevated stats each cycle (10 waves)
        const c = waveNum % 10, cn = Math.ceil(waveNum / 10),       
              amount_mult = (4 * Math.log(cn) + 1) * (4 * Math.log(cn) / 40) + 1,
              g_enemies = [];

        let amount_buffer = 0,
            enemy_buffer = null, type = null, cs_wait = 0;

        switch(c){
            case 1:
                type = "A";
                amount_buffer = Math.ceil(this.eqs[type].length * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i;
                    return enemy;
                }))
                break;
            case 2:
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i;
                    return enemy;
                }))
                break;
            case 3:
                type = "A";
                amount_buffer = Math.ceil(this.eqs[type].length/2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2;
                    return enemy;
                }))

                type = "C";
                amount_buffer = Math.ceil(this.eqs[type].length * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                break;
            case 4:
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length/2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2;
                    return enemy;
                }))
                
                type = "D";
                amount_buffer = Math.ceil(this.eqs[type].length * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                break;
            case 5:
                type = "D";
                amount_buffer = Math.ceil(this.eqs[type].length / 4 * 3 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2
                    return enemy;
                }))

                cs_wait = amount_buffer;
                
                type = "MINI";
                amount_buffer = Math.ceil(this.eqs[type].length * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + cs_wait;
                    return enemy;
                }))

                // mini boss
                break;
            case 6:

                type = "A";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i;
                    return enemy;
                }))

                
                type = "C";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                break;
            case 7:
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i;
                    return enemy;
                }))

                type = "D";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                break;
            case 8:
                type = "A";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.5 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2;
                    return enemy;
                }))

                type = "C";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.3 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2 + 0.2;
                    return enemy;
                }))
                break;
            case 9:
                type = "C";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.3 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2 + 0.2;
                    return enemy;
                }))
                
                type = "D";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.5 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))

                cs_wait = amount_buffer;

                type = "MINI";
                amount_buffer = Math.ceil(this.eqs[type].length*1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + cs_wait;
                    return enemy;
                }))

                break;
            case 0: // boss
                type = "A";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.5 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2;
                    return enemy;
                }))
                    
                type = "C";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.3 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))
                
                type = "B";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.2 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i * 2 + 0.2;
                    return enemy;
                }))

                cs_wait += amount_buffer;
                
                type = "D";
                amount_buffer = Math.ceil(this.eqs[type].length * 1.5 * amount_mult);
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                g_enemies.push(...Array(amount_buffer).fill(0).map((b, i) => {
                    const enemy = enemy_buffer.clone;
                    enemy.spawnLeft = i + amount_buffer;
                    return enemy;
                }))

                type = "BOSS";
                amount_buffer = 1; // always for boss
                enemy_buffer = this.eqs[type][0].clone.multStat(cn);

                enemy_buffer.spawnLeft = cs_wait + 1;
                g_enemies.push(enemy_buffer.clone);

                break;
        }

        return g_enemies;
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
        this.enemyQueue = queue;

        console.log(this.enemyQueue.map(e => e.spawnLeft));

        this.skipValue = skipValue;
        
        this.game = game;
    }

    // time is in ms
    reduce(time){
        time /= 1000;

        this.left -= time;
        if(this.left < 0){
            if(!this.spawning) this.game.wave_count++;
            this.spawning = true;
        }
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