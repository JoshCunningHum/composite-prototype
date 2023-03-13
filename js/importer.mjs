// Import all needed classes and add it to the window for usage in non-module files

import Engine from './engine/engine.mjs';
import {
    Tween
} from './engine/tween/index.mjs';
import { Game } from './game/main.mjs';
import { Block, Map } from './game/map.mjs';

const modules = {
    Engine: Engine,
    Tween: Tween,
    Game: Game,
    Block: Block,
    Map: Map
}

function require(key){
    return modules[key];
}

window.req = require;