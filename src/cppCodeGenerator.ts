// @ts-nocheck
export const cppCodeGenerator = (opCode: string) => {
    const cppCode: string = '#include <iostream>\n'
        + '#include <cstdint>\n'
        + '#include<string>\n'
        + 'using namespace std;\n'
        + 'typedef unsigned char byte;\n'
        + 'int main() {\n'
        + 'int ax = 0; \n'
        + 'int bx = 0; \n'
        + 'int cx = 0; \n'
        + 'int cc = 0; \n'
        + 'uint32_t x = 6;\n'
        + 'byte arr[5] = {0x2};\n'
        + 'byte* offset = &arr[0];\n'
        + `asm volatile(".byte ${processOpcode(opCode)}": "=a" (ax),"=b" (bx),"=c" (cx), "=@ccc" (cc): "D" (offset):"cc"); \n`
        + 'string st = "{eax:" + to_string(ax) + ",ebx:" + to_string(bx)+ ",ecx:" + to_string(cx) + ",edx: 0" + ",esi: 0" + "edi:0"+ "cf:0" + "cf:0"+ "of:0" + "pf:0"+ "zf:0" + "sf:0" +"}";\n'
        + 'cout << st;'
        + '}';
    return cppCode;
};

export const processOpcode = (opCode: string) => {
    const initializeAllRegToZero = '31C031DB31C931D231FF31F6';
    opCode = initializeAllRegToZero + opCode;
    const groups = [];
    for (let i = 0; i < opCode.length - 1; i += 2) {
        groups.push(opCode[i] + opCode[i + 1]);
    }
    return groups.map(x => '0x' + x.toUpperCase()).toString();
};
