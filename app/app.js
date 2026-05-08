const STORAGE_VERSION = 1;
const DB_NAME = "gantt-app";
const STORE_NAME = "tasks";

const state = {
  tasks: [],
  view: "cards",
  scale: "week",
  editingId: null,
  pendingCsv: [],
  pendingJson: [],
};

const elements = {
  cardsSection: document.getElementById("cardsSection"),
  tableSection: document.getElementById("tableSection"),
  ganttSection: document.getElementById("ganttSection"),
  ganttHeader: document.getElementById("ganttHeader"),
  ganttBody: document.getElementById("ganttBody"),
  viewCards: document.getElementById("viewCards"),
  viewTable: document.getElementById("viewTable"),
  viewGantt: document.getElementById("viewGantt"),
  scaleWeek: document.getElementById("scaleWeek"),
  scaleMonth: document.getElementById("scaleMonth"),
  addTaskTop: document.getElementById("addTaskTop"),
  navAdd: document.getElementById("navAdd"),
  navExport: document.getElementById("navExport"),
  navImport: document.getElementById("navImport"),
  navBackup: document.getElementById("navBackup"),
  navReset: document.getElementById("navReset"),
  searchInput: document.getElementById("searchInput"),
  filterAssignee: document.getElementById("filterAssignee"),
  filterStatus: document.getElementById("filterStatus"),
  sortSelect: document.getElementById("sortSelect"),
  taskModal: document.getElementById("taskModal"),
  taskForm: document.getElementById("taskForm"),
  modalTitle: document.getElementById("modalTitle"),
  deleteTask: document.getElementById("deleteTask"),
  closeModal: document.getElementById("closeModal"),
  progressValue: document.getElementById("progressValue"),
  validationMessage: document.getElementById("validationMessage"),
  importModal: document.getElementById("importModal"),
  importForm: document.getElementById("importForm"),
  csvFile: document.getElementById("csvFile"),
  csvPreview: document.getElementById("csvPreview"),
  closeImport: document.getElementById("closeImport"),
  backupModal: document.getElementById("backupModal"),
  backupForm: document.getElementById("backupForm"),
  jsonFile: document.getElementById("jsonFile"),
  jsonPreview: document.getElementById("jsonPreview"),
  downloadBackup: document.getElementById("downloadBackup"),
  closeBackup: document.getElementById("closeBackup"),
  cardTemplate: document.getElementById("cardTemplate"),
};

const statusColors = {
  "未着手": "#7f8c8d",
  "進行中": "#3498db",
  "完了": "#27ae60",
};

const sampleTasks = [
  {
    id: crypto.randomUUID(),
    title: "要件整理",
    start: todayOffset(-3),
    end: todayOffset(2),
    assignee: "佐藤",
    progress: 60,
    status: "進行中",
    memo: "ヒアリング完了済み",
    color: "#4c8bf5",
    createdAt: Date.now() - 200000,
  },
  {
    id: crypto.randomUUID(),
    title: "デザイン作成",
    start: todayOffset(1),
    end: todayOffset(7),
    assignee: "田中",
    progress: 20,
    status: "未着手",
    memo: "ワイヤーフレームから開始",
    color: "#f5a623",
    createdAt: Date.now() - 150000,
  },
  {
    id: crypto.randomUUID(),
    title: "開発",
    start: todayOffset(5),
    end: todayOffset(15),
    assignee: "山本",
    progress: 10,
    status: "未着手",
    memo: "API設計とUI実装",
    color: "#8e44ad",
    createdAt: Date.now() - 100000,
  },
];

const storage = createStorage();

init();

async function init() {
  state.tasks = await storage.getAll();
  if (state.tasks.length === 0) {
    await storage.bulkPut(sampleTasks);
    state.tasks = await storage.getAll();
  }
  bindEvents();
  render();
  registerServiceWorker();
}

