export class mainPar {

    constructor (arg:mainPar){
        this.id = arg.id
        this.description = arg.description
        this.name = arg.name
        this.required = arg.required
        this.valueType = arg.valueType
        this.value = []
        this._init (arg.value)
    }

    id: number
    name: string
    required: boolean
    description: string
    valueType: string
    value: Array<any>
    private _init (argVal: Array<any>) {
        this.value = deepCopy(argVal);
    }
}

//deepCopyConstructor
function deepCopy(obj) {
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
};

export class Gage {
    constructor(arg:Array<any>) {
        arg = arg['0'];
        for (var i=0; i< arg.length; i++){
            var myval = new mainPar(arg[i]);
            this.mylist.push(myval);
        }
        console.log (this.mylist);
    }
    mylist = [];
}
