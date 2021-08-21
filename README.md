# processor-js
Intel x86 processor simulation. Recieves machine code as input, uses my [disassembler](#https://github.com/Jensen-Mourat/disassembler-intel-x86) internally.

## Interface

** Rxjs Observables are used for the states because the reactive nature of observables allows easy UI bindings with framework such as Angular **

```
interface Processor {
  getFlags(): Map<flagType, IFlag>;
  input(string): Instruction[]; // use this function to input machine code to the processor, it also returns the instructions disassembled by the processor 
  runCurrentInstruction(); // run current instruction
  undo() // return to previous state
  runAll() // run all instructions at once
  reset(clearInstructions?: boolean) // reset processor state, if clearInstructions is true, new instructions must also be added using input
  getFlags$() // get observable for flags
  getInstructions$(): Observable<Instruction[]>;// get observable for Instructions
  getInstructionPointer$(): Observable<number>;// get observable for pointer position
  resetInstructionPointer() // reset the instruction pointer
  getRegisterValue(r: string) // r: intel 8, 16 or 32 bit general purpose register i.e ax, eax, ah etc... return hex string
  getRegisters$() // get all register values as observable
  getMemory() // return the Memory object
  initialiseMemory(size: number) // size: number of bytes
```
