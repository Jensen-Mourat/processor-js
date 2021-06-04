// @ts-nocheck
export const cppCodeGenerator = (opCode: string) => {
    const cppCode: string =
        '#include <iostream>\n' +
        '#include <cstdint>\n' +
        '#include<string>\n' +
        'using namespace std;\n' +
        'typedef unsigned char byte;\n' +
        'int main() {\n' +
        'int ax = 0; \n' +
        'int bx = 0; \n' +
        'int cx = 0; \n' +
        'int dx = 0; \n' +
        'int bp = 0; \n' +
        'int sp = 0; \n' +
        'int si = 0; \n' +
        'int di = 0; \n' +
        'int cf = 0; \n' +
        'int of = 0; \n' +
        'int pf = 0; \n' +
        'int zf = 0; \n' +
        'int sf = 0; \n' +
        'uint32_t x = 6;\n' +
        'byte arr[5] = {0x2};\n' +
        'byte* offset = &arr[0];\n' +
        `asm volatile(".byte ${processOpcode(
            opCode,
        )}": "=a" (ax),"=b" (bx),"=c" (cx),"=d" (dx),"=S" (si),"=D" (di), "=@ccc" (cf), "=@cco" (of), "=@ccp" (pf), "=@ccz" (zf), "=@ccs" (sf): "D" (offset):"cc"); \n` +
        'string st = "{\\"eax\\":" + to_string(ax) + ", \\"ebx\\":" + to_string(bx)+ ", \\"ecx\\":" + to_string(cx) + ", \\"edx\\":" + to_string(dx) + ", \\"esi\\":"+ to_string(si) + ", \\"edi\\":"+ to_string(di)+ ", \\"cf\\":"+ to_string(cf)+ ", \\"of\\":"+ to_string(of)+ ", \\"pf\\":"+ to_string(pf)+", \\"zf\\":"+ to_string(zf)+ ", \\"sf\\":"+ to_string(sf)+"}";\n' +
        'cout << st;' +
        '}';
    return cppCode;
};

export const processOpcode = (opCode: string) => {
    const initializeAllRegToZero = 'B800000000BB00000000B900000000BA00000000BF00000000BE00000000';
    opCode = initializeAllRegToZero + opCode;
    const groups = [];
    for (let i = 0; i < opCode.length - 1; i += 2) {
        groups.push(opCode[i] + opCode[i + 1]);
    }
    return groups.map((x) => '0x' + x.toUpperCase()).toString();
};
