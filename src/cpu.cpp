#include <iostream>
#include <cstdint>
#include<string>
using namespace std;
typedef unsigned char byte;
int main() {
int ax = 0; 
int bx = 0; 
int cx = 0; 
int cc = 0; 
uint32_t x = 6;
byte arr[5] = {0x2};
byte* offset = &arr[0];
asm volatile(".byte 0x31,0xC0,0x31,0xDB,0x31,0xC9,0x31,0xD2,0x31,0xFF,0x31,0xF6,0x05,0x11,0x11,0x00,0x00": "=a" (ax),"=b" (bx),"=c" (cx), "=@ccc" (cc): "D" (offset):"cc"); 
string st = "{eax:" + to_string(ax) + ",ebx:" + to_string(bx)+ ",ecx:" + to_string(cx) + "}";
cout << st;}