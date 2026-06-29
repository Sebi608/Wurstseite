const input = document.getElementById('inputNumber');
const baseSelect = document.getElementById('baseSelect');
const outputBaseSelect = document.getElementById('outputBaseSelect');
const resultsOutput = document.getElementById('resultsOutput');

const updateConverter = () => {
    const val = input.value.trim();
    const inputBase = parseInt(baseSelect.value, 10);
    const outputBase = parseInt(outputBaseSelect.value, 10);
    
    const num = parseInt(val, inputBase);

    if (val !== "" && !isNaN(num)) {
        let result = num.toString(outputBase);
        
        if (outputBase === 16) {
            result = result.toUpperCase();
        }
        
        resultsOutput.innerText = result;
    } else {
        resultsOutput.innerText = "Fehlerhafte Eingabe. Bitte überprüfe die Zahl und die Basis.";
    }
};

input.addEventListener('input', updateConverter);
baseSelect.addEventListener('change', updateConverter);
outputBaseSelect.addEventListener('change', updateConverter);