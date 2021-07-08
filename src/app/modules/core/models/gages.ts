export class gages {
  public comid: string;
  public identifier: string;
  public name: string;
  public navigation: string;
  public uri: string;
  public source: string;
  public value: string;
  public record: Date;
  public drainagearea: string;
  public status: string;

  constructor(arg: gages) {
    this.comid = arg.comid;
    this.identifier = arg.identifier;
    this.name = arg.name;
    this.navigation = arg.navigation;
    this.uri = arg.uri;
    this.source = arg.source;
    if (typeof (arg.value) == 'undefined') {
      this.value = '-999999';
    } else {
      this.value = arg.value;
    }

    if (typeof (arg.record) == 'undefined') {
      this.record = new Date();
    } else {
      this.record = arg.record;
    }
    this.drainagearea = Number(arg.drainagearea).toFixed(1);
    if (typeof (arg.status) == 'undefined') {
      this.status = 'Inactive'
    } else {
      this.status = arg.status;
    }

  }
}