function bindEvents() {
  elements.viewCards.addEventListener("click", () => switchView("cards"));
  elements.viewTable.addEventListener("click", () => switchView("table"));
  elements.viewGantt.addEventListener("click", () => switchView("gantt"));
  elements.scaleWeek.addEventListener("click", () => switchScale("week"));
  elements.scaleMonth.addEventListener("click", () => switchScale("month"));
  elements.addTaskTop.addEventListener("click", () => openModal());
  elements.navAdd.addEventListener("click", () => openModal());
  elements.navExport.addEventListener("click", exportCsv);
  elements.navImport.addEventListener("click", () => elements.importModal.showModal());
  elements.navBackup.addEventListener("click", () => elements.backupModal.showModal());
  elements.navReset.addEventListener("click", resetAll);
  elements.closeModal.addEventListener("click", () => elements.taskModal.close());
  elements.closeImport.addEventListener("click", () => elements.importModal.close());
  elements.closeBackup.addEventListener("click", () => elements.backupModal.close());
  elements.searchInput.addEventListener("input", render);
  elements.filterAssignee.addEventListener("change", render);
  elements.filterStatus.addEventListener("change", render);
  elements.sortSelect.addEventListener("change", render);

  elements.taskForm.progress.addEventListener("input", (event) => {
    elements.progressValue.textContent = `${event.target.value}%`;
  });

  elements.taskForm.addEventListener("submit", handleSaveTask);
  elements.deleteTask.addEventListener("click", handleDeleteTask);

  elements.csvFile.addEventListener("change", handleCsvFile);
  elements.importForm.addEventListener("submit", handleCsvImport);

  elements.downloadBackup.addEventListener("click", downloadJsonBackup);
  elements.jsonFile.addEventListener("change", handleJsonFile);
  elements.backupForm.addEventListener("submit", handleJsonImport);
}

function switchView(view) {
  state.view = view;
  elements.viewCards.classList.toggle("active", view === "cards");
  elements.viewTable.classList.toggle("active", view === "table");
  elements.viewGantt.classList.toggle("active", view === "gantt");
  elements.cardsSection.classList.toggle("hidden", view !== "cards");
  elements.tableSection.classList.toggle("hidden", view !== "table");
  elements.ganttSection.classList.toggle("hidden", view !== "gantt");
  render();
}

function switchScale(scale) {
  state.scale = scale;
  elements.scaleWeek.classList.toggle("active", scale === "week");
  elements.scaleMonth.classList.toggle("active", scale === "month");
  renderGantt();
}

function openModal(task = null) {
  state.editingId = task ? task.id : null;
  elements.modalTitle.textContent = task ? "工程を編集" : "工程を追加";
  elements.deleteTask.classList.toggle("hidden", !task);
  elements.validationMessage.textContent = "";

  elements.taskForm.title.value = task?.title ?? "";
  elements.taskForm.assignee.value = task?.assignee ?? "";
  elements.taskForm.start.value = task?.start ?? "";
  elements.taskForm.end.value = task?.end ?? "";
  elements.taskForm.progress.value = task?.progress ?? 0;
  elements.progressValue.textContent = `${elements.taskForm.progress.value}%`;
  elements.taskForm.status.value = task?.status ?? "未着手";
  elements.taskForm.memo.value = task?.memo ?? "";
  elements.taskForm.color.value = task?.color ?? randomColor();

  elements.taskModal.showModal();
}

async function handleSaveTask(event) {
  event.preventDefault();
  const data = new FormData(elements.taskForm);
  const start = data.get("start");
  const end = data.get("end");

  if (!start || !end || parseDate(end) < parseDate(start)) {
    elements.validationMessage.textContent = "終了日が開始日より前です。";
    return;
  }

  const task = {
    id: state.editingId ?? crypto.randomUUID(),
    title: data.get("title").trim(),
    assignee: data.get("assignee").trim(),
    start,
    end,
    progress: Number(data.get("progress")),
    status: data.get("status"),
    memo: data.get("memo").trim(),
    color: data.get("color") || randomColor(),
    createdAt: state.editingId
      ? state.tasks.find((item) => item.id === state.editingId)?.createdAt ?? Date.now()
      : Date.now(),
  };

  if (!task.title || !task.assignee) {
    elements.validationMessage.textContent = "工程名と担当を入力してください。";
    return;
  }

  await storage.put(task);
  state.tasks = await storage.getAll();
  elements.taskModal.close();
  render();
}

async function handleDeleteTask() {
  if (!state.editingId) return;
  await storage.remove(state.editingId);
  state.tasks = await storage.getAll();
  elements.taskModal.close();
  render();
}

function render() {
  const filtered = applyFilters(state.tasks);
  renderCards(filtered);
  renderTable(filtered);
  renderGantt(filtered);
  updateFilterOptions();
}

function applyFilters(tasks) {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  const assignee = elements.filterAssignee.value;
  const status = elements.filterStatus.value;
  const sort = elements.sortSelect.value;

  let list = tasks.filter((task) => {
    const haystack = `${task.title} ${task.assignee} ${task.memo}`.toLowerCase();
    const keywordMatch = keyword ? haystack.includes(keyword) : true;
    const assigneeMatch = assignee ? task.assignee === assignee : true;
    const statusMatch = status ? task.status === status : true;
    return keywordMatch && assigneeMatch && statusMatch;
  });

  list = [...list].sort((a, b) => {
    if (sort === "assignee") {
      return a.assignee.localeCompare(b.assignee, "ja") || a.start.localeCompare(b.start);
    }
    if (sort === "manual") {
      return a.createdAt - b.createdAt;
    }
    return a.start.localeCompare(b.start);
  });

  return list;
}

function renderCards(tasks) {
  elements.cardsSection.innerHTML = "";
  if (tasks.length === 0) {
    elements.cardsSection.innerHTML = "<p>工程がありません。追加してください。</p>";
    return;
  }
  tasks.forEach((task) => {
    const card = elements.cardTemplate.content.cloneNode(true);
    const article = card.querySelector(".task-card");
    article.style.borderLeft = `6px solid ${task.color}`;
    card.querySelector(".card-title").textContent = task.title;
    const statusEl = card.querySelector(".status");
    statusEl.textContent = task.status;
    statusEl.style.background = statusColors[task.status] || task.color;
    card.querySelector(".meta").innerHTML = `担当: ${task.assignee}<br>期間: ${task.start} 〜 ${task.end}`;
    const progressBar = card.querySelector(".progress-bar span");
    progressBar.style.width = `${task.progress}%`;
    progressBar.style.background = task.color;
    card.querySelector(".memo").textContent = task.memo || "メモなし";
    card.querySelector("button").addEventListener("click", () => openModal(task));
    elements.cardsSection.appendChild(card);
  });
}

