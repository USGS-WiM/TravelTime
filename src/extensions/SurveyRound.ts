interface Number{
    toUSGSvalue(): number;
}

if (!Number.prototype.toUSGSvalue) {
    Number.prototype.toUSGSvalue = function () {
        var x:number = parseFloat(this);
        var precision:number;
        if ((x > 1000000) && (x < 10000000)) precision = 10000;
        if ((x > 100000) && (x < 1000000)) precision = 1000;
        if ((x > 10000) && (x < 100000)) precision = 100;
        if ((x > 1000) && (x < 10000)) precision = 10;
        if ((x > 100) && (x < 1000)) precision = 1;
        if (x < 100) return Number(x.toPrecision(3));

        return parseInt(((x + (precision * .5)) / precision).toString()) * precision;
    };
}
