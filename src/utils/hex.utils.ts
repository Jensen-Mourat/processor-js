interface String {
    add(s: string, length?: number): string;

    substract(s: string, length?: number): string;

    convertToTwosComp(length?: number): string;

    fitTo(length: number): string;

    greaterThan(s: string): boolean;

    isOverflow(length?: number): boolean;

    toInt(): number;

    getLowestByte(): string;
}

String.prototype.getLowestByte = function (): string {
    return this.fitTo(2);
};

String.prototype.fitTo = function (length): string {
    let s = this;
    while (s.length > length) {
        s = s.substr(1);
    }
    return s as string;
};

String.prototype.toInt = function (): number {
    return parseInt(this as string, 16);
};

String.prototype.greaterThan = function (s: string): boolean {
    return parseInt(this as string, 16) > parseInt(s, 16);
};

String.prototype.add = function (s: string, length?: number): string {
    // const hex = s.convertToTwosComp(length);
    const result = parseInt(this as string, 16) + parseInt(s, 16);
    return result.toString(16).padStart(length ?? 8, '0');
};

String.prototype.substract = function (s: string, length?: number): string {
    const hex = s.convertToTwosComp(length);
    const result = parseInt(this as string, 16) - parseInt(hex, 16);
    return result.toString(16).padStart(length ?? 8, '0');
};

String.prototype.convertToTwosComp = function (length?: number): string {
    const hex = parseInt(this as string, 16);
    const maxHex = parseInt('ffffffff'.substr(0, length ?? 8), 16);
    return (maxHex - hex + 1).toString(16).padStart(length ?? 8, '0');
};

String.prototype.isOverflow = function (length?: number): boolean {
    const hex = parseInt(this as string, 16);
    const maxHex = parseInt('80'.padEnd(length ? length - 1 : this.length - 2, '0'), 16);
    return hex >= maxHex;
};
