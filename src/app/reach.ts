export class reach {
    constructor(arg:reach) {
        arg = arg.reaches[0]
        this.description = arg.description
        this.id = arg.id
        this.name = arg.name
        this.parameters = []
        this._init (arg.parameters)
    }
    description: string
    id: number
    name: string
    parameters:Array<any>
    reaches: {} //initial input from the service

    private _init (paramlist: Array<any>) { //paramlist should be one from the reference class ? how to bring it here ?
        for (var i = 0; i < paramlist.length; i ++){
            let newparam = {};
     
            if (paramlist[i].name === "Slope"){}
            else {
                for (var  mykey in paramlist[i] ){ //deep copy constructor
                    newparam[mykey] = paramlist[i][mykey]; // parameters[key 1][val 1] (key1: val1) //{units: }
                }

                if (newparam["value"] == undefined){ //if there is no value key  in the dictionary --> add key
                    newparam["value"] = undefined;
                }
                this.parameters.push(newparam);
            }
            console.log(this.parameters)
        };
    } //type of array with anything
}