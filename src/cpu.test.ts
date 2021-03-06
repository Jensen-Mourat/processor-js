const {execSync} = require('child_process');

const test = (description: string, opCode: string) => {
    let realResult = execSync('npx ts-node runProcessor.ts ' + opCode).toString();
    console.log(realResult === 'true' ? description + ' passed' : description + ' failed');
};

test('add eax, 1111', '0511110000');
