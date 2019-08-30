import {parameter} from './parameter';

export class site {
public parameters:Array<parameter> =[];

    constructor(arg:Array<any>) {
        arg = arg['0'];
        for (var i=0; i< arg.length; i++){
            var myval = new parameter(arg[i]);
            this.parameters.push(myval);
        }
    }
}
