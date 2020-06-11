export class gages {
  public comid: string;
  public identifier: string;
  public name: string;
  public navigation: string;
  public uri: string;
  public source: string;
  public value: string;
  public record: Date;

  constructor(arg: gages) {
    this.comid = arg.comid;
    this.identifier = arg.identifier;
    this.name = arg.name;
    this.navigation = arg.navigation;
    this.uri = arg.uri;
    this.source = arg.source;
    this.value = "-9999";
    this.record = new Date();
  }
}
