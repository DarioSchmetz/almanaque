const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const SHORT_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const PRESET_QUOTES = [
  "Nuevos comienzos, nuevas metas.",
  "Celebrando cada momento juntos.",
  "Un paso a la vez hacia tus sueños.",
  "La alegría está en las cosas simples.",
  "Tiempo de crecer y agradecer.",
  "Mitad de año con la mejor energía.",
  "Días fríos, corazones cálidos.",
  "Cada día cuenta una historia.",
  "Florece donde estés plantado.",
  "Sonreí, lo mejor está por venir.",
  "Agradecer todo lo vivido.",
  "Felices fiestas y próspero año."
];

const monthsData = MONTHS.map((_, i) => ({
  photoUrl: "",
  imgObj: null,
  posX: 50,
  posY: 50,
  zoom: 100,
  quote: PRESET_QUOTES[i]
}));

let activeMonth = 0;

const $ = (id) => document.getElementById(id);

const yearInput = $("yearInput");
const countrySelect = $("countrySelect");
const titleInput = $("titleInput");
const weekStart = $("weekStart");
const quoteFontSelect = $("quoteFontSelect");
const opacityRange = $("opacityRange");
const opVal = $("opVal");
const cardBgColor = $("cardBgColor");
const textColorInput = $("textColorInput");
const accentColorInput = $("accentColorInput");

const statusPills = $("statusPills");
const editorMonthTitle = $("editorMonthTitle");
const singlePhotoInput = $("singlePhotoInput");
const posXRange = $("posXRange");
const posYRange = $("posYRange");
const zoomRange = $("zoomRange");
const posXVal = $("posXVal");
const posYVal = $("posYVal");
const zoomVal = $("zoomVal");
const presetQuoteSelect = $("presetQuoteSelect");
const customQuoteInput = $("customQuoteInput");
const msgStatus = $("msgStatus");

PRESET_QUOTES.forEach((q) => {
  const opt = document.createElement("option");
  opt.value = q;
  opt.textContent = q;
  presetQuoteSelect.appendChild(opt);
});

// Crea la estructura base de los 12 meses una sola vez para no recargar <img> en Firefox
function initGrid() {
  const grid = $("grid12");
  grid.innerHTML = "";

  for (let m = 0; m < 12; m++) {
    const card = document.createElement("div");
    card.className = "month-card";
    card.dataset.month = m;
    card.onclick = () => selectMonth(m);

    const img = document.createElement("img");
    img.className = "month-bg-img";
    img.alt = "";
    img.style.display = "none";

    const overlay = document.createElement("div");
    overlay.className = "month-overlay";

    card.appendChild(img);
    card.appendChild(overlay);
    grid.appendChild(card);
  }
}

function setMonthPhotoFromFile(idx, file) {
  if (!file) return;

  if (monthsData[idx].photoUrl) {
    URL.revokeObjectURL(monthsData[idx].photoUrl);
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    monthsData[idx].photoUrl = objectUrl;
    monthsData[idx].imgObj = img;
    renderSheet();
  };
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    msgStatus.style.color = "#b91c1c";
    msgStatus.textContent = `No se pudo leer la imagen del mes ${MONTHS[idx]}`;
  };
  img.src = objectUrl;
}

function clearMonthPhoto(idx) {
  if (monthsData[idx].photoUrl) {
    URL.revokeObjectURL(monthsData[idx].photoUrl);
  }
  monthsData[idx].photoUrl = "";
  monthsData[idx].imgObj = null;
  renderSheet();
}

function renderPills() {
  statusPills.innerHTML = "";
  SHORT_MONTHS.forEach((sm, i) => {
    const pill = document.createElement("div");
    pill.className = "pill" + (monthsData[i].photoUrl ? " has-photo" : "") + (i === activeMonth ? " active" : "");
    pill.textContent = `${i + 1}. ${sm}`;
    pill.onclick = () => selectMonth(i);
    statusPills.appendChild(pill);
  });
}

