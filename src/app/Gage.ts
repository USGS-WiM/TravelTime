import { POINT } from './reach';

export class Gage {
    constructor(arg:POINT) {
      this._init(arg.lng, arg.lat);
    }

    mylist = [];

    private _init (x:number, y:number) {
        this.mylist.push([{
            id:1,
            name:"Start point location",
            required:true,
            description:"Specified lat/long/crs  navigation start location",
            valueType:"geojson point geometry",
            value:{type:"Point",coordinates:[x,y],crs:{properties:{name:"EPSG:4326"}, type:"name"}}
        },
        {
            id:5,
            name:"Direction",
            required:true,
            description:"Network operation direction",
            valueType:"exclusiveOption",
            value:"upstream"
        },
        {
            id:6,
            name:"Query Source",
            required:true,
            description:"Specified data source to query",
            valueType:"option",
            value:['gage']
        }])

        this.mylist.push([{
            id:1,
            name:"Start point location",
            required:true,
            description:"Specified lat/long/crs  navigation start location",
            valueType:"geojson point geometry",
            value:{type:"Point",coordinates:[x,y],crs:{properties:{name:"EPSG:4326"},type:"name"}}
        },
        {
          id: 5,
          name: "Direction",
          required: true,
          description: "Network operation direction",
          valueType: "exclusiveOption",
          value: "downstream"
        },
        {
          id: 6,
          name: "Query Source",
          required: true,
          description: "Specified data source to query",
          valueType: "option",
          value: ['gage']
        }])
    }
}
