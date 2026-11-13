(() => {
  "use strict";

  const input = document.querySelector("#input-text");
  const output = document.querySelector("#output-text");
  const polishButton = document.querySelector("#polish-btn");
  const clearButton = document.querySelector("#clear-btn");
  const sampleButton = document.querySelector("#sample-btn");
  const downloadButton = document.querySelector("#download-btn");
  const fileInput = document.querySelector("#file-input");
  const inputCount = document.querySelector("#input-count");
  const outputCount = document.querySelector("#output-count");
  const status = document.querySelector("#status");
  const purpose = document.querySelector("#purpose");
  let style = "balanced";

  const samples = [
    "In today's fast-paced world, it is important to note that effective communication plays a crucial role in achieving success. Furthermore, utilizing clear language can help organizations facilitate better collaboration and improve overall outcomes.",
    "Artificial intelligence is changing the way teams work. It can summarize information, identify patterns, and help people spend more time on decisions that require judgment and care. The best results usually come from treating it as a helpful partner rather than a replacement for human thinking."
  ];

  const replacements = [
    [/\bin order to\b/gi, "to"],
    [/\bdue to the fact that\b/gi, "because"],
    [/\bat this point in time\b/gi, "now"],
    [/\ba number of\b/gi, "several"],
    [/\butili[sz]e\b/gi, "use"],
    [/\butili[sz]ing\b/gi, "using"],
    [/\bfacilitate\b/gi, "help"],
    [/\bcommence\b/gi, "start"],
    [/\bendeavor\b/gi, "try"],
    [/\bsubsequent to\b/gi, "after"],
    [/\bprior to\b/gi, "before"],
    [/\bapproximately\b/gi, "about"],
    [/\bdemonstrate\b/gi, "show"],
    [/\bhas the ability to\b/gi, "can"],
    [/\bis able to\b/gi, "can"],
    [/\bin the event that\b/gi, "if"],
    [/\bfor the purpose of\b/gi, "for"],
    [/\ba wide range of\b/gi, "many"],
    [/\bwith regard to\b/gi, "about"],
    [/\bin addition\b/gi, "also"],
    [/\bfurthermore\b/gi, "also"],
    [/\bmoreover\b/gi, "also"],
    [/\bit is important to note that\b/gi, "notably,"],
    [/\bit should be noted that\b/gi, "notably,"],
    [/\bvery unique\b/gi, "unique"],
    [/\bfirst and foremost\b/gi, "first"],
    [/\bthe majority of\b/gi, "most"]
  ];

  const casualReplacements = [[/\bhowever\b/gi, "but"], [/\btherefore\b/gi, "so"], [/\bregarding\b/gi, "about"]];
  const academicReplacements = [[/\bbut\b/gi, "however"], [/\bso\b/gi, "therefore"], [/\bshow\b/gi, "demonstrate"]];

  function wordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  function updateCounts() {
    inputCount.textContent = `${wordCount(input.value).toLocaleString()} words`;
    outputCount.textContent = `${wordCount(output.value).toLocaleString()} words`;
  }

  function preserveCase(replacement, original) {
    if (original[0] && original[0] === original[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
    return replacement;
  }

  function applyReplacements(text, list) {
    return list.reduce((result, [pattern, replacement]) => result.replace(pattern, match => preserveCase(replacement, match)), text);
  }

  function tidy(text) {
    return text
      .replace(/[ \t]+/g, " ")
      .replace(/ +([,.;!?])/g, "$1")
      .replace(/([,.;!?])(?=[A-Za-z])/g, "$1 ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map(line => line.trim())
      .join("\n")
      .trim();
  }

  function varyOpenings(text) {
    const swaps = [
      [/^Additionally, /i, "Also, "],
      [/^Furthermore, /i, "And "],
      [/^Moreover, /i, "Beyond that, "],
      [/^In conclusion, /i, "Ultimately, "],
      [/^It is important to note that /i, "Notably, "]
    ];
    return text.split(/(?<=[.!?])\s+(?=[A-Z])/).map((sentence, index) => {
      if (index % 3 === 2) {
        for (const [pattern, replacement] of swaps) if (pattern.test(sentence)) return sentence.replace(pattern, replacement);
      }
      return sentence;
    }).join(" ");
  }

  function polish(text) {
    const selectedPurpose = purpose.value;
    let result = text;
    if (style !== "light") result = applyReplacements(result, replacements);
    if (selectedPurpose === "casual") result = applyReplacements(result, casualReplacements);
    if (selectedPurpose === "academic") result = applyReplacements(result, academicReplacements);
    if (style === "expressive") result = varyOpenings(result);
    if (style !== "light") {
      result = result.replace(/\b(I think that|I believe that)\b/gi, selectedPurpose === "academic" ? "Evidence suggests" : "I think");
      result = result.replace(/\b(very|really)\s+(important|useful|helpful)\b/gi, "$2");
    }
    return tidy(result);
  }

  function setBusy(busy) {
    polishButton.disabled = busy;
    status.classList.toggle("busy", busy);
    status.innerHTML = busy ? '<span class="status-dot"></span>Polishing…' : '<span class="status-dot"></span>Ready';
  }

  function runPolish() {
    if (!input.value.trim()) {
      input.focus();
      input.setCustomValidity("Paste or type some text first.");
      input.reportValidity();
      input.setCustomValidity("");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      output.value = polish(input.value);
      downloadButton.disabled = !output.value;
      updateCounts();
      setBusy(false);
      output.focus();
    }, 260);
  }

  input.addEventListener("input", updateCounts);
  polishButton.addEventListener("click", runPolish);
  clearButton.addEventListener("click", () => { input.value = ""; output.value = ""; downloadButton.disabled = true; updateCounts(); input.focus(); });
  sampleButton.addEventListener("click", () => { input.value = samples[Math.floor(Math.random() * samples.length)]; output.value = ""; downloadButton.disabled = true; updateCounts(); input.focus(); });
  document.querySelectorAll(".segment").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    style = button.dataset.style;
  }));
  downloadButton.addEventListener("click", () => {
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "ginz-polished.txt"; link.click();
    URL.revokeObjectURL(url);
  });
  fileInput.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { input.value = String(reader.result || ""); output.value = ""; downloadButton.disabled = true; updateCounts(); };
    reader.readAsText(file);
    fileInput.value = "";
  });
  input.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); runPolish(); }
  });
  updateCounts();
})();
