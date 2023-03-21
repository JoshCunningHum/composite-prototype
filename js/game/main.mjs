import { Map, Block} from "./map.mjs";
import { Apeira, Hexa, Penta, Quadra } from "./tower.mjs";
import { Engine, GameObject, Geometry, TextObject } from '../adapter.mjs';
import { Enemy } from "./enemy.mjs";
import { Wave } from "./wave.mjs";
import { gsap } from "../engine/GSAP/index.mjs";
import { Util } from "./util.mjs";

// Acts as the game loop
class Game{
    static defaults = {
        mapCols: 10,
        mapRows: 12,
        first_wave_time: 7,
        starting_money: 150,
        health: 20
    }

    static {
        const {mapCols, mapRows} = this.defaults;

        this.defaults.minPath = mapCols * mapRows / 3;
    }

    _health;

    get health(){
        return this._health;
    }

    set health(val){
        this._health = val;

        // change interface text
        const _int = this.get_i("ibase_healthCont");
        _int.children[0].text = val;
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

    // container direct access
    entities = [];
    towers = [];
    projectiles = [];
    effects = [];

    // game layers
    effects_plane = null;
    projectile_plane = null;
    tower_plane = null;
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
        if(this.__showing_mod_menu) return; // don't show anything when mod menu is open unless it is closed, char special

        const t = this.interfaces.find(f => f.label == label);
        if(t._igroup) this.interfaces.filter(f => f._igroup == t._igroup).forEach(i => i.hide());
    
        // sliding animation
        t.x = -this.width;
        t.show();

        const ox = t._iox ? t._iox : 0;

        gsap.to(t, {x: ox, duration: 0.5});
    }

    // also hides interface in the same group
    hide_i(label){
        const t = this.interfaces.find(f => f.label == label);
        if(t._igroup) this.interfaces.filter(f => f._igroup == t._igroup).forEach(i => i.hide());

        console.log(t);
    }

    get_i(label){
        return this.interfaces.find(f => f.label == label);
    }


    deselectAll(){
        this.map.deselectAll();
        this.towers.forEach(t => t.selected = false);
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

            // draw backgrounds in each menu
            m.beginFill(0x1c1c1c)
            .drawRect(0, 0, this.width, this.height)
            .endFill();
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

        this.enemy_plane = new GameObject("enemy_container");
        this.tower_plane = new GameObject("tower_container");
        this.effects_plane = new GameObject("effects_container");
        this.projectile_plane = new GameObject("projectile_container");

        const [
            _ep, _tp, _fxp, _pp
        ] = [this.enemy_plane, this.tower_plane, this.effects_plane, this.projectile_plane];

        // Initialize Map
        const map_dimensions = Array(2).fill(Math.min(this.width, this.height));
        map_dimensions[1] *= Game.defaults.mapRows / Game.defaults.mapCols;

        const _mapStartY = (this.height - map_dimensions[1]) / 4;

        this.map = new Map(
            ...map_dimensions,
            Game.defaults.mapCols, Game.defaults.mapRows
        )
        this.map.position.y = _mapStartY;
        this.map.game = this;

        // Initialize Enemy Container (position and size should be same as map)
        [_ep.width, _ep.height] = map_dimensions;
        _ep.position.y = _mapStartY;
        this.entities = this.enemy_plane.children;

        // Initialize Tower Container
        [_tp.width, _tp.height] = map_dimensions;
        _tp.position.y = _mapStartY;
        this.towers = this.tower_plane.children;

        // Initialize Effects Container
        [_fxp.width, _fxp.height] = map_dimensions;
        _fxp.position.y = _mapStartY;
        this.effects = this.effects_plane.children;
        
        // Initialize Projectile Container
        [_pp.width, _pp.height] = map_dimensions;
        _pp.position.y = _mapStartY;
        this.projectiles = this.projectile_plane.children;
        
        this.menu_game.addChild(this.map, _ep, _tp, _fxp, _pp);

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

            const detail_font_style = {
                fontFamily: "ISO",
                fontSize: font_size_detail,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
              };

            // Economy
            const e_moneyCont = new GameObject("ieco_mCont"),
                  e_moneyTxt = new TextObject("0", detail_font_style),
                  e_moneyIco = new GameObject("ieco_mIcon");

            e_moneyTxt.position.x = font_size_detail + 5;

            // TODO: PIXI Exlusive Geometry Used
            e_moneyIco.beginFill(0xfcba03)
            .drawEllipse(...Array(4).fill(font_size_detail / 2.5))
            .endFill();

            e_moneyIco.position.set(5, 5);

            e_moneyCont.addChild(e_moneyTxt, e_moneyIco);
            this._addInterface(e_moneyCont, this.menu_game);

            // TODO: Base
            const b_healthCont = new GameObject("ibase_healthCont"),
                  b_healthTxt = new TextObject("HEALTH", detail_font_style),
                  b_healthIco = new GameObject("ibase_healthIcon");

            b_healthTxt.position.x = font_size_detail + 5;

            // TODO: PIXI Exlusive Geometry Used
            b_healthIco.beginFill(0xff3030)
            .drawEllipse(...Array(4).fill(font_size_detail / 2.5))
            .endFill();

            b_healthIco.position.set(5, 5);

            b_healthCont.addChild(b_healthTxt, b_healthIco);
            b_healthCont.position.x = this.centerX(-50)[0];

            this._addInterface(b_healthCont, this.menu_game);

            // Tower Build Menu -------------------------
            const b_towerCont = new GameObject("ibuild_towerCont"),
                  b_towerA = new GameObject("ibuild_towerA"),
                  b_towerB = new GameObject("ibuild_towerB"),
                  b_towerC = new GameObject("ibuild_towerC"),
                  b_towerD = new GameObject("ibuild_towerD");

            const b_btndim = [ this.width / 4, this.map.blockHeight + 15],
                  b_btnHalf = b_btndim.map(e => e /= 2),
                  b_btnHalfN = b_btnHalf.map(e => -e),
                  b_cbtn = 0x333333;

            b_towerCont._igroup = "tower_management";
            b_towerCont.position.y = (this.height - map_dimensions[1]) / 2 + map_dimensions[1] + 2;

            // set button boxes
            b_towerA.beginFill(b_cbtn).drawRect(...b_btnHalfN, ...b_btndim);
            b_towerB.beginFill(b_cbtn).drawRect(...b_btnHalfN, ...b_btndim);
            b_towerC.beginFill(b_cbtn).drawRect(...b_btnHalfN, ...b_btndim);
            b_towerD.beginFill(b_cbtn).drawRect(...b_btnHalfN, ...b_btndim);

            // set button icons
            Geometry.TOWER.REG.bind(b_towerA)(this.map.blockWidth / 2, 4, "build");
            Geometry.TOWER.CIRCLE.bind(b_towerB)(this.map.blockWidth / 2, "build");
            Geometry.TOWER.REG.bind(b_towerC)(this.map.blockWidth / 2, 5, "build");
            Geometry.TOWER.REG.bind(b_towerD)(this.map.blockWidth / 2, 6, "build");

            // set button positions
            b_towerA.position.set(...b_btnHalf)
            b_towerB.position.set(b_btnHalf[0] + b_btndim[0], b_btnHalf[1]);
            b_towerC.position.set(b_btnHalf[0] + b_btndim[0] * 2, b_btnHalf[1]);
            b_towerD.position.set(b_btnHalf[0] + b_btndim[0] * 3, b_btnHalf[1]);

            // set button events
            b_towerA.eventMode = "static";
            b_towerB.eventMode = "static";
            b_towerC.eventMode = "static";
            b_towerD.eventMode = "static";
            b_towerA.onpointertap = () => this.buildTower("A");
            b_towerB.onpointertap = () => this.buildTower("B");
            b_towerC.onpointertap = () => this.buildTower("C");
            b_towerD.onpointertap = () => this.buildTower("D");

            b_towerCont.addChild(b_towerA, b_towerB, b_towerC, b_towerD);

            b_towerCont.hide();
            this._addInterface(b_towerCont, this.menu_game);

            // Tower Management Menu -------------------------
            const m_towerCont = new GameObject("iman_towerCont"),
                  m_towerMod = new GameObject("iman_towerMod"),
                  m_towerSell = new GameObject("iman_towerSell"),
                  m_towerUpg = new GameObject("iman_towerUpg");

            m_towerCont._igroup = "tower_management";
            m_towerCont.position.copyFrom(b_towerCont.position);

            const m_btndim = [ this.width / 3, this.map.blockHeight + 15],
                  m_btnHalf = m_btndim.map(e => e /= 2),
                  m_btnHalfN = m_btnHalf.map(e => -e),
                  m_cMod = 0x444444, m_cSell = 0x9b1111, m_cUpg = 0x10a524,
                  m_txtStyle = {
                    fontFamily: "ISO",
                    fontSize: font_size_detail,
                    stroke: "white",
                    strokeThickness: 1,
                    fill: "white",
                    align: "center"
                  };

            // set button boxes
            m_towerMod.beginFill(m_cMod).drawRect(...m_btnHalfN, ...m_btndim).endFill();
            m_towerSell.beginFill(m_cSell).drawRect(...m_btnHalfN, ...m_btndim).endFill();
            m_towerUpg.beginFill(m_cUpg).drawRect(...m_btnHalfN, ...m_btndim).endFill();

            // set button texts
            const m_towerModTxt = new TextObject("MOD", m_txtStyle),
                  m_towerSellTxt = new TextObject("SELL", m_txtStyle),
                  m_towerUpgTxt = new TextObject("UPGRADE", m_txtStyle);

            m_towerModTxt.anchor.set(0.5, 0.5);
            m_towerSellTxt.anchor.set(0.5, 0.5);
            m_towerUpgTxt.anchor.set(0.5, 0.5);

            m_towerMod.addChild(m_towerModTxt);
            m_towerSell.addChild(m_towerSellTxt);
            m_towerUpg.addChild(m_towerUpgTxt);

            // set button positions
            m_towerUpg.position.set(...m_btnHalf)
            m_towerMod.position.set(m_btnHalf[0] + m_btndim[0], m_btnHalf[1]);
            m_towerSell.position.set(m_btnHalf[0] + m_btndim[0] * 2, m_btnHalf[1]);

            // set button events
            m_towerMod.eventMode = "static";
            m_towerSell.eventMode = "static";
            m_towerUpg.eventMode = "static";
            m_towerSell.onpointertap = () => this.sellTower();
            // TODO: MOD MENU HERE
            m_towerMod.onpointertap = () => {
                this.setModMenuElements();
                this.show_i("imod_menu");
                this.__showing_mod_menu = true;
            }
            m_towerUpg.onpointertap = () => this.upgradeTower();

            m_towerCont.addChild(m_towerUpg, m_towerMod, m_towerSell);

            m_towerCont.hide();
            this._addInterface(m_towerCont, this.menu_game);
        }

        // MOD Interface (it's so big, that's what she said)
        {
            const mod_menu = new GameObject("imod_menu"),
                  exit = new TextObject("❌", {});

            const menu_padding = 20;

            mod_menu._igroup = "tower_management";

            // TODO: PIXI EXCLUSIVE DRAW
            mod_menu.beginFill(0x333333, 0.75)
            .drawRect(
                menu_padding, menu_padding,
                this.width - menu_padding * 2, this.height - menu_padding * 2
            ).beginFill();

            // Position elements
            exit.anchor.set(0.5, 0.5);
            exit.position.set(...Array(2).fill(menu_padding * 2));
            exit.position.x = this.width - menu_padding * 2;

            // Element Events
            exit.eventMode = "static";
            exit.onpointertap = () => {
                this.hide_i("imod_menu");
                this.__showing_mod_menu = false;
                this.deselectAll();
            }

            mod_menu.addChild(exit);

            // mod_menu.hide();
            this._addInterface(mod_menu, this.menu_game);
        }
    }

    __mod_menu = {
        type: null, // container for the graphics later
        stats: {
            atk: null,
            spd: null,
            rng: null,
            trg: null,
            apr: null,
            lvl: null,
            cap: null
        },

    }

    // base on selected tower
    setModMenuElements(){

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
            this.health = defs.health;

            this.showMenu("menu_mapPreload");

            // Generate Map
            this.map.removeChildren();
            let gen_map = Map.gen(defs.mapCols, defs.mapRows);
            while(gen_map.path_length < defs.minPath) gen_map = Map.gen(defs.mapCols, defs.mapRows);
            this.map.setFromAscii(gen_map.ascii, gen_map.char_map);


            // Add on dmg event
            this.base_block.dmg = (obj) => {
                this.damage(obj.dmg);
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
        // console.log(delta * 1000);

        // get on countdown wave to reduce time then start spawning
        if(this.wave) this.wave_countdown = this.wave.reduce(delta);

        // get all towers to start shootin
        this.towers.forEach(t => {
            t.check(delta);
        })

        // make all projectiles do their thin (homing/follow)
        this.projectiles.forEach(p => {
            p.tick();
        })
    }

    

    _stop(){
        Engine.removeEvent("tick", this._loop);
    }

    
    // Game related methods

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

    hasTowerAtBlock(x, y){
        if(x instanceof Block) [x, y] = x.mapPos;
        return this.towers.some(t => t.mx == x && t.my == y);
    }

    buildTower(type){
        let Tower = null;

        const selected = this.map.selectedBlock;
        
        switch(type){
            case "A":
                Tower = Quadra;
                break;
            case "B":
                Tower = Apeira;
                break;
            case "C":
                Tower = Penta;
                break;
            case "D":
                Tower = Hexa;
                break;
        }

        // check for cost
        if(this.money < Tower.cost){
            // TODO: Add animation/indication that says no money

            return;
        }

        const t = new Tower({block: selected});

        t.game = this;
        t._initTower();

        // add tower to tower plane
        this.tower_plane.addChild(t);
        this.money -= Tower.cost;

        // close all interface and deselect all blocks
        this.hide_i("ibuild_towerCont");
        this.map.deselectAll();
    }

    // used for homing purposes
    addProjectile(Projectile, tower, target){
        // projectile here is the class
        const p = new Projectile(tower, target);
        p._initProjectile();
        this.projectile_plane.addChild(p);
    }

    addEffect(effect){
        this.effects_plane.addChild(effect);
    }

    upgradeTower(){
        const t = this.towers.find(t => t.selected);
        if(t == null) return;
        this.deselectAll();
        if(t.upgrade_cost > this.money) return;
        this.money -= t.upgrade_cost;
        t.lvl++;
    }

    sellTower(){
        const t = this.towers.find(t => t.selected);
        console.log("TEST");
        if(t == null) return;
        const value = t.sell();
        console.log(value);
        this.addMoney(value);
    }

    damage(value){
        this.health -= value;
    }

    getEnemiesAtRange(minX, minY, maxX, maxY){
        return this.entities.filter(e => {
            return Util.isInBound(minX, maxX, e.x) && Util.isInBound(minY, maxY, e.y);
        })
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