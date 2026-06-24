document.addEventListener("DOMContentLoaded", async () => {
  const asmInput = document.getElementById("asmInput");
  const hexOutput = document.getElementById("hexOutput");
  const asmArchSelect = document.getElementById("asmArchSelect");

  const disHexInput = document.getElementById("disHexInput");
  const disAsmOutput = document.getElementById("disAsmOutput");
  const disArchSelect = document.getElementById("disArchSelect");

  const baseAddrInput = document.getElementById("baseAddrInput");
  const showAddresses = document.getElementById("showAddresses");
  const showBytes = document.getElementById("showBytes");
  const showInstructions = document.getElementById("showInstructions");

  let ksInstance = null;
  let csInstance = null;
  let encoder = null;
  let decoder = null;

  try {
    const [cs, ks] = await Promise.all([
      MCapstone({ locateFile: (path) => `../js/assembler/${path}` }),
      MKeystone({ locateFile: (path) => `../js/assembler/${path}` })
    ]);

    csInstance = cs;
    ksInstance = ks;

    updateAssemblerArch();
    updateDisassemblerArch();
  } catch (error) {
    console.error("Fehler beim Laden der Assembler/Disassembler-Bibliotheken:", error);
    return;
  }

  function getArchConfig(instance, archValue, isKeystone, forceBigEndian = false) {
    const endianMode = forceBigEndian ? instance.MODE_BIG_ENDIAN : instance.MODE_LITTLE_ENDIAN;

    switch (archValue) {
      case "x64": return { arch: instance.ARCH_X86, mode: instance.MODE_64, intel: true };
      case "x32": return { arch: instance.ARCH_X86, mode: instance.MODE_32, intel: true };
      case "x16": return { arch: instance.ARCH_X86, mode: instance.MODE_16, intel: true };
      case "arm": return { arch: instance.ARCH_ARM, mode: forceBigEndian ? instance.MODE_ARM + instance.MODE_BIG_ENDIAN : instance.MODE_ARM };
      case "arm_thumb": return { arch: instance.ARCH_ARM, mode: forceBigEndian ? instance.MODE_THUMB + instance.MODE_BIG_ENDIAN : instance.MODE_THUMB };
      case "aarch64": return { arch: instance.ARCH_ARM64, mode: isKeystone ? endianMode : instance.MODE_ARM };
      case "mips32": return { arch: instance.ARCH_MIPS, mode: instance.MODE_MIPS32 + endianMode };
      case "mips64": return { arch: instance.ARCH_MIPS, mode: instance.MODE_MIPS64 + endianMode };
      case "ppc32": return { arch: instance.ARCH_PPC, mode: (isKeystone ? instance.MODE_PPC32 : instance.MODE_32) + endianMode };
      case "ppc64": return { arch: instance.ARCH_PPC, mode: (isKeystone ? instance.MODE_PPC64 : instance.MODE_64) + endianMode };
      case "sparc": return { arch: instance.ARCH_SPARC, mode: isKeystone ? (instance.MODE_SPARC32 + endianMode) : endianMode };
      default: return null;
    }
  }

  function updateAssemblerArch() {
    if (!ksInstance) return;
    if (encoder) encoder.close();

    const config = getArchConfig(ksInstance, asmArchSelect.value, true);
    if (config) {
      encoder = new ksInstance.Keystone(config.arch, config.mode);
      if (config.intel && ksInstance.OPT_SYNTAX && ksInstance.OPT_SYNTAX_INTEL) {
        encoder.option(ksInstance.OPT_SYNTAX, ksInstance.OPT_SYNTAX_INTEL);
      }
    }
    triggerAssemble();
  }

  function updateDisassemblerArch() {
    if (!csInstance) return;
    if (decoder) decoder.close();

    const selectedEndian = document.querySelector('input[name="endian"]:checked').value;
    const forceBigEndian = (selectedEndian === "be");

    const config = getArchConfig(csInstance, disArchSelect.value, false, forceBigEndian);
    if (config) {
      decoder = new csInstance.Capstone(config.arch, config.mode);
    }
    triggerDisassemble();
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
    const hexText = disHexInput.value.trim();
    if (!hexText || !decoder) {
      disAsmOutput.value = "";
      return;
    }

    try {
      const cleanHex = hexText.replace(/(0x|,|\s+)/g, "");
      if (cleanHex.length % 2 !== 0) {
        disAsmOutput.value = "Ungültige Hex-Länge.";
        return;
      }

      const byteArray = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        byteArray.push(parseInt(cleanHex.substr(i, 2), 16));
      }

      let baseAddr = parseInt(baseAddrInput.value.trim(), 16);
      if (isNaN(baseAddr)) {
        baseAddr = parseInt(baseAddrInput.value.trim(), 10) || 0;
      }

      const instructions = decoder.disasm(byteArray, baseAddr);

      if (instructions.length > 0) {
        const asmLines = instructions.map(instr => {
          let lineParts = [];

          if (showAddresses.checked) {
            const addrStr = "0x" + instr.address.toString(16).padStart(8, '0');
            lineParts.push(addrStr);
          }

          if (showBytes.checked) {
            let bytesStr = "";
            if (instr.bytes) {
              bytesStr = Array.from(instr.bytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            }
            lineParts.push(bytesStr.padEnd(8, ' '));
          }

          if (showInstructions.checked) {
            lineParts.push(`${instr.mnemonic} ${instr.op_str}`);
          }

          return lineParts.join("   ");
        });

        disAsmOutput.value = asmLines.join("\n");
      } else {
        disAsmOutput.value = "; Konnte keine gültigen Instruktionen dekodieren.";
      }
    } catch (err) {
      disAsmOutput.value = "; Fehler beim Disassemblieren: " + err.message;
    }
  }

  asmArchSelect.addEventListener("change", updateAssemblerArch);
  disArchSelect.addEventListener("change", updateDisassemblerArch);

  document.querySelectorAll('input[name="endian"]').forEach(radio => {
    radio.addEventListener("change", updateDisassemblerArch);
  });
  baseAddrInput.addEventListener("input", triggerDisassemble);
  showAddresses.addEventListener("change", triggerDisassemble);
  showBytes.addEventListener("change", triggerDisassemble);
  showInstructions.addEventListener("change", triggerDisassemble);

  asmInput.addEventListener("input", triggerAssemble);
  disHexInput.addEventListener("input", triggerDisassemble);
});