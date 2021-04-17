const {execSync} = require('child_process');

const test = (description: string, opCode: string) => {
    const realResult = execSync('npx ts-node runProcessor.ts ' + opCode).toString().trim();
    console.log(realResult === 'true' ? description + ' passed' : description + ' failed');
};

test('add eax, 1111', '0511110000');
test('mov ax, 2222', '66B82222');