function renderTable(tasks) {
  if (tasks.length === 0) {
    elements.tableSection.innerHTML = "<p>工程がありません。</p>";
    return;
  }
  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>工程</th>
        <th>担当</th>
        <th>開始</th>
        <th>終了</th>
        <th>進捗</th>
        <th>ステータス</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  tasks.forEach((task) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.assignee}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.progress}%</td>
      <td>${task.status}</td>
      <td><button class="btn small">編集</button></td>
    `;
    row.querySelector("button").addEventListener("click", () => openModal(task));
    tbody.appendChild(row);
  });
  elements.tableSection.innerHTML = "";
  elements.tableSection.appendChild(table);
}

function renderGantt(tasks) {
  elements.ganttHeader.innerHTML = "";
  elements.ganttBody.innerHTML = "";
  const { startDate, endDate, days } = getRange(tasks, state.scale);

  const headerRows = buildGanttHeader(days, startDate, endDate, state.scale);
  elements.ganttHeader.appendChild(headerRows);

  const body = document.createElement("div");
  body.className = "gantt-body";

  tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = "gantt-row";
    const label = document.createElement("div");
    label.className = "gantt-label";
    label.textContent = task.title;
    row.appendChild(label);

    const cells = document.createElement("div");
    cells.className = "gantt-cells";
    cells.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;

    days.forEach(() => {
      const cell = document.createElement("div");
      cell.className = "gantt-cell";
      cells.appendChild(cell);
    });

    const startIndex = days.findIndex((day) => day === task.start);
    const endIndex = days.findIndex((day) => day === task.end);
    if (startIndex !== -1 && endIndex !== -1) {
      const bar = document.createElement("div");
      bar.className = "gantt-bar";
      bar.style.left = `${(startIndex / days.length) * 100}%`;
      bar.style.width = `${((endIndex - startIndex + 1) / days.length) * 100}%`;
      bar.style.background = task.color;

      const progress = document.createElement("div");
      progress.className = "progress";
      progress.style.width = `${task.progress}%`;
      bar.appendChild(progress);
      cells.appendChild(bar);
    }

    row.appendChild(cells);
    body.appendChild(row);
  });

  elements.ganttBody.appendChild(body);
  const todayIndex = days.findIndex((day) => day === formatDate(new Date()));
  if (todayIndex !== -1) {
    const line = document.createElement("div");
    line.className = "today-line";
    line.style.left = `calc(120px + ${(todayIndex / days.length) * 100}%)`;
    elements.ganttBody.appendChild(line);
  }
}

function buildGanttHeader(days, startDate, endDate, scale) {
  const headerWrapper = document.createElement("div");
  headerWrapper.className = "gantt-row";
  const label = document.createElement("div");
  label.className = "gantt-label";
  label.textContent = "工程";
  headerWrapper.appendChild(label);

  const headerCells = document.createElement("div");
  headerCells.className = "gantt-cells";
  headerCells.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;

  if (scale === "month") {
    const monthRow = document.createElement("div");
    monthRow.style.display = "grid";
    monthRow.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;
    monthRow.style.gridColumn = "1 / -1";
    monthRow.style.borderBottom = "1px solid var(--border)";

    let currentMonth = "";
    let spanStart = 0;
    days.forEach((day, index) => {
      const date = parseDate(day);
      const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      if (monthLabel !== currentMonth) {
        if (currentMonth) {
          const span = document.createElement("div");
          span.textContent = currentMonth;
          span.style.gridColumn = `${spanStart + 1} / ${index + 1}`;
          span.style.fontSize = "11px";
          span.style.padding = "4px";
          monthRow.appendChild(span);
        }
        currentMonth = monthLabel;
        spanStart = index;
      }
      if (index === days.length - 1) {
        const span = document.createElement("div");
        span.textContent = currentMonth;
        span.style.gridColumn = `${spanStart + 1} / ${index + 2}`;
        span.style.fontSize = "11px";
        span.style.padding = "4px";
        monthRow.appendChild(span);
      }
    });
    headerCells.appendChild(monthRow);
  }

  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "gantt-cell";
    const date = parseDate(day);
    cell.textContent = scale === "week"
      ? `${date.getMonth() + 1}/${date.getDate()} (${["日", "月", "火", "水", "木", "金", "土"][date.getDay()]})`
      : `${date.getDate()}`;
    cell.style.fontSize = "11px";
    cell.style.padding = "4px";
    headerCells.appendChild(cell);
  });

  headerWrapper.appendChild(headerCells);
  return headerWrapper;
}

function updateFilterOptions() {
  const assignees = Array.from(new Set(state.tasks.map((task) => task.assignee)));
  const current = elements.filterAssignee.value;
  elements.filterAssignee.innerHTML = '<option value="">担当（すべて）</option>';
  assignees.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    elements.filterAssignee.appendChild(option);
  });
  elements.filterAssignee.value = assignees.includes(current) ? current : "";
}

function getRange(tasks, scale) {
  const today = parseDate(formatDate(new Date()));
  const starts = tasks.map((task) => parseDate(task.start));
  const ends = tasks.map((task) => parseDate(task.end));
  let minStart = starts.length ? new Date(Math.min(...starts)) : today;
  let maxEnd = ends.length ? new Date(Math.max(...ends)) : today;

  if (scale === "week") {
    minStart = startOfWeek(minStart);
    maxEnd = endOfWeek(maxEnd);
  } else {
    minStart = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
    maxEnd = new Date(maxEnd.getFullYear(), maxEnd.getMonth() + 1, 0);
  }

  if (maxEnd < minStart) {
    maxEnd = minStart;
  }

  const days = [];
  for (let d = new Date(minStart); d <= maxEnd; d.setDate(d.getDate() + 1)) {
    days.push(formatDate(d));
  }
  return { startDate: minStart, endDate: maxEnd, days };
}

function startOfWeek(date) {
  const d = new Date(date);
  const diff = d.getDay();
  d.setDate(d.getDate() - diff);
  return d;
}

function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function todayOffset(diff) {
  const d = new Date();
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

function randomColor() {
  const palette = ["#2f80ed", "#27ae60", "#f2994a", "#9b51e0", "#eb5757"];
  return palette[Math.floor(Math.random() * palette.length)];
}

function exportCsv() {
  const headers = [
    "title",
    "start",
    "end",
    "assignee",
    "progress",
    "status",
    "memo",
    "color",
  ];
  const lines = [headers.join(",")];
  state.tasks.forEach((task) => {
    const row = headers.map((key) => csvEscape(task[key] ?? ""));
    lines.push(row.join(","));
  });
  downloadFile("tasks.csv", lines.join("\n"));
}

function handleCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.pendingCsv = parseCsv(reader.result);
    elements.csvPreview.innerHTML = previewTasks(state.pendingCsv, "CSV");
  };
  reader.readAsText(file);
}

async function handleCsvImport(event) {
  event.preventDefault();
  if (state.pendingCsv.length === 0) return;
  const mode = elements.importForm.importMode.value;
  await importTasks(state.pendingCsv, mode);
  state.pendingCsv = [];
  elements.csvPreview.innerHTML = "";
  elements.importModal.close();
}

function downloadJsonBackup() {
  downloadFile("backup.json", JSON.stringify(state.tasks, null, 2));
}

function handleJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state.pendingJson = Array.isArray(data) ? data : [];
      elements.jsonPreview.innerHTML = previewTasks(state.pendingJson, "JSON");
    } catch (error) {
      elements.jsonPreview.textContent = "JSONの読み込みに失敗しました。";
      state.pendingJson = [];
    }
  };
  reader.readAsText(file);
}

async function handleJsonImport(event) {
  event.preventDefault();
  if (state.pendingJson.length === 0) return;
  const mode = elements.backupForm.backupMode.value;
  await importTasks(state.pendingJson, mode);
  state.pendingJson = [];
  elements.jsonPreview.innerHTML = "";
  elements.backupModal.close();
}

async function importTasks(tasks, mode) {
  const normalized = tasks
    .filter((task) => task.title)
    .map((task) => ({
      id: crypto.randomUUID(),
      title: task.title,
      start: task.start,
      end: task.end,
      assignee: task.assignee,
      progress: Number(task.progress || 0),
      status: task.status || "未着手",
      memo: task.memo || "",
      color: task.color || randomColor(),
      createdAt: Date.now(),
    }));

  if (mode === "overwrite") {
    await storage.clear();
  }
  await storage.bulkPut(normalized);
  state.tasks = await storage.getAll();
  render();
}

async function resetAll() {
  const ok = confirm("すべての工程を削除しますか？");
  if (!ok) return;
  await storage.clear();
  state.tasks = [];
  render();
}

function previewTasks(tasks, label) {
  if (!tasks.length) return `${label}にデータがありません。`;
  const lines = tasks.slice(0, 5).map((task) => `・${task.title} (${task.assignee})`);
  return `${tasks.length}件を読み込みました。<br>${lines.join("<br>")}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const task = {};
    headers.forEach((header, index) => {
      task[header] = values[index] ?? "";
    });
    return task;
  });
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function createStorage() {
  if (!("indexedDB" in window)) {
    return createLocalStorageFallback();
  }
  let dbPromise = null;

  const openDb = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, STORAGE_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  };

  const run = async (mode, action) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  return {
    async getAll() {
      return run("readonly", (store) => store.getAll());
    },
    async put(task) {
      return run("readwrite", (store) => store.put(task));
    },
    async bulkPut(tasks) {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        tasks.forEach((task) => store.put(task));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async remove(id) {
      return run("readwrite", (store) => store.delete(id));
    },
    async clear() {
      return run("readwrite", (store) => store.clear());
    },
  };
}

function createLocalStorageFallback() {
  const key = "gantt-tasks";
  const read = () => JSON.parse(localStorage.getItem(key) || "[]");
  const write = (data) => localStorage.setItem(key, JSON.stringify(data));

  return {
    async getAll() {
      return read();
    },
    async put(task) {
      const tasks = read();
      const index = tasks.findIndex((item) => item.id === task.id);
      if (index === -1) {
        tasks.push(task);
      } else {
        tasks[index] = task;
      }
      write(tasks);
    },
    async bulkPut(tasks) {
      const existing = read();
      write([...existing, ...tasks]);
    },
    async remove(id) {
      const tasks = read().filter((item) => item.id !== id);
      write(tasks);
    },
    async clear() {
      write([]);
    },
  };
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
