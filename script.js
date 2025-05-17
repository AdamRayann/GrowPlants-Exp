let week = 0;
let height = 0;
let selectedSeed = null;

const seedGrowthProfiles = {
  sunflower: {
    base: 2.2,
    lightFactor: 0.8,
    waterFactor: 0.5,
    soilIdeal: 7.0,
    soilPenalty: 0.6,
    maxHeight: 220
  },
  tomato: {
    base: 2.0,
    lightFactor: 0.7,
    waterFactor: 1,
    soilIdeal: 6.5,
    soilPenalty: 0.7,
    maxHeight: 185
  },
  corn: {
    base: 2.2,
    lightFactor: 0.5,
    waterFactor: 0.3,
    soilIdeal: 6.8,
    soilPenalty: 0.5,
    maxHeight: 180
  }
};

function grow() {
  const messageBox = document.getElementById("message");

  if (!selectedSeed) {
    messageBox.textContent = "يرجى اختيار بذرة أولاً!";
    return;
  }

  if (week >= 6) {
    messageBox.textContent = "انتهى وقت التجربة (6 أسابيع) 🌱";
    return;
  }

  // Clear message if valid action
  messageBox.textContent = "";


  const sunlight = parseInt(document.getElementById("sunlight").value); // 4, 6, 8, 10
  const water = parseFloat(document.getElementById("water").value);     // 0.5, 1, 2
  const soil = parseFloat(document.getElementById("soil").value);       // 5.5, 7.0, 8.5
  const manure = document.getElementById("manure").checked;             // ✅ true or false

  week++;

  const profile = seedGrowthProfiles[selectedSeed];
  const soilEffect = Math.abs(profile.soilIdeal - soil) <= 0.3 ? 1 : profile.soilPenalty;

  // Adjusted growth logic for faster and realistic growth
  let manureVal = manure ? 1 : 0;
  let weeklyGrowth =
    (profile.base +
      profile.lightFactor *0.8* (sunlight - 4) +
      profile.waterFactor * water) *
    (soilEffect+manureVal) *
    1.2; // boost for week-scaling

  // Gentle decline in later weeks
  let decayFactor = 1;
  if (week === 5) decayFactor = 0.8;
  if (week === 6) decayFactor = 0.6;

  const actualGrowth = Math.round(weeklyGrowth * week * decayFactor);
  height += actualGrowth;

  // Cap at max height
  height = Math.min(height, profile.maxHeight);

  // ⬇️ Log this week's growth
  const manureText = manure ? "مسمد" : "غير مسمد";
  let soilText = "";
  if (soil === 5.5) soilText = "رملية";
  else if (soil === 7.0) soilText = "طينية";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>الأسبوع ${week}</td>
    <td>${sunlight}</td>
    <td>${water}</td>
    <td>${soilText}</td>
    <td>${height.toFixed(2)} سم</td>
    <td>${manureText}</td>
  `;
  document.querySelector("#growth-log tbody").appendChild(row);

  // ⬇️ Choose stage based on height-to-max ratio (0–8)
  const stageRatio = height / profile.maxHeight;
  const stageIndex = Math.min(11, Math.max(1, Math.floor(stageRatio * 12)));
  
  const imgPath = `/img/${selectedSeed}_stage${stageIndex}.png`;

  document.getElementById("sunflower-img").src = imgPath;
}

function resetSimulation() {
  week = 0;
  height = 0;
  selectedSeed = null;
  const messageBox = document.getElementById("message");
  messageBox.textContent = ""; // Clear the message
  document.getElementById("sunflower-img").src = "/img/empty_plot.png";
  document.querySelector("#growth-log tbody").innerHTML = "";
}

function selectSeed(event) {
  const seedId = event.dataTransfer.getData("seed");
  if (!seedId) return;

  selectedSeed = seedId;
  week = 0;
  height = 0;

  hideInstruction();
  document.getElementById("sunflower-img").src = `/img/${selectedSeed}_stage0.png`;
  document.querySelector("#growth-log tbody").innerHTML = "";
  const messageBox = document.getElementById("message");
  messageBox.textContent = ""; // Clear the message
}

document.querySelectorAll(".seed").forEach(seed => {
  seed.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("seed", seed.id);
  });
});


document.getElementById("soil").addEventListener("change", function () {
  const selectedSoilText = this.options[this.selectedIndex].text;
  const container = document.querySelector(".sunflower-container");

  if (selectedSoilText.includes("رملية")) {
    container.style.borderBottom = "50px solid #eea978";
  } else {
    container.style.borderBottom = "50px solid #8b4513"; // default soil color
  }
});

let instructionTimer = setTimeout(showInstruction, 5000);

function showInstruction() {
  if (!selectedSeed) {
    document.getElementById("drag-instruction").style.display = "block";
  }
}

function hideInstruction() {
  document.getElementById("drag-instruction").style.display = "none";
  clearTimeout(instructionTimer); // prevent it from reappearing
}


document.getElementById("manure").addEventListener("change", function () {
  const img = document.getElementById("manure-img");
  img.style.display = this.checked ? "block" : "none";
});


const stages = Array.from({ length: 12 }, (_, i) => i);
stages.forEach(i => {
  const img = new Image();
  img.src = `/img/${selectedSeed}_stage${i}.png`;
});
