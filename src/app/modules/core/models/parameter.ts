import {deepCopy} from '../../../shared/extensions/object.DeepCopy';

export class parameter extends deepCopy { //parameters
    
    public id: number
    public name: string
    public required: boolean
    public description: string
    public valueType: string
    public value: Array<any>

    constructor (arg:parameter){
        super()
        this.id = arg.id
        this.name = arg.name
        this.required = arg.required
        this.description = arg.description
        this.valueType = arg.valueType
        this.value = []
        this._init (arg.value)
    }

    private _init (argVal: Array<any>) {
        this.value = this.deepCopy(argVal);
    }
}