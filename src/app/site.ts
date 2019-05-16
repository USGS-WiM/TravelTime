import {myclass} from './shared/myfunctions';

export class mainPar extends myclass { //parameters
    
    constructor (arg:mainPar){
        super()
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
        this.value = this.deepCopy(argVal);
    }
}


export class site { //site
    constructor(arg:Array<any>) {
        arg = arg['0'];
        for (var i=0; i< arg.length; i++){
            var myval = new mainPar(arg[i]);
            this.mylist.push(myval);
        }
    }
    mylist = [];
}
