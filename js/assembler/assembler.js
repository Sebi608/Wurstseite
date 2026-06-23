document.addEventListener("DOMContentLoaded", async () => {
    const asmInput = document.getElementById("asmInput");
    const hexOutput = document.getElementById("hexOutput");
    const archSelect = document.getElementById("archSelect");

    let ksInstance = null;
    let csInstance = null;
    let encoder = null;
    let decoder = null;

    try {
        const [cs, ks] = await Promise.all([
            MCapstone(),
            MKeystone()
        ]);
        
        csInstance = cs;
        ksInstance = ks;

        updateArchitecture();
    } catch (error) {
        asmInput.value = "Fehler beim Laden der WebAssembly-Komponenten.";
        return;
    }

function updateArchitecture() {
        if (!ksInstance || !csInstance) return;

        if (encoder) encoder.close();
        if (decoder) decoder.close();

        const selectedArch = archSelect.value;

        let useIntelSyntax = false;

        switch (selectedArch) {
            case "x64":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_X86, ksInstance.MODE_64);
                decoder = new csInstance.Capstone(csInstance.ARCH_X86, csInstance.MODE_64);
                useIntelSyntax = true;
                break;

            case "x32":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_X86, ksInstance.MODE_32);
                decoder = new csInstance.Capstone(csInstance.ARCH_X86, csInstance.MODE_32);
                useIntelSyntax = true;
                break;

            case "x16":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_X86, ksInstance.MODE_16);
                decoder = new csInstance.Capstone(csInstance.ARCH_X86, csInstance.MODE_16);
                useIntelSyntax = true;
                break;

            case "arm":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_ARM, ksInstance.MODE_ARM);
                decoder = new csInstance.Capstone(csInstance.ARCH_ARM, csInstance.MODE_ARM);
                break;
            case "arm_thumb":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_ARM, ksInstance.MODE_THUMB);
                decoder = new csInstance.Capstone(csInstance.ARCH_ARM, csInstance.MODE_THUMB);
                break;
            case "aarch64":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_ARM64, ksInstance.MODE_LITTLE_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_ARM64, csInstance.MODE_ARM);
                break;

            case "mips32":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_MIPS, ksInstance.MODE_MIPS32 + ksInstance.MODE_LITTLE_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_MIPS, csInstance.MODE_MIPS32 + csInstance.MODE_LITTLE_ENDIAN);
                break;
            case "mips64":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_MIPS, ksInstance.MODE_MIPS64 + ksInstance.MODE_LITTLE_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_MIPS, csInstance.MODE_MIPS64 + csInstance.MODE_LITTLE_ENDIAN);
                break;

            case "ppc32":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_PPC, ksInstance.MODE_PPC32 + ksInstance.MODE_BIG_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_PPC, csInstance.MODE_32 + csInstance.MODE_BIG_ENDIAN);
                break;

            case "ppc64":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_PPC, ksInstance.MODE_PPC64 + ksInstance.MODE_BIG_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_PPC, csInstance.MODE_64 + csInstance.MODE_BIG_ENDIAN);
                break;

            case "sparc":
                encoder = new ksInstance.Keystone(ksInstance.ARCH_SPARC, ksInstance.MODE_SPARC32 + ksInstance.MODE_BIG_ENDIAN);
                decoder = new csInstance.Capstone(csInstance.ARCH_SPARC, csInstance.MODE_BIG_ENDIAN);
                break;

            default:
                console.error("Unbekannte Architektur gewählt:", selectedArch);
                return;
        }

        if (useIntelSyntax && ksInstance.OPT_SYNTAX && ksInstance.OPT_SYNTAX_INTEL) {
            encoder.option(ksInstance.OPT_SYNTAX, ksInstance.OPT_SYNTAX_INTEL);
        }

        triggerAssemble();
    }

    function triggerAssemble() {
        const asmText = asmInput.value.trim();
        if (!asmText || !encoder) {
            hexOutput.value = "";
            return;
        }

        try {
            const output = encoder.asm(asmText);
            
            if (output && output.mc) {
                const hexString = Array.from(Object.values(output.mc))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                hexOutput.value = hexString.toUpperCase();
            } else {
                hexOutput.value = "[Fehler beim Assemblieren]";
            }
        } catch (err) {
            hexOutput.value = "Fehler: " + err.message;
        }
    }

    function triggerDisassemble() {
        const hexText = hexOutput.value.trim();
        if (!hexText || !decoder) {
            asmInput.value = "";
            return;
        }

        try {
            const cleanHex = hexText.replace(/(0x|,|\s+)/g, "");
            
            if (cleanHex.length % 2 !== 0) {
                asmInput.value = "Ungültige Hex-Länge (muss gerade Anzahl an Zeichen sein).";
                return;
            }

            const byteArray = [];
            for (let i = 0; i < cleanHex.length; i += 2) {
                byteArray.push(parseInt(cleanHex.substr(i, 2), 16));
            }

            const instructions = decoder.disasm(byteArray, 0x1000);
            
            if (instructions.length > 0) {
                const asmLines = instructions.map(instr => {
                    return `${instr.mnemonic} ${instr.op_str}`;
                });
                asmInput.value = asmLines.join("\n");
            } else {
                asmInput.value = "; Konnte keine gültigen Instruktionen dekodieren.";
            }
        } catch (err) {
            asmInput.value = "; Fehler beim Disassemblieren: " + err.message;
        }
    }

    archSelect.addEventListener("change", updateArchitecture);
    asmInput.addEventListener("input", triggerAssemble);
    hexOutput.addEventListener("input", triggerDisassemble);
});