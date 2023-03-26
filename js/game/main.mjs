import { Map, Block} from "./map.mjs";
import { Apeira, Hexa, Penta, Quadra } from "./tower.mjs";
import { Engine, GameObject, Geometry, TextObject } from '../adapter.mjs';
import { Enemy } from "./enemy.mjs";
import { Wave } from "./wave.mjs";
import { gsap } from "../engine/GSAP/index.mjs";
import { Util } from "./util.mjs";
import { Text } from "../engine/PIXI/pixi.mjs";
import { Mod } from "./mod.mjs";

// Acts as the game loop
class Game{
    static defaults = {
        mapCols: 10,
        mapRows: 12,
        first_wave_time: 7,
        starting_money: 150,
        health: 20
    }

    // graphic defaults
    static g = {
        max_mod_per_page: 8
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
        _int.children[0].text = `❤️ ${val}`;
    }
    
    map = null;

    m = {};
    menus = [];

    i = {};
    interfaces = [];

    // mod collection available
    mods = [];

    /**
     * 
     * @param {GameObject} infc the interface to be added
     */
    _addInterface(infc, menu){
        this.interfaces.push(infc);
        this.i[infc.label] = infc;

        infc.game = this;
        infc._iox = infc.x;
        infc._ioy = infc.y;

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

    get selected_tower(){
        return this.towers.find(t => t.selected);
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
            sortChildren: false, 
            defaults: {
                duration: .5,
                overwrite: false,
                delay: 0

            }, 
            autoRemoveChildren: true, 
            id:"game_timeline", 
            smoothChildTiming: true
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
        t.y = this.height;
        t.show();

        const oy = t._ioy ? t._ioy : 0;

        gsap.to(t, {y: oy, duration: 0.5});
    }

    // also hides interface in the same group
    hide_i(label){
        const t = this.interfaces.find(f => f.label == label);
        if(t._igroup) this.interfaces.filter(f => f._igroup == t._igroup).forEach(i => i.hide());
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

        console.log(gsap.globalTimeline, this.tl);
        
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

        this.enemy_plane.game = this;
        this.tower_plane.game = this;
        this.effects_plane.game = this;
        this.projectile_plane.game = this;

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
            const wave_font_style = {
                fontFamily: "ISO",
                fontSize: font_size_btn,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            }

            const w_ctCont = new GameObject("iwave_ctCont"),
                  w_ctBar = new GameObject("iwave_ctBar"),
                  w_ctSkip = new TextObject("SKIP", wave_font_style),
                  w_waveCount = new TextObject("", wave_font_style);

            
            // TODO: PIXI Exlusive Geometry Used
            w_ctBar.beginFill(0xee1010)
            .drawRect(0, 0, this.width, 4)
            .endFill();
            w_ctSkip.position.y -= font_size_btn + 5;
            w_ctCont.position.y = (this.height - map_dimensions[1]) / 2 - 4;

            w_ctSkip.eventMode = "static";
            w_ctSkip.onpointertap = () => {
                if(!this.wave) return;
                this.addMoney(this.wave.skip());
                this.wave_countdown = this.wave.reduce(0);
            }

            this.__wave_count_object = w_waveCount;

            w_waveCount.anchor.set(0.5, 0.5);
            w_waveCount.position.set(...this.centerY(-this.height/2.5))

            w_ctCont.addChild(w_ctBar, w_ctSkip);

            this._addInterface(w_ctCont, this.menu_game);
            this.menu_game.addChild(w_waveCount);

            const detail_font_style = {
                fontFamily: "ISO",
                fontSize: font_size_detail,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
              };

            // Speed Control
            const s_cont = new GameObject("ispeed_cont"),
                  s_mult = new GameObject("ispeed_mult"),
                  s_multTxt = new TextObject("x1", detail_font_style),
                  s_toggle = new GameObject("ispeed_toggle"),
                  s_toggleTxt = new Text("▐ ▌", detail_font_style);

            s_multTxt.anchor.set(0.5, 0.5);
            s_toggleTxt.anchor.set(0.5, 0.5);

            s_toggleTxt.scale.set(.7, .7);


            s_mult.addChild(s_multTxt);
            s_toggle.addChild(s_toggleTxt);

            const s_box = font_size_detail * 1.75,
            s_btnDim = [
                ...Array(2).fill(-s_box / 2),
                ...Array(2).fill(s_box)
            ], s_btnHole = [
                ...Array(2).fill(s_btnDim[0] + 1),
                ...Array(2).fill(s_btnDim[2] - 2)
            ];

            s_mult.position.x += s_box + 5;

            // TODO: PIXI EXLUSIVE DRAWING
            s_mult.beginFill(0xffffff).drawRect(...s_btnDim).endFill();
            s_mult.beginFill(0x1C1C1C).drawRect(...s_btnHole).endHole();

            s_toggle.beginFill(0xffffff).drawRect(...s_btnDim).endFill();
            s_toggle.beginFill(0x1C1C1C).drawRect(...s_btnHole).endHole();

            s_mult.eventMode = "static";
            s_toggle.eventMode = "static";

            this.speed_mult = 1;
            this.paused = false;

            s_mult.onpointertap = () => {
                switch(this.speed_mult){
                    case 1:
                        s_multTxt.text = "x2";
                        this.speed_mult = 2;
                        break;
                    case 2:
                        s_multTxt.text = "x4";
                        this.speed_mult = 4;
                        break;
                    case 4:
                        s_multTxt.text = "x1";
                        this.speed_mult = 1;
                        break;
                }
            }

            s_toggle.onpointertap = () => {
                if(this.paused){
                    s_toggleTxt.text = "▐ ▌";
                    s_toggleTxt.scale.set(0.7, 0.7);
                    this.paused = false;
                }else{
                    s_toggleTxt.text = "►";
                    s_toggleTxt.scale.set(1, 1);
                    this.paused = true;
                }
            }

            s_cont.addChild(s_toggle, s_mult);

            s_cont.position.x = this.width - s_box * 2 + 5;
            s_cont.position.y = (this.height - map_dimensions[1]) / 2 - s_box;

            this._addInterface(s_cont, this.menu_game);

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

            const b_healthCont = new GameObject("ibase_healthCont"),
                  b_healthTxt = new TextObject("HEALTH", detail_font_style);

            b_healthCont.addChild(b_healthTxt);
            b_healthCont.position.x = this.centerX(-50)[0];

            this._addInterface(b_healthCont, this.menu_game);

            // Tower Build Menu -------------------------
            const b_towerCont = new GameObject("ibuild_towerCont"),
                  b_towerA = new GameObject("ibuild_towerA"),
                  b_towerB = new GameObject("ibuild_towerB"),
                  b_towerC = new GameObject("ibuild_towerC"),
                  b_towerD = new GameObject("ibuild_towerD"),

                  b_towerAC = new TextObject(Quadra.cost, detail_font_style),
                  b_towerBC = new TextObject(Apeira.cost, detail_font_style),
                  b_towerCC = new TextObject(Penta.cost, detail_font_style),
                  b_towerDC = new TextObject(Hexa.cost, detail_font_style);

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
            Geometry.TOWER.REG.bind(b_towerA)(this.map.blockWidth / 1.75, 4, "build");
            Geometry.TOWER.CIRCLE.bind(b_towerB)(this.map.blockWidth / 1.75, "build");
            Geometry.TOWER.REG.bind(b_towerC)(this.map.blockWidth / 1.75, 5, "build");
            Geometry.TOWER.REG.bind(b_towerD)(this.map.blockWidth / 1.75, 6, "build");

            b_towerAC.anchor.set(0.5, 0.5);
            b_towerBC.anchor.set(0.5, 0.5);
            b_towerCC.anchor.set(0.5, 0.5);
            b_towerDC.anchor.set(0.5, 0.5);

            b_towerA.addChild(b_towerAC);
            b_towerB.addChild(b_towerBC);
            b_towerC.addChild(b_towerCC);
            b_towerD.addChild(b_towerDC);

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
            const m_towerModTxt = new TextObject("🛠️ MOD", m_txtStyle),
                  m_towerSellTxt = new TextObject("SELL", m_txtStyle),
                  m_towerUpgTxt = new TextObject("↑", m_txtStyle);

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
            const menu_padding = 20,
                  top_section = 200,
                  st_style = {
                    fontFamily: "ISO",
                    fontSize: 15,
                    stroke: "white",
                    strokeThickness: 1,
                    fill: "white",
                    align: "center"
                  }

            const mod_menu = new GameObject("imod_menu"),
                  exit = new TextObject("❌", {}),
                  type = new GameObject("imod_typeCont"),
                  statCont = new GameObject("imod_statCont"),

                  mod_cont = new GameObject("imod_modCont"),

                  equipped = new GameObject("imod_equipped"),
                  avail = new GameObject("imod_avail"),

                  av_prev = new GameObject("imod_avPrev"),
                  av_next = new GameObject("imod_avNext"),
                  av_prevTxt = new TextObject("▲", st_style),
                  av_nextTxt = new TextObject("▼", st_style),

                  eq_prev = new GameObject("imod_eqPrev"),
                  eq_next = new GameObject("imod_eqNext"),
                  eq_prevTxt = new TextObject("▲", st_style),
                  eq_nextTxt = new TextObject("▼", st_style),

                  st_atk = new TextObject("ATK ", st_style),
                  st_spd = new TextObject("SPD ", st_style),
                  st_rng = new TextObject("RNG ", st_style),
                  st_trg = new TextObject("TRG ", st_style),
                  st_pen = new TextObject("PEN ", st_style),
                  st_cap = new TextObject("CAP ", st_style),
                  st_lvl = new TextObject("LVL ", {
                    fontFamily: "ISO",
                    fontSize: 20,
                    stroke: "white",
                    strokeThickness: 1,
                    fill: "white",
                    align: "center"
                  });

            mod_menu._igroup = "tower_management";

            // TODO: PIXI EXCLUSIVE DRAW
            mod_menu.beginFill(0x333333, 0.9)
            .drawRect(
                menu_padding, menu_padding,
                this.width - menu_padding * 2, this.height - menu_padding * 2
            ).beginFill();

            
            // Position elements
            exit.anchor.set(0.5, 0.5);
            exit.position.set(...Array(2).fill(menu_padding * 2));
            exit.position.x = this.width - menu_padding * 2;

            type.position.set(...Array(2).fill(menu_padding * 2 + 30));
            type.position.y += 60;
            type.position.x += 50;
            statCont.position.set(...Array(2).fill(menu_padding * 2));
            statCont.position.x = this.width / 2;

            const st_lineHeight = st_style.fontSize + 10;

            st_lvl.position.x = this.width / 8;

            st_atk.position.y = 10 + st_lineHeight;
            st_spd.position.y = 10 + st_lineHeight * 2;
            st_rng.position.y = 10 + st_lineHeight * 3;
            st_trg.position.y = 10 + st_lineHeight * 4;
            st_pen.position.y = 10 + st_lineHeight * 5;

            // create mod layout
            const mod_cont_dim = [
                this.width / 2 - menu_padding * 2, 
                mod_menu.height - (top_section + menu_padding * 3.5)
            ], mod_nav_dim = [mod_cont_dim[0], 50],
               mod_list_dim = [mod_cont_dim[0], mod_cont_dim[1] - mod_nav_dim[1] ]

            console.log(mod_cont_dim);

            mod_cont.beginFill(0x333333)
            .drawRect(0, 0, mod_cont_dim[0] + mod_nav_dim[0], mod_cont_dim[1] + mod_nav_dim[1])
            .endFill();

            mod_cont.position.y = top_section + menu_padding;
            mod_cont.position.x = menu_padding * 2;

            equipped.position.y = mod_nav_dim[1];

            avail.position.y = mod_nav_dim[1];
            avail.position.x = mod_cont.width / 2;

            st_cap.anchor.set(0.5, 0.5);
            st_cap.position.x = this.width / 4 - menu_padding;
            st_cap.position.y = -menu_padding / 1.5;
            

            av_prev.beginFill(0x222222).drawRect(0, 0, ...mod_nav_dim).endFill();
            av_prev.beginFill(0x383838).drawRect(3, 3, ...mod_nav_dim.map(e => e -= 6));

            av_next.beginFill(0x222222).drawRect(0, 0, ...mod_nav_dim).endFill();
            av_next.beginFill(0x383838).drawRect(3, 3, ...mod_nav_dim.map(e => e -= 6));

            eq_prev.beginFill(0x222222).drawRect(0, 0, ...mod_nav_dim).endFill();
            eq_prev.beginFill(0x383838).drawRect(3, 3, mod_nav_dim[0] - 3, mod_nav_dim[1] - 6);

            eq_next.beginFill(0x222222).drawRect(0, 0, ...mod_nav_dim).endFill();
            eq_next.beginFill(0x383838).drawRect(3, 3, mod_nav_dim[0] - 3, mod_nav_dim[1] - 6);

            equipped.beginFill(0x555555, 0.9).drawRect(0, 0, ...mod_list_dim).endFill();
            avail.beginFill(0x444444, 0.9).drawRect(0, 0, ...mod_list_dim).endFill();

            // mod navigation
            eq_next.y += mod_cont.height - mod_nav_dim[1];
            av_prev.x += mod_cont.width / 2;
            av_next.position.set(av_prev.x, eq_next.y);
            

            av_prev.addChild(av_prevTxt);
            av_next.addChild(av_nextTxt);
            eq_prev.addChild(eq_prevTxt);
            eq_next.addChild(eq_nextTxt);
            
            av_prevTxt.anchor.set(0.5, 0.5);
            av_nextTxt.anchor.set(0.5, 0.5);
            eq_prevTxt.anchor.set(0.5, 0.5);
            eq_nextTxt.anchor.set(0.5, 0.5);

            av_prevTxt.position.set(...av_prev.center);
            av_nextTxt.position.set(...av_next.center);
            eq_prevTxt.position.set(...eq_prev.center);
            eq_nextTxt.position.set(...eq_next.center);

            // mod nav events
            av_prev.eventMode = "static";
            av_next.eventMode = "static";
            eq_prev.eventMode = "static";
            eq_next.eventMode = "static";

            av_prev.tint = 0x888888;
            av_next.tint = 0x888888;
            eq_prev.tint = 0x888888;
            eq_next.tint = 0x888888;

            av_prev.onpointertap = () => {
                const m = this.__mod_menu;
                m.mod_avail_page--;
                if(m.mod_avail_page < 0) m.mod_avail_page = 0;
                this.updateModAvailable();
            }
            av_next.onpointertap = () => {
                const m = this.__mod_menu;
                m.mod_avail_page++;
                if(m.mod_avail_page * Game.g.max_mod_per_page > this.mods.length - 1) m.mod_avail_page--;
                this.updateModAvailable();
            }

            eq_prev.onpointertap = () => {
                const m = this.__mod_menu;
                m.mod_equip_page--;

                const st = this.selected_tower;

                if(m.mod_equip_page < 0) m.mod_equip_page = 0;
                this.updateModEquipped(st);
            }
            eq_next.onpointertap = () => {
                const m = this.__mod_menu;
                m.mod_equip_page++;

                const st = this.selected_tower;
                console.log(m.mod_equip_page * Game.g.max_mod_per_page, st.mod_length);

                if(m.mod_equip_page * Game.g.max_mod_per_page > st.mod_length - 1) m.mod_equip_page--;
                this.updateModEquipped(st);
            }

            // Element Events
            exit.eventMode = "static";
            exit.onpointertap = () => {
                this.hide_i("imod_menu");
                this.__showing_mod_menu = false;
                this.deselectAll();
            }

            // save references
            const save_pref = {
                type: type,
                stats: {
                    atk: st_atk,
                    spd: st_spd,
                    rng: st_rng,
                    trg: st_trg,
                    pen: st_pen,
                    lvl: st_lvl,
                    cap: st_cap
                },
                mod_equip: equipped,
                mod_avail: avail,

                // pagination feature
                mod_equip_page: 0,
                mod_avail_page: 0,
                btn: {
                    av_prev: av_prev,
                    av_next: av_next,
                    eq_prev: eq_prev,
                    eq_next: eq_next
                },

                style: {
                    md_cont_h: menu_padding
                }
            }

            Object.assign(this.__mod_menu, save_pref);

            mod_cont.addChild(st_cap, av_prev, av_next, eq_prev, eq_next, equipped, avail);
            statCont.addChild(st_lvl, st_atk, st_spd, st_rng, st_trg, st_pen);
            mod_menu.addChild(exit, type, statCont, mod_cont);

            mod_menu.hide();
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
            pen: null,
            lvl: null,
            cap: null
        },
        mod_equip: null,
        mod_avail: null,
        btn: {
            av_prev: null,
            av_next: null,
            eq_prev: null,
            eq_next: null
        },

        // pagination feature
        mod_equip_page: 0,
        mod_avail_page: 0
    }

    // base on selected tower
    setModMenuElements(){
        // get selected tower
        const t = this.selected_tower;

        this.updateModElementStat(t);
        const type = this.__mod_menu.type;

        type.removeChildren();

        // Create type graphic
        const g = new GameObject("imod_typeGraphic"),
              g_type = t.type == "b" ? "CIRCLE" : "REG",
              side = t.type == "a" ? 4 : t.type == "b" ? "b" :
                     t.type == "c" ? 5 : 6;

        Geometry.TOWER[g_type].bind(g)(50, side, t.type);

        this.updateModEquipped(t);
        this.updateModAvailable();

        type.addChild(g);
    }

    updateModElementStat(t){
        
        // apply stats and type
        const {stats: stat} = this.__mod_menu;

        stat.atk.text = `ATK - ${t.atk.toFixed(2)}`;
        stat.spd.text = `SPD - ${t.spd.toFixed(2)}`;
        stat.rng.text = `RNG - ${t.rng.toFixed(2)}`;
        stat.trg.text = `TRG - ${t.trg.toFixed(0)}`;
        stat.pen.text = `PEN - ${t.pen.toFixed(2)}`;
        stat.lvl.text = `LVL ${t.lvl}`;
        stat.cap.text = `CAP ${t.mod_length}/${t.cap}`;
    }

    updateModEquipped(t){
        const {mod_equip: eq, style: s, mod_equip_page: count, btn}  = this.__mod_menu,
        max = Game.g.max_mod_per_page, length = t.mod_length;

        eq.removeChildren();

        const ms = t.modAsArray;

        if(length < max * count){
            count = 0;
            this.__mod_menu.mod_equip_page = count;
        }

        ms.forEach((e, i) => {
            if(!Util.isInBound(count * max, (count + 1) * max, i)) return;
            const m = new GameObject("mequipped_cont"),
                  m_h = eq.height / Game.g.max_mod_per_page, 
                  m_b = 3;

                  i %= max;

            // TODO: PIXI EXLUSIVE DRAW
            m.beginFill(0x0c9623)
            .drawRect(0, 0, this.width / 2 - s.md_cont_h * 2, m_h)
            .endFill();

            m.beginFill(0x086017)
            .drawRect(m_b, m_b, this.width / 2 - s.md_cont_h * 2 - m_b * 2, m_h - m_b*2)
            .endFill();

            // TEXT
            const txt = new TextObject(e.label, {
                fontFamily: "ISO",
                fontSize: 15,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            })

            txt.anchor.set(0.5, 0.5);
            txt.position.set(...m.center);

            m.addChild(txt);
            m.position.y = i * m_h; 

            // add event to remove
            m.eventMode = "static";
            m.onpointertap = () => {
                this.mods.push(e);
                t.delMod(e);
                e.mod = null; // remove mod inside
            }

            eq.addChild(m);
        })

        // change stylings for mod equip navigation buttons
        if(count <= 0) btn.eq_prev.tint = 0x888888;
        else btn.eq_prev.tint = 0xffffff;

        if((count + 1) * max > length - 1) btn.eq_next.tint = 0x888888;
        else btn.eq_next.tint = 0xffffff;
    }

