#include <iostream>
#include <cstdint>
#include<string>
using namespace std;
typedef unsigned char byte;
int main() {
int ax = 0; 
int bx = 0; 
int cx = 0; 
int dx = 0; 
int bp = 0; 
int sp = 0; 
int si = 0; 
int di = 0; 
int cf = 0; 
int of = 0; 
int pf = 0; 
int zf = 0; 
int sf = 0; 
uint32_t x = 6;
byte arr[5] = {0x2};
byte* offset = &arr[0];
asm volatile(".byte 0xB8,0x00,0x00,0x00,0x00,0xBB,0x00,0x00,0x00,0x00,0xB9,0x00,0x00,0x00,0x00,0xBA,0x00,0x00,0x00,0x00,0xBF,0x00,0x00,0x00,0x00,0xBE,0x00,0x00,0x00,0x00,0x66,0xB8,0x22,0x22": "=a" (ax),"=b" (bx),"=c" (cx),"=d" (dx),"=S" (si),"=D" (di), "=@ccc" (cf), "=@cco" (of), "=@ccp" (pf), "=@ccz" (zf), "=@ccs" (sf): "D" (offset):"cc"); 
string st = "{\"eax\":" + to_string(ax) + ", \"ebx\":" + to_string(bx)+ ", \"ecx\":" + to_string(cx) + ", \"edx\":" + to_string(dx) + ", \"esi\":"+ to_string(si) + ", \"edi\":"+ to_string(di)+ ", \"cf\":"+ to_string(cf)+ ", \"of\":"+ to_string(of)+ ", \"pf\":"+ to_string(pf)+", \"zf\":"+ to_string(zf)+ ", \"sf\":"+ to_string(sf)+"}";
cout << st;}