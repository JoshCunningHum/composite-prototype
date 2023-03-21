
// UGGH Implementing this made me so damn happy even if I don't have gf
class Mod{
    mod = null; // 

    // TODO: Be able to sell a mod

    prop;
    mode;
    value;
    name;

    get clone(){
        return new Mod({
            prop: this.prop,
            mode: this.mode,
            value: this.value,
            label: this.clabel,
            name: this.name
        })
    }

    set(prop, value){
        this[prop] = value;
        return this;
    }

    constructor({prop, mode, value, label = null, name = ""}){
        this.prop = prop;
        this.mode = mode;
        this.value = value;
        this.clabel = label;
        this.name = name;

        this.id = Math.random().toString(36).substring(2,10);
    }

    get label(){
        return this.clabel ? this.clabel : `${this.prop.toUpperCase()} +${this.mode == "+" ? (this.value).toPrecision(2) : (this.value*100).toFixed(0) + "%"}`
    }

    extract(arr){
        const a = [];
        if(this.mod) a.push(this, ...this.mod.extract(a));
        else a.push(this);
        return [...arr, ...a];
    }

    count(){
        return 1 + (this.mod == null ? 0 : this.mod.count());
    }

    apply(obj){
        if(typeof this.value == "number"){
            if(this.mode == "+") obj[this.prop] += this.value;
            else if(this.mode == "*") obj[this.prop] *= 1 + this.value;
        }else{
            // For unique mods
        }

        return this.mod ? this.mod.apply(obj) : obj;
    }

    addMod(mod){
        if(this.mod == null) this.mod = mod;
        else this.mod.addMod(mod);
    }

    remove(mod){
        if(this.mod.equals(mod)){
            this.mod = this.mod.mod; // hahahah 
            mod.mod = null; // hahahaha I love this design pattern
        } else if(this.mod == null) return;
        else this.mod.remove(mod);
    }

    equals(mod){
        return this.id == mod.id;
    }
}

export {
    Mod
};