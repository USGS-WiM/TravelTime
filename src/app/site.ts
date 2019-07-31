import {myfunctions} from './shared/myfunctions';

export class parameters extends myfunctions { //parameters
    
    constructor (arg:parameters){
        super()
        this.id = arg.id
        this.name = arg.name
        this.required = arg.required
        this.description = arg.description
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
            var myval = new parameters(arg[i]);
            this.mylist.push(myval);
        }
    }
    mylist = [];
}

export class measurements {
  constructor(arg: Array<any>) {
    this.Time = arg[0];
    this.Flow = +arg[1];
  }
  Time: string;
  Flow: number;
}