function selectMonth(idx) {
  activeMonth = idx;
  const data = monthsData[idx];
  editorMonthTitle.textContent = `${idx + 1}. ${MONTHS[idx]}`;
  posXRange.value = data.posX;
  posYRange.value = data.posY;
  zoomRange.value = data.zoom;
  posXVal.textContent = data.posX;
  posYVal.textContent = data.posY;
  zoomVal.textContent = data.zoom;
  customQuoteInput.value = data.quote;
  presetQuoteSelect.value = PRESET_QUOTES.includes(data.quote) ? data.quote : "";
  singlePhotoInput.value = "";
  renderPills();
}

function getEaster(y) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

function nthWeekdayOfMonth(year, month, weekday, n) {
  const firstDow = new Date(year, month, 1).getDay();
  const diff = (weekday - firstDow + 7) % 7;
  return 1 + diff + (n - 1) * 7;
}

function getHolidaysByCountry(year, country) {
  if (country === "NONE") return [];
  const add = (dt, n) => {
    const x = new Date(dt);
    x.setDate(x.getDate() + n);
    return x;
  };
  const easter = getEaster(year);
  const gf = add(easter, -2);
  const list = [];

  if (country === "AR") {
    list.push(
      { m: 0, d: 1, name: "Año Nuevo" },
      { m: 2, d: 24, name: "Memoria" },
      { m: 3, d: 2, name: "Malvinas" },
      { m: 4, d: 1, name: "Trabajador" },
      { m: 4, d: 25, name: "Rev. de Mayo" },
      { m: 5, d: 17, name: "Güemes" },
      { m: 5, d: 20, name: "Bandera" },
      { m: 6, d: 9, name: "Independencia" },
      { m: 7, d: 17, name: "San Martín" },
      { m: 9, d: 12, name: "Diversidad" },
      { m: 10, d: 20, name: "Soberanía" },
      { m: 11, d: 8, name: "Inmaculada" },
      { m: 11, d: 25, name: "Navidad" }
    );
    [add(easter, -48), add(easter, -47)].forEach((dt) =>
      list.push({ m: dt.getMonth(), d: dt.getDate(), name: "Carnaval" })
    );
    list.push({ m: gf.getMonth(), d: gf.getDate(), name: "Viernes Santo" });
  } else if (country === "ES") {
    list.push(
      { m: 0, d: 1, name: "Año Nuevo" },
      { m: 0, d: 6, name: "Reyes Magos" },
      { m: 4, d: 1, name: "Día del Trabajador" },
      { m: 7, d: 15, name: "Asunción" },
      { m: 9, d: 12, name: "Hispanidad" },
      { m: 10, d: 1, name: "Todos los Santos" },
      { m: 11, d: 6, name: "Constitución" },
      { m: 11, d: 8, name: "Inmaculada" },
      { m: 11, d: 25, name: "Navidad" },
      { m: gf.getMonth(), d: gf.getDate(), name: "Viernes Santo" }
    );
  } else if (country === "MX") {
    list.push(
      { m: 0, d: 1, name: "Año Nuevo" },
      { m: 1, d: nthWeekdayOfMonth(year, 1, 1, 1), name: "Constitución" },
      { m: 2, d: nthWeekdayOfMonth(year, 2, 1, 3), name: "Benito Juárez" },
      { m: 4, d: 1, name: "Día del Trabajo" },
      { m: 8, d: 16, name: "Independencia" },
      { m: 10, d: nthWeekdayOfMonth(year, 10, 1, 3), name: "Revolución" },
      { m: 11, d: 25, name: "Navidad" }
    );
  } else if (country === "CL") {
    list.push(
      { m: 0, d: 1, name: "Año Nuevo" },
      { m: 4, d: 1, name: "Día del Trabajo" },
      { m: 4, d: 21, name: "Glorias Navales" },
      { m: 5, d: 20, name: "Pueblos Indígenas" },
      { m: 6, d: 16, name: "Virgen del Carmen" },
      { m: 7, d: 15, name: "Asunción" },
      { m: 8, d: 18, name: "Fiestas Patrias" },
      { m: 8, d: 19, name: "Glorias del Ejército" },
      { m: 9, d: 12, name: "Encuentro Dos Mundos" },
      { m: 9, d: 31, name: "Iglesias Evangélicas" },
      { m: 10, d: 1, name: "Todos los Santos" },
      { m: 11, d: 8, name: "Inmaculada" },
      { m: 11, d: 25, name: "Navidad" },
      { m: gf.getMonth(), d: gf.getDate(), name: "Viernes Santo" }
    );
  } else if (country === "UY") {
    list.push(
      { m: 0, d: 1, name: "Año Nuevo" },
      { m: 0, d: 6, name: "Reyes" },
      { m: 3, d: 19, name: "Treinta y Tres" },
      { m: 4, d: 1, name: "Día de los Trabajadores" },
      { m: 4, d: 18, name: "Batalla de Las Piedras" },
      { m: 5, d: 19, name: "Natalicio de Artigas" },
      { m: 6, d: 18, name: "Jura de la Constitución" },
      { m: 7, d: 25, name: "Declaratoria de la Independencia" },
      { m: 9, d: 12, name: "Día de la Raza" },
      { m: 10, d: 2, name: "Día de los Difuntos" },
      { m: 11, d: 25, name: "Navidad" }
    );
  }

  return list.sort((a, b) => a.m - b.m || a.d - b.d);
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderSheet() {
  const year = parseInt(yearInput.value, 10) || 2027;
  const country = countrySelect.value;
  const monStart = weekStart.value === "lun";
  const holidays = getHolidaysByCountry(year, country);
  const showHol = holidays.length > 0;

  const op = parseInt(opacityRange.value, 10) / 100;
  opVal.textContent = `${opacityRange.value}%`;
  const overlayRgba = hexToRgba(cardBgColor.value, op);

  document.documentElement.style.setProperty("--text-color", textColorInput.value);
  document.documentElement.style.setProperty("--accent-color", accentColorInput.value);
  document.documentElement.style.setProperty("--font-quote", quoteFontSelect.value);

  $("previewTitle").textContent = titleInput.value || "Calendario Anual";
  $("previewYear").textContent = year;

  const cards = $("grid12").children;
  const wkLabels = monStart ? ["L", "M", "M", "J", "V", "S", "D"] : ["D", "L", "M", "M", "J", "V", "S"];

  for (let m = 0; m < 12; m++) {
    const dMonth = monthsData[m];
    const card = cards[m];
    const img = card.querySelector(".month-bg-img");
    const overlay = card.querySelector(".month-overlay");

    if (dMonth.photoUrl) {
      const scale = dMonth.zoom / 100;
      if (img.getAttribute("src") !== dMonth.photoUrl) {
        img.src = dMonth.photoUrl;
      }
      img.style.display = "block";
      img.style.objectPosition = `${dMonth.posX}% ${dMonth.posY}%`;
      img.style.transform = `scale(${scale})`;
      img.style.transformOrigin = `${dMonth.posX}% ${dMonth.posY}%`;
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
    }

    overlay.style.background = overlayRgba;

    let html = `
      <div class="month-top">
        <div class="month-name">${MONTHS[m]}</div>
        <div class="month-quote">${dMonth.quote}</div>
      </div>
      <div class="wk-row">
        ${wkLabels
          .map((l, idx) => {
            const isSun = monStart ? idx === 6 : idx === 0;
            return `<span class="${isSun ? "sun" : ""}">${l}</span>`;
          })
          .join("")}
      </div>
      <div class="days-row">
    `;

    const rawFirst = new Date(year, m, 1).getDay();
    const offset = monStart ? (rawFirst === 0 ? 6 : rawFirst - 1) : rawFirst;
    const totalDays = new Date(year, m + 1, 0).getDate();

    for (let e = 0; e < offset; e++) html += `<span class="day-cell"></span>`;
    for (let day = 1; day <= totalDays; day++) {
      const dow = new Date(year, m, day).getDay();
      const isHol = holidays.some((h) => h.m === m && h.d === day);
      html += `<span class="day-cell${dow === 0 ? " sun" : ""}${isHol ? " holiday" : ""}">${day}</span>`;
    }

    html += `</div>`;
    overlay.innerHTML = html;
  }

  const holBar = $("holidaysBar");
  if (showHol) {
    const countryName = countrySelect.options[countrySelect.selectedIndex].text;
    holBar.innerHTML =
      `<strong>Feriados (${countryName}):</strong> ` +
      holidays.map((h) => `<strong>${h.d} ${SHORT_MONTHS[h.m]}</strong> ${h.name}`).join(" • ");
    holBar.style.display = "block";
  } else {
    holBar.style.display = "none";
  }
  renderPills();
}

$("downloadImgBtn").addEventListener("click", () => {
  msgStatus.style.color = "#166534";
  msgStatus.textContent = "Generando imagen...";
  try {
    const W = 2480;
    const H = 3508;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const year = parseInt(yearInput.value, 10) || 2027;
    const country = countrySelect.value;
    const monStart = weekStart.value === "lun";
    const holidays = getHolidaysByCountry(year, country);
    const showHol = holidays.length > 0;
    const op = parseInt(opacityRange.value, 10) / 100;
    const textColor = textColorInput.value;
    const accentColor = accentColorInput.value;
    const overlayRgba = hexToRgba(cardBgColor.value, op);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const pad = 110;
    ctx.fillStyle = textColor;
    ctx.font = "bold 56px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText((titleInput.value || "Calendario Anual").toUpperCase(), pad, pad + 55);

    ctx.fillStyle = accentColor;
    ctx.font = "bold 82px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(year), W - pad, pad + 62);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(pad, pad + 88);
    ctx.lineTo(W - pad, pad + 88);
    ctx.stroke();

    const gridTop = pad + 125;
    const gridBottom = showHol ? H - pad - 135 : H - pad;
    const gridW = W - pad * 2;
    const gridH = gridBottom - gridTop;
    const gap = 42;
    const cardW = (gridW - gap * 2) / 3;
    const cardH = (gridH - gap * 3) / 4;

    const wkLabels = monStart ? ["L", "M", "M", "J", "V", "S", "D"] : ["D", "L", "M", "M", "J", "V", "S"];

    for (let m = 0; m < 12; m++) {
      const col = m % 3;
      const row = Math.floor(m / 3);
      const x = pad + col * (cardW + gap);
      const y = gridTop + row * (cardH + gap);
      const dMonth = monthsData[m];

      ctx.save();
      const r = 22;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + cardW, y, x + cardW, y + cardH, r);
      ctx.arcTo(x + cardW, y + cardH, x, y + cardH, r);
      ctx.arcTo(x, y + cardH, x, y, r);
      ctx.arcTo(x, y, x + cardW, y, r);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(x, y, cardW, cardH);

      if (dMonth.imgObj && dMonth.imgObj.complete && dMonth.imgObj.naturalWidth > 0) {
        const img = dMonth.imgObj;
        const scaleZoom = dMonth.zoom / 100;
        const baseRatio = Math.max(cardW / img.width, cardH / img.height);
        const drawW = img.width * baseRatio * scaleZoom;
        const drawH = img.height * baseRatio * scaleZoom;
        const drawX = x + (cardW - drawW) * (dMonth.posX / 100);
        const drawY = y + (cardH - drawH) * (dMonth.posY / 100);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      ctx.fillStyle = overlayRgba;
      ctx.fillRect(x, y, cardW, cardH);

      ctx.textAlign = "center";
      ctx.fillStyle = accentColor;
      ctx.font = "bold 40px Arial, sans-serif";
      ctx.fillText(MONTHS[m].toUpperCase(), x + cardW / 2, y + 54);

      ctx.fillStyle = textColor;
      ctx.font = "italic bold 29px Georgia, serif";
      ctx.fillText(dMonth.quote, x + cardW / 2, y + 96, cardW - 36);

      ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 114);
      ctx.lineTo(x + cardW - 24, y + 114);
      ctx.stroke();

      const cellW = (cardW - 36) / 7;
      const startX = x + 18;
      ctx.font = "bold 28px Arial, sans-serif";
      wkLabels.forEach((lbl, idx) => {
        const isSun = monStart ? idx === 6 : idx === 0;
        ctx.fillStyle = isSun ? accentColor : textColor;
        ctx.fillText(lbl, startX + idx * cellW + cellW / 2, y + 154);
      });

      const rawFirst = new Date(year, m, 1).getDay();
      const offset = monStart ? (rawFirst === 0 ? 6 : rawFirst - 1) : rawFirst;
      const totalDays = new Date(year, m + 1, 0).getDate();
      const rowsCount = Math.ceil((offset + totalDays) / 7);
      const availH = cardH - 180;
      const rowH = availH / Math.max(rowsCount, 5);

      ctx.font = "bold 33px Arial, sans-serif";
      for (let day = 1; day <= totalDays; day++) {
        const slot = offset + day - 1;
        const c = slot % 7;
        const rw = Math.floor(slot / 7);
        const cx = startX + c * cellW + cellW / 2;
        const cy = y + 180 + rw * rowH + rowH * 0.55;

        const dow = new Date(year, m, day).getDay();
        const isHol = holidays.some((h) => h.m === m && h.d === day);

        if (isHol) {
          ctx.fillStyle = accentColor;
          const bw = cellW * 0.82;
          const bh = rowH * 0.72;
          ctx.fillRect(cx - bw / 2, cy - bh * 0.72, bw, bh);
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = dow === 0 ? accentColor : textColor;
        }
        ctx.fillText(String(day), cx, cy);
      }

      ctx.restore();

      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cardW, cardH);
    }

    if (showHol) {
      ctx.fillStyle = textColor;
      ctx.font = "25px Arial, sans-serif";
      ctx.textAlign = "left";
      const line1 = holidays
        .slice(0, 8)
        .map((h) => `${h.d} ${SHORT_MONTHS[h.m]}: ${h.name}`)
        .join("  •  ");
      const line2 = holidays
        .slice(8)
        .map((h) => `${h.d} ${SHORT_MONTHS[h.m]}: ${h.name}`)
        .join("  •  ");
      ctx.fillText("FERIADOS: " + line1, pad, H - pad - 48, W - pad * 2);
      if (line2) ctx.fillText(line2, pad, H - pad - 12, W - pad * 2);
    }

    const enlace = document.createElement("a");
    enlace.download = `Almanaque_${year}_${country}_A4.png`;
    enlace.href = canvas.toDataURL("image/png");
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    msgStatus.textContent = "✅ Imagen A4 descargada";
  } catch (err) {
    msgStatus.style.color = "#b91c1c";
    msgStatus.textContent = "Error: " + err.message;
  }
});

singlePhotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) setMonthPhotoFromFile(activeMonth, file);
});

$("removePhotoBtn").addEventListener("click", () => {
  clearMonthPhoto(activeMonth);
});

$("batchPhotos").addEventListener("change", (e) => {
  const files = Array.from(e.target.files).slice(0, 12);
  if (!files.length) return;
  if (files.length === 1) {
    setMonthPhotoFromFile(activeMonth, files[0]);
  } else {
    files.forEach((file, i) => setMonthPhotoFromFile(i, file));
  }
});

posXRange.addEventListener("input", () => {
  monthsData[activeMonth].posX = parseInt(posXRange.value, 10);
  posXVal.textContent = posXRange.value;
  renderSheet();
});

posYRange.addEventListener("input", () => {
  monthsData[activeMonth].posY = parseInt(posYRange.value, 10);
  posYVal.textContent = posYRange.value;
  renderSheet();
});

zoomRange.addEventListener("input", () => {
  monthsData[activeMonth].zoom = parseInt(zoomRange.value, 10);
  zoomVal.textContent = zoomRange.value;
  renderSheet();
});

presetQuoteSelect.addEventListener("change", () => {
  if (!presetQuoteSelect.value) return;
  monthsData[activeMonth].quote = presetQuoteSelect.value;
  customQuoteInput.value = presetQuoteSelect.value;
  renderSheet();
});

customQuoteInput.addEventListener("input", () => {
  monthsData[activeMonth].quote = customQuoteInput.value;
  renderSheet();
});

[
  yearInput,
  countrySelect,
  titleInput,
  weekStart,
  quoteFontSelect,
  opacityRange,
  cardBgColor,
  textColorInput,
  accentColorInput
].forEach((el) => el.addEventListener("input", renderSheet));

initGrid();
selectMonth(0);
renderSheet();