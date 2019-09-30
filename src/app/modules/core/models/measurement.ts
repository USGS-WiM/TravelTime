export class measurement {
    public Time: string;
    public Value: number;
    
    constructor(time:string, value:number) {
      this.Time = time;
      this.Value = +value;
    }
    
  }
