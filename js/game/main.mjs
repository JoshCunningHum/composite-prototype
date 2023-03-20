import { Map, Block} from "./map.mjs";
import { Tower } from "./tower.mjs";
import { Engine, GameObject, TextObject } from '../adapter.mjs';
import { Enemy } from "./enemy.mjs";
import { Wave } from "./wave.mjs";
import { gsap } from "../engine/GSAP/index.mjs";

// Acts as the game loop
class Game{
    static defaults = {
        mapCols: 10,
        mapRows: 12,
        first_wave_time: 7,
        starting_money: 50,
        health: 20
    }

    static {
        const {mapCols, mapRows} = this.defaults;

        this.defaults.minPath = mapCols * mapRows / 3;
    }
    
    map = null;

    m = {};
    menus = [];

    i = {};
    interfaces = [];

    /**
     * 
     * @param {GameObject} infc the interface to be added
     */
    _addInterface(infc, menu){
        this.interfaces.push(infc);
        this.i[infc.label] = infc;

        if(!menu) return;
        menu.addChild(infc);
    }

    // contain enemies
    entities = [];
    enemy_plane = null;

    /* Quick Getters */
    get base_block(){
        return this.map.findCell(cell => cell.label == "Base");
    }

    get menu_main(){
        return this.menus.find(e => e.label == "menu_Main");
    }

    get menu_game(){
        return this.menus.find(e => e.label == "menu_Game");
    }

    // GSAP Timeline
    tl = null;

    /**
     * 
     * @param {HTMLElement} container A container on where to display the game
     * @param {Number} width Display width in pixel
     * @param {Number} height Display height in pixel
     */
    constructor(container, width, height){

        // Initialize Engine 
        width ??= container.clientWidth;
        height ??= container.clientHeight;
        [this.width, this.height] = [width, height]

        Engine._init({
            container: container,
            width: this.width,
            height: this.height
        });

        this.tl = gsap.timeline({
            autoRemoveChildren: true
        })
    }

    get center(){
        return [this.width / 2, this.height / 2];
    }

    centerY(val){
        const c = this.center;
        c[1] += val;
        return c;
    }

    centerX(val){
        const c = this.center;
        c[0] += val;
        return c;
    }

    centerMod(x, y){
        const c = this.center;
        c[0] += x;
        c[1] += y;
        return c;
    }

    // doesn't need hide, since menus act like scenes
    showMenu(label){
        this.menus.forEach(m => m.visible = false);
        this.menus.find(m => m.label == label).show();
    }

    show_i(label){
        const t = this.interfaces.find(f => f.label == label);
        if(t._igroup) this.interfaces.filter(f => f._igroup == t._igroup).forEach(i => i.hide());
        t.show();
    }

    // also hides interface in the same group
    hide_i(label){
        const t = this.interfaces.find(f => f.label == label);
        if(t._igroup) this.interfaces.filter(f => f._igroup == t._igroup).forEach(i => i.hide());
        t.hide();
    }

    get_i(label){
        return this.interfaces.find(f => f.label == label);
    }

    // Initialization
    _init(){
        
        // Initialize local saved values (like settings etc)

        // Initialize Menus (Navigates the game and also additional interfaces)
        this.menus.push(...[
            new GameObject("menu_Main"),
            new GameObject("menu_Game"),
            new GameObject("menu_mapPreload")
        ])
        
        this.menus.forEach(m => {
            Engine.scene.addChild(m);
            this.m[m.label.split("_")[1]] = m;
        });

        // Main Menu
        {
            const btn_width = 200,
                  btn_height = 50;

            const btn_start_cont = new GameObject("btn_start");
            // TODO: PIXI EXLUSIVE USAGE
            btn_start_cont.beginFill(0xffffff)
            .drawRect(0, 0, btn_width, btn_height)
            .endFill();

            btn_start_cont.beginFill(0x1c1c1c)
            .drawRect(1, 1, btn_width - 2, btn_height - 2)
            .endHole();
            //

            const btn_start = new TextObject("START", {
                fontFamily: "ISO",
                fontSize: 30,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            })

            btn_start_cont.centerPutAt(...this.centerY(this.width / 3));
            
            btn_start.anchor.x = 0.5;
            btn_start.anchor.y = 0.5;
            btn_start.position.set(...btn_start_cont.center);

            btn_start_cont.addChild(btn_start);

            const title = new TextObject("COMPOSITE", {
                fontFamily: "AMGDT",
                fontSize: 50,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            });

            title.anchor.x = 0.5;
            title.anchor.y = 0.5;
            title.position.set(...this.centerY(-this.width / 3));

            this.menu_main.addChild(btn_start_cont, title);

            // event
            // TODO: From here on, all are PIXI Exlusive usage
            btn_start_cont.eventMode = "static";
            btn_start_cont.onpointertap = () => {
                this._start();
            }
        }

        // Map Preloader
        {
            const preload_text = new TextObject("Generating Map", {
                fontFamily: "ISO",
                fontSize: 25,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            })

            preload_text.position.set(...this.center);
            preload_text.anchor.set(0.5, 0.5);

            this.m.mapPreload.addChild(preload_text);
        }

        this.showMenu("menu_Main");

        // TODO: Interfaces here (Should always be at last of the Engine.scene so it always shown, basically higher z-index)

        
        // Initialize Map
        const map_dimensions = Array(2).fill(Math.min(this.width, this.height));
        map_dimensions[1] *= Game.defaults.mapRows / Game.defaults.mapCols;

        this.map = new Map(
            ...map_dimensions,
            Game.defaults.mapCols, Game.defaults.mapRows
        )
        this.map.position.y = (this.height - map_dimensions[1]) / 4;

        // Initialize Enemy Container (position and size should be same as map)
        this.enemy_plane = new GameObject("enemy_container");
        const _ep = this.enemy_plane;
        [_ep.width, _ep.height] = map_dimensions;
        _ep.position.y = (this.height - map_dimensions[1]) / 4;
        this.entities = this.enemy_plane.children;


        this.menu_game.addChildAt(_ep, 0);
        this.menu_game.addChildAt(this.map, 0);


        // Interfaces (mostly inside the game menu)
        {
            const font_size_btn = 25,
                  font_size_detail = 20;

            // Wave Details
            const w_ctCont = new GameObject("iwave_ctCont"),
                  w_ctBar = new GameObject("iwave_ctBar"),
                  w_ctSkip = new TextObject("SKIP", {
                    fontFamily: "ISO",
                    fontSize: font_size_btn,
                    stroke: "white",
                    strokeThickness: 1,
                    fill: "white",
                    align: "center"
                  });

            
            // TODO: PIXI Exlusive Geometry Used
            w_ctBar.beginFill(0xee1010)
            .drawRect(0, 0, this.width, 4)
            .endFill();
            w_ctSkip.position.y -= font_size_btn + 5;
            w_ctCont.position.y = (this.height - map_dimensions[1]) / 2 - 4;

            w_ctSkip.eventMode = "static";
            w_ctSkip.onpointertap = () => {
                if(this.wave) this.addMoney(this.wave.skip());
            }

            w_ctCont.addChild(w_ctBar, w_ctSkip);

            this._addInterface(w_ctCont, this.menu_game);

            // Economy
            const e_moneyCont = new GameObject("ieco_mCont"),
                  e_moneyTxt = new TextObject("0", {
                    fontFamily: "ISO",
                    fontSize: font_size_detail,
                    stroke: "white",
                    strokeThickness: 1,
                    fill: "white",
                    align: "center"
                  }),
                  e_moneyIco = new GameObject("ieco_mIcon");

            e_moneyTxt.position.x = font_size_detail + 5;

            // TODO: PIXI Exlusive Geometry Used
            e_moneyIco.beginFill(0xfcba03)
            .drawEllipse(...Array(4).fill(font_size_detail / 2.5))
            .endFill();

            e_moneyIco.position.set(5, 5);

            e_moneyCont.addChild(e_moneyTxt, e_moneyIco);

            this._addInterface(e_moneyCont, this.menu_game);
        }

        // DEV



    }

    // Waves
    wave = null; // Not spawning enemies
    wc = 0; // wave count (Number of waves)
    wt = null; // time left for another wave
    wct = null; // time countdown for the wave to begin spawning
    enemy_queue; // enemy spawn queues

    get wave_count(){
        return this.wc;
    }

    set wave_count(val){
        this.wc = val;
        // modify text object content here
    }

    get wave_countdown(){
        return this.wct;
    }

    set wave_countdown(val){
        this.wct = val;

        if(!this.wave) return;
        // change object here
        const owct = this.wave.oleft,
              i_wave = this.get_i("iwave_ctCont");
        i_wave.getChildAt(0).scale.x = val / owct;

        i_wave.getChildAt(1).text = `SKIP (${Math.floor(this.wave.currentSkipValue)})`;

        if(val <= 0) i_wave.hide();
        else i_wave.show();
    }

    test = null;

    _start(){
        const defs = Game.defaults;

        // Reset values
        {
            this.money = defs.starting_money; // reset money

            this.showMenu("menu_mapPreload");

            // Generate Map
            this.map.removeChildren();
            let gen_map = Map.gen(defs.mapCols, defs.mapRows);
            while(gen_map.path_length < defs.minPath) gen_map = Map.gen(defs.mapCols, defs.mapRows);
            this.map.setFromAscii(gen_map.ascii, gen_map.char_map);


            // Add on dmg event
            this.base_block.dmg = (obj) => {
                // do dmg on the base
                // obj being the enemy
                console.log(`Base dmg by: ${obj.dmg}`);
            }
        }
        
        // Show Game Menu
        this.showMenu("menu_Game");


        // Initialize First Wave
        this.wave = new Wave({
            left: defs.first_wave_time, 
            queue: Wave.eqs.A, 
            skipValue: 20,
            game: this,
        })
        
        // Start Loop
        Engine.addEvent("tick", this._loop, this);
        this._tickTime = 0;
    }

    _waveDone(){
        // initiates creation of another wave, resetting wave timer
        console.log("Wave is done!");
        this.wave = null;
    }

    // Loop (Add this to engine tick event)
    // Only handle game events, not rendering, as the engine does that
    _loop(delta){
        // get on countdown wave to reduce time then start spawning
        if(this.wave) this.wave_countdown = this.wave.reduce(delta);
    }

    

    _stop(){
        Engine.removeEvent("tick", this._loop);
    }

    
    _addEnemy(...objs){
        objs.forEach(o => o.game = this);
        this.enemy_plane.addChild(...objs);
    }

    t_money = 0;

    get money(){
        return this.t_money;
    }

    set money(val){
        this.t_money = val;

        // change object
        const i_money = this.get_i("ieco_mCont");

        i_money.getChildAt(0).text = Math.floor(val);
    }

    addMoney(val){
        this.money += val;
    }

    addArcane(val){
        // Permanent Upgrade Currency
    }
}

export {
    Game
}