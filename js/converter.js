const input = document.getElementById('inputNumber');
const baseSelect = document.getElementById('baseSelect');
const outputBaseSelect = document.getElementById('outputBaseSelect');
const resultsOutput = document.getElementById('resultsOutput');

const parseBigIntBase = (str, base) => {
    str = str.toLowerCase().replace(/^0[box]/, '');
    let result = 0n;
    const baseBig = BigInt(base);
    
    for (const char of str) {
        const digit = BigInt(parseInt(char, base));
        if (isNaN(Number(digit)) || digit >= baseBig) {
            return null;
        }
        result = result * baseBig + digit;
    }
    return result;
};

const updateConverter = () => {
    const val = input.value.trim();
    const inputBase = parseInt(baseSelect.value, 10);
    const outputBase = parseInt(outputBaseSelect.value, 10);
    
    if (val === "") {
        resultsOutput.innerText = "";
        return;
    }

    try {
        const num = parseBigIntBase(val, inputBase);

        if (num !== null) {
            let result = num.toString(outputBase);
            
            if (outputBase === 16) {
                result = result.toUpperCase();
            }
            
            resultsOutput.innerText = result;
        } else {
            resultsOutput.innerText = "Fehlerhafte Eingabe. Bitte überprüfe die Zahl und die Basis.";
        }
    } catch (e) {
        resultsOutput.innerText = "Fehlerhafte Eingabe. Bitte überprüfe die Zahl und die Basis.";
    }
};

input.addEventListener('input', updateConverter);
baseSelect.addEventListener('change', updateConverter);
outputBaseSelect.addEventListener('change', updateConverter);