    // available
    updateModAvailable(){
        
        if(this.mods.length - 1 < this.__mod_menu.mod_avail_page * Game.g.max_mod_per_page){
            this.__mod_menu.mod_avail_page--;
            if(this.__mod_menu.mod_avail_page <= 0) this.__mod_menu.mod_avail_page = 0;
        }

        const {mod_avail: av, style: s, mod_avail_page: count, btn} = this.__mod_menu,
              max = Game.g.max_mod_per_page, length = this.mods.length;

        av.removeChildren();


        this.mods.forEach((e, i) => {
            if(!Util.isInBound(count * max, (count + 1) * max, i)) return;

            const m = new GameObject("mavail_cont"),
                  m_h = av.height / max, 
                  m_b = 3;

            i %= max;


            // TODO: PIXI EXLUSIVE DRAW
            m.beginFill(0x333333)
            .drawRect(0, 0, this.width / 2 - s.md_cont_h * 2, m_h)
            .endFill();

            m.beginFill(0x525252)
            .drawRect(m_b, m_b,  this.width / 2 - s.md_cont_h * 2 - m_b * 2, m_h - m_b*2)
            .endFill();

            // TEXT
            const txt = new TextObject(e.label, {
                fontFamily: "ISO",
                fontSize: 15,
                stroke: "white",
                strokeThickness: 1,
                fill: "white",
                align: "center"
            })

            txt.anchor.set(0.5, 0.5);
            txt.position.set(...m.center);

            m.position.y = i * m_h; 

            m.addChild(txt);

            // add event to add mods to the tower
            m.eventMode = "static";
            m.onpointertap = () => {

                // add mod to the tower, unless if it has full mod capacity
                const st = this.selected_tower;

                console.log(st.cap, st.mod_length);

                if(st.cap <= st.mod_length) return;

                const i = this.mods.findIndex(md => md.id == e.id),
                      tmod = this.mods.splice(i, 1)[0];

                st.addMod(tmod);
            }

            av.addChild(m);
        })

        // change stylings for mod equip navigation buttons
        if(count <= 0) btn.av_prev.tint = 0x888888;
        else btn.av_prev.tint = 0xffffff;

        if((count + 1) * max > length - 1) btn.av_next.tint = 0x888888;
        else btn.av_next.tint = 0xffffff;
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

        this.__wave_count_object.text = `WAVE ${val}`;
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

        i_wave.getChildAt(1).text = `SKIP ${Math.floor(this.wave.currentSkipValue)}🟡`;

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

            // DEV: Add mods
            const testMod = new Mod({prop: "atk", mode: "+", value: 2});

            this.mods.push(
                testMod.clone,
                testMod.clone,
                testMod.clone.set("prop", "rng").set("value", 0.5),
                testMod.clone.set("mode", "*").set("value", 0.2),
                testMod.clone.set("prop", "spd").set("mode", "*").set("value", .25),
                testMod.clone.set("prop", "trg").set("value", 1),
                testMod.clone.set("prop", "trg").set("value", 1),
                testMod.clone.set("prop", "rng").set("value", 0.5),
                testMod.clone.set("mode", "*").set("value", 0.2),
            )

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
        const enemyWave = Wave.getWave(1);
        this.wave = new Wave({
            left: defs.first_wave_time, 
            queue: enemyWave, 
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

        // immediately start another wave
        const enemyWave = Wave.getWave(this.wave_count + 1);
        this.wave = new Wave({
            left: Game.defaults.first_wave_time + this.wave_count * 2, 
            queue: enemyWave, 
            skipValue: 20 + this.wave_count,
            game: this,
        })
    }

    _isOnPause = false;

    set paused(val){
        this._isOnPause = val;

        if(val) this.tl.pause();
        else this.tl.resume();
    }

    get paused(){
        return this._isOnPause;
    }

    // Loop (Add this to engine tick event)
    // Only handle game events, not rendering, as the engine does that
    _loop(delta){
        if(this.paused) return;

        // console.log(delta * 1000);
        delta *= this.speed_mult || 1;
        this.tl.timeScale(this.speed_mult || 1);

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
                Tower = null;
                break;
            case "D":
                Tower = null;
                break;
        }

        if(Tower == null) return;

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
        const t = this.selected_tower;
        this.hide_i("iman_towerCont");
        if(t == null) return;
        this.deselectAll();
        if(t.upgrade_cost > this.money) return;
        this.money -= t.upgrade_cost;
        t.lvl++;

    }

    sellTower(){
        const t = this.selected_tower;
        if(t == null) return;

        // remove all mods from the tower and turn it back in the mods array
        const t_mods = t.modAsArray;

        t_mods.forEach(tmod => {
            this.mods.push(tmod);
            tmod.mod = null;
        })

        const value = t.sell();
        this.addMoney(value);

        this.hide_i("iman_towerCont");
        this.deselectAll();
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