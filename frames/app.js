// --- Configuration & Constants ---
const STORAGE_KEY = "frames_v1";
const MAX_COLS_DESKTOP = 6;
const MAX_COLS_MOBILE = 3;
const DESKTOP_MEDIA = "(min-width: 900px)";

// Curated Starter Packs
const STARTER_PACKS = {
  dev: {
    name: "Dev & Docs Starter",
    icon: "🛠️",
    desc: "Hacker News, DevDocs, Bundlephobia & GitHub Trends",
    frames: [
      { url: "https://news.ycombinator.com/", title: "Hacker News", colSpan: 3, rowSpan: 3 },
      { url: "https://devdocs.io/", title: "DevDocs API Documentation", colSpan: 3, rowSpan: 3 },
      { url: "https://bundlephobia.com/", title: "Bundlephobia (npm sizes)", colSpan: 3, rowSpan: 2 },
      { url: "https://github.com/trending", title: "GitHub Trending", colSpan: 3, rowSpan: 2 }
    ]
  },
  monitoring: {
    name: "Status & Monitoring",
    icon: "📊",
    desc: "Cloudflare Status, GitHub Status, Fast.com & World Clock",
    frames: [
      { url: "https://www.cloudflarestatus.com/", title: "Cloudflare Status", colSpan: 3, rowSpan: 2 },
      { url: "https://www.githubstatus.com/", title: "GitHub Status", colSpan: 3, rowSpan: 2 },
      { url: "https://fast.com/", title: "Fast.com Speed Test", colSpan: 3, rowSpan: 2 },
      { url: "https://time.is/", title: "Time.is Clock", colSpan: 3, rowSpan: 2 }
    ]
  },
  productivity: {
    name: "Focus & Productivity",
    icon: "⏱️",
    desc: "Pomodoro Timer, Markdown Editor & Sound Stream",
    frames: [
      { url: "https://pomofocus.io/", title: "Pomofocus Timer", colSpan: 3, rowSpan: 3 },
      { url: "https://stackedit.io/app", title: "StackEdit Markdown", colSpan: 3, rowSpan: 3 }
    ]
  },
  design: {
    name: "Design & Inspiration",
    icon: "🎨",
    desc: "Color Hunt palettes, Dribbble & Fonts inspiration",
    frames: [
      { url: "https://colorhunt.co/", title: "Color Hunt Palettes", colSpan: 3, rowSpan: 3 },
      { url: "https://dribbble.com/", title: "Dribbble Inspiration", colSpan: 3, rowSpan: 3 }
    ]
  }
};

// --- State Initialization ---
let state = loadState();
let selectedColSpan = 3;
let selectedRowSpan = 2;
let lastDeletedItem = null;
let toastTimeout = null;
let activeTabMenuFolderId = null;

// --- DOM Elements ---
const framesGrid = document.getElementById("framesGrid");
const folderTabsList = document.getElementById("folderTabsList");
const addFrameBtn = document.getElementById("addFrameBtn");
const settingsBtn = document.getElementById("settingsBtn");
const frameModal = document.getElementById("frameModal");
const folderModal = document.getElementById("folderModal");
const settingsModal = document.getElementById("settingsModal");
const fullscreenModal = document.getElementById("fullscreenModal");
const frameForm = document.getElementById("frameForm");
const folderForm = document.getElementById("folderForm");
const frameFolderSelect = document.getElementById("frameFolderSelect");
const gridPreviewMatrix = document.getElementById("gridPreviewMatrix");
const toastContainer = document.getElementById("toastContainer");
const tabOptionsMenu = document.getElementById("tabOptionsMenu");
const importBanner = document.getElementById("importBanner");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  checkUrlHashImport();
  renderAll();
  setupEventListeners();
  updatePreviewMatrix();
});

// --- Event Listeners ---
function setupEventListeners() {
  // Modals open
  addFrameBtn.addEventListener("click", () => openFrameModal());
  settingsBtn.addEventListener("click", () => {
    openModal(settingsModal);
    updateQrCode();
  });

  // Modals close
  document.querySelectorAll(".close-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => closeAllModals());
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Fullscreen close
  document.getElementById("fullscreenCloseBtn").addEventListener("click", closeFullscreen);
  document.getElementById("fullscreenReloadBtn").addEventListener("click", () => {
    const ifr = document.getElementById("fullscreenIframe");
    ifr.src = ifr.src;
  });

  // Global Keydown (Esc for modals/fullscreen)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
      closeFullscreen();
      closeTabMenu();
    }
  });

  // Close dropdown menus on outer click
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#tabOptionsMenu") && !e.target.closest(".folder-tab-options")) {
      closeTabMenu();
    }
  });

  // Forms
  frameForm.addEventListener("submit", handleSaveFrame);
  folderForm.addEventListener("submit", handleSaveFolder);

  // Width & Height Chip Presets
  document.querySelectorAll("#widthPresets .preset-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#widthPresets .preset-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedColSpan = parseInt(chip.getAttribute("data-cols"), 10);
      updatePreviewMatrix();
    });
  });

  document.querySelectorAll("#heightPresets .preset-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#heightPresets .preset-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedRowSpan = parseInt(chip.getAttribute("data-rows"), 10);
      updatePreviewMatrix();
    });
  });

  // Auto-title from URL input
  document.getElementById("frameUrlInput").addEventListener("blur", (e) => {
    const titleInput = document.getElementById("frameTitleInput");
    if (!titleInput.value.trim() && e.target.value.trim()) {
      titleInput.value = formatDomainAsTitle(e.target.value.trim());
    }
  });

  // Settings actions
  document.getElementById("copyShareLinkBtn").addEventListener("click", copyShareLink);
  document.getElementById("exportJsonBtn").addEventListener("click", exportJsonBackup);
  document.getElementById("importJsonBtn").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
  });
  document.getElementById("importFileInput").addEventListener("change", handleFileImport);
  document.getElementById("resetAllBtn").addEventListener("click", handleResetAll);

  // Media query change re-render
  const mediaQuery = window.matchMedia(DESKTOP_MEDIA);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", () => renderFrames());
  }

  // Tab options menu actions
  document.getElementById("tabRenameOpt").addEventListener("click", () => {
    const targetFolderId = activeTabMenuFolderId;
    closeTabMenu();
    if (targetFolderId) openFolderModal(targetFolderId);
  });
  document.getElementById("tabMoveLeftOpt").addEventListener("click", () => {
    const targetFolderId = activeTabMenuFolderId;
    closeTabMenu();
    if (targetFolderId) moveFolder(targetFolderId, -1);
  });
  document.getElementById("tabMoveRightOpt").addEventListener("click", () => {
    const targetFolderId = activeTabMenuFolderId;
    closeTabMenu();
    if (targetFolderId) moveFolder(targetFolderId, 1);
  });
  document.getElementById("tabDeleteOpt").addEventListener("click", () => {
    const targetFolderId = activeTabMenuFolderId;
    closeTabMenu();
    if (targetFolderId) deleteFolder(targetFolderId);
  });
}

// --- Rendering ---
function renderAll() {
  renderFolderTabs();
  renderFrames();
  updateFolderSelect();
}

function renderFolderTabs() {
  folderTabsList.textContent = "";

  state.folders.forEach((folder) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `folder-tab ${folder.id === state.selectedFolderId ? "active" : ""}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", folder.id === state.selectedFolderId ? "true" : "false");

    const icon = `<svg class="folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    const optionsBtn = `<span class="folder-tab-options" title="Folder settings" aria-label="Folder settings">⋯</span>`;

    tab.innerHTML = `${icon}<span>${escapeHtml(folder.name)}</span>${optionsBtn}`;

    tab.addEventListener("click", (e) => {
      if (e.target.closest(".folder-tab-options")) {
        e.stopPropagation();
        openTabMenu(folder.id, tab);
      } else {
        setSelectedFolder(folder.id);
      }
    });

    tab.addEventListener("dblclick", (e) => {
      e.preventDefault();
      openFolderModal(folder.id);
    });

    tab.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openTabMenu(folder.id, tab);
    });

    folderTabsList.appendChild(tab);
  });

  // Add New Folder Tab Button
  const addTabBtn = document.createElement("button");
  addTabBtn.type = "button";
  addTabBtn.className = "add-tab-btn";
  addTabBtn.innerHTML = `+ New Tab`;
  addTabBtn.setAttribute("aria-label", "Create new tab");
  addTabBtn.addEventListener("click", () => openFolderModal());
  folderTabsList.appendChild(addTabBtn);
}

function renderFrames() {
  framesGrid.textContent = "";
  const folder = getSelectedFolder();

  if (!folder || !folder.frames || folder.frames.length === 0) {
    framesGrid.classList.add("is-empty");
    renderEmptyState();
    return;
  }

  framesGrid.classList.remove("is-empty");
  const isDesktop = window.matchMedia(DESKTOP_MEDIA).matches;
  const maxCols = isDesktop ? MAX_COLS_DESKTOP : MAX_COLS_MOBILE;

  folder.frames.forEach((frame, index) => {
    const card = createFrameCard(frame, index, maxCols);
    framesGrid.appendChild(card);
  });
}

function createFrameCard(frame, index, maxCols) {
  const card = document.createElement("article");
  card.className = "frame-card";
  card.style.gridColumn = `span ${Math.min(frame.colSpan || 3, maxCols)}`;
  card.style.gridRow = `span ${frame.rowSpan || 2}`;

  const title = frame.title || formatDomainAsTitle(frame.url);
  const faviconUrl = getFaviconUrl(frame.url);

  // Card Header
  const header = document.createElement("div");
  header.className = "card-header";
  header.innerHTML = `
    <div class="card-title-group">
      <img class="card-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'" />
      <span class="card-title" title="${escapeHtml(frame.url)}">${escapeHtml(title)}</span>
      <span class="card-size-tag">${frame.colSpan || 3}×${frame.rowSpan || 2}</span>
    </div>
    <div class="card-actions">
      <button type="button" class="btn-reload" title="Reload frame" aria-label="Reload frame">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
      </button>
      <a href="${escapeHtml(frame.url)}" target="_blank" rel="noopener noreferrer" class="btn-ghost" title="Open in new tab" aria-label="Open in new tab" style="padding: 4px; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; color: inherit; border-radius: var(--radius-sm);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
      <button type="button" class="btn-fullscreen" title="Focus Fullscreen" aria-label="Focus Fullscreen">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
      </button>
      <button type="button" class="btn-edit" title="Edit frame" aria-label="Edit frame">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      </button>
      <button type="button" class="btn-delete" title="Delete frame" aria-label="Delete frame" style="color: var(--danger);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `;

  // Card Body & Iframe
  const body = document.createElement("div");
  body.className = "card-body";

  const loader = document.createElement("div");
  loader.className = "card-loader";
  loader.innerHTML = `<div class="spinner"></div><span>Loading frame...</span>`;

  const iframe = document.createElement("iframe");
  iframe.src = frame.url;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allow = "camera; microphone; display-capture; geolocation; clipboard-read; clipboard-write; fullscreen";
  iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads";

  iframe.addEventListener("load", () => {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300);
  });

  // Quick fallback if iframe fails or is blocked
  setTimeout(() => {
    if (loader.parentNode) {
      loader.innerHTML = `
        <div style="text-align: center; padding: 8px;">
          <p style="font-weight: 500; margin-bottom: 4px;">External Page Loaded</p>
          <a href="${escapeHtml(frame.url)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="font-size: 11px; padding: 4px 10px; text-decoration: none; display: inline-flex;">Open in new tab ↗</a>
        </div>
      `;
    }
  }, 5000);

  body.appendChild(loader);
  body.appendChild(iframe);

  // Card Actions Handlers
  header.querySelector(".btn-reload").addEventListener("click", () => {
    iframe.src = frame.url;
  });

  header.querySelector(".btn-fullscreen").addEventListener("click", () => {
    openFullscreen(frame);
  });

  header.querySelector(".btn-edit").addEventListener("click", () => {
    openFrameModal(frame.id);
  });

  header.querySelector(".btn-delete").addEventListener("click", () => {
    deleteFrame(frame.id);
  });

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function renderEmptyState() {
  const container = document.createElement("div");
  container.className = "empty-state";

  container.innerHTML = `
    <div class="empty-icon">🪟</div>
    <h2 class="empty-title">This folder is empty</h2>
    <p class="empty-desc">Add your favorite websites, tools, and dashboards in customizable grid sizes, or launch one of our curated starter packs below.</p>
    <button id="emptyAddBtn" class="btn-primary" type="button" style="margin-top: 4px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      <span>Add Your First Frame</span>
    </button>

    <div class="starter-packs-title">Or pick a starter pack</div>
    <div class="starter-packs">
      ${Object.entries(STARTER_PACKS).map(([key, pack]) => `
        <button type="button" class="starter-pack-card" data-pack="${key}">
          <div class="pack-header">
            <span>${pack.icon}</span>
            <span>${escapeHtml(pack.name)}</span>
          </div>
          <div class="pack-items">${escapeHtml(pack.desc)}</div>
        </button>
      `).join('')}
    </div>
  `;

  container.querySelector("#emptyAddBtn").addEventListener("click", () => openFrameModal());

  container.querySelectorAll(".starter-pack-card").forEach((card) => {
    card.addEventListener("click", () => {
      const packKey = card.getAttribute("data-pack");
      applyStarterPack(packKey);
    });
  });

  framesGrid.appendChild(container);
}

function updateFolderSelect() {
  frameFolderSelect.textContent = "";
  state.folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder.id;
    option.textContent = folder.name;
    option.selected = folder.id === state.selectedFolderId;
    frameFolderSelect.appendChild(option);
  });
}

function updatePreviewMatrix() {
  gridPreviewMatrix.textContent = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const cell = document.createElement("div");
      cell.className = "preview-cell";
      if (c < selectedColSpan && r < selectedRowSpan) {
        cell.classList.add("filled");
      }
      gridPreviewMatrix.appendChild(cell);
    }
  }
}

// --- State Actions & Handlers ---
function handleSaveFrame(e) {
  e.preventDefault();
  const editId = document.getElementById("frameEditId").value;
  const urlInput = document.getElementById("frameUrlInput").value.trim();
  const titleInput = document.getElementById("frameTitleInput").value.trim();
  const folderId = document.getElementById("frameFolderSelect").value;

  const validUrl = validateUrl(urlInput);
  if (!validUrl) {
    showToast("Please enter a valid HTTP/HTTPS URL.");
    return;
  }

  const folder = state.folders.find((f) => f.id === folderId) || getSelectedFolder();
  if (!folder) return;

  if (editId) {
    // Find existing frame across folders
    for (const f of state.folders) {
      const idx = f.frames.findIndex((i) => i.id === editId);
      if (idx !== -1) {
        const [item] = f.frames.splice(idx, 1);
        item.url = validUrl;
        item.title = titleInput || formatDomainAsTitle(validUrl);
        item.colSpan = selectedColSpan;
        item.rowSpan = selectedRowSpan;
        folder.frames.push(item);
        break;
      }
    }
    showToast("Frame updated successfully.");
  } else {
    folder.frames.push({
      id: makeId(),
      url: validUrl,
      title: titleInput || formatDomainAsTitle(validUrl),
      colSpan: selectedColSpan,
      rowSpan: selectedRowSpan
    });
    showToast("Frame added to " + folder.name);
  }

  state.selectedFolderId = folder.id;
  persist();
  closeAllModals();
  renderAll();
}

function handleSaveFolder(e) {
  e.preventDefault();
  const editId = document.getElementById("folderEditId").value;
  const name = document.getElementById("folderNameInput").value.trim();
  if (!name) return;

  if (editId) {
    const folder = state.folders.find((f) => f.id === editId);
    if (folder) {
      folder.name = name.slice(0, 40);
      showToast(`Renamed folder to "${folder.name}"`);
    }
  } else {
    const newFolder = { id: makeId(), name: name.slice(0, 40), frames: [] };
    state.folders.push(newFolder);
    state.selectedFolderId = newFolder.id;
    showToast(`Created folder "${newFolder.name}"`);
  }

  persist();
  closeAllModals();
  renderAll();
}

function deleteFrame(frameId) {
  const folder = getSelectedFolder();
  if (!folder) return;

  const index = folder.frames.findIndex((f) => f.id === frameId);
  if (index === -1) return;

  const [removed] = folder.frames.splice(index, 1);
  lastDeletedItem = { type: "frame", folderId: folder.id, index, item: removed };
  persist();
  renderFrames();

  showToast(`Frame removed`, () => {
    if (lastDeletedItem && lastDeletedItem.type === "frame") {
      const targetFolder = state.folders.find((f) => f.id === lastDeletedItem.folderId);
      if (targetFolder) {
        targetFolder.frames.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
        persist();
        renderFrames();
        showToast("Frame restored");
      }
    }
  });
}

function deleteFolder(folderId) {
  if (state.folders.length <= 1) {
    showToast("You must keep at least one folder.");
    return;
  }

  const index = state.folders.findIndex((f) => f.id === folderId);
  if (index === -1) return;

  const [removed] = state.folders.splice(index, 1);
  lastDeletedItem = { type: "folder", index, item: removed };

  if (state.selectedFolderId === folderId) {
    state.selectedFolderId = state.folders[Math.max(0, index - 1)].id;
  }

  persist();
  renderAll();

  showToast(`Folder "${removed.name}" deleted`, () => {
    if (lastDeletedItem && lastDeletedItem.type === "folder") {
      state.folders.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
      state.selectedFolderId = lastDeletedItem.item.id;
      persist();
      renderAll();
      showToast("Folder restored");
    }
  });
}

function moveFolder(folderId, delta) {
  const index = state.folders.findIndex((f) => f.id === folderId);
  if (index === -1) return;
  const target = index + delta;
  if (target < 0 || target >= state.folders.length) return;

  const [item] = state.folders.splice(index, 1);
  state.folders.splice(target, 0, item);
  persist();
  renderFolderTabs();
}

function applyStarterPack(packKey) {
  const pack = STARTER_PACKS[packKey];
  if (!pack) return;

  const folder = getSelectedFolder();
  if (!folder) return;

  pack.frames.forEach((f) => {
    folder.frames.push({
      id: makeId(),
      url: f.url,
      title: f.title,
      colSpan: f.colSpan,
      rowSpan: f.rowSpan
    });
  });

  persist();
  renderAll();
  showToast(`Loaded ${pack.name}!`);
}

function setSelectedFolder(folderId) {
  if (!state.folders.some((f) => f.id === folderId)) return;
  state.selectedFolderId = folderId;
  persist();
  renderFolderTabs();
  renderFrames();
  updateFolderSelect();
}

function getSelectedFolder() {
  let folder = state.folders.find((f) => f.id === state.selectedFolderId);
  if (!folder && state.folders.length > 0) {
    folder = state.folders[0];
    state.selectedFolderId = folder.id;
  }
  return folder;
}

// --- Modal Management ---
function openModal(modal) {
  closeAllModals();
  modal.classList.add("open");
  const autofocusEl = modal.querySelector("[autofocus]");
  if (autofocusEl) setTimeout(() => autofocusEl.focus(), 50);
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.remove("open"));
}

function openFrameModal(frameId = null) {
  const modalTitle = document.getElementById("frameModalTitle");
  const submitBtn = document.getElementById("saveFrameSubmitBtn");
  const editIdInput = document.getElementById("frameEditId");
  const urlInput = document.getElementById("frameUrlInput");
  const titleInput = document.getElementById("frameTitleInput");

  updateFolderSelect();

  if (frameId) {
    const folder = getSelectedFolder();
    const frame = folder?.frames.find((f) => f.id === frameId);
    if (frame) {
      modalTitle.textContent = "Edit Frame";
      submitBtn.textContent = "Update Frame";
      editIdInput.value = frame.id;
      urlInput.value = frame.url;
      titleInput.value = frame.title || "";
      selectedColSpan = frame.colSpan || 3;
      selectedRowSpan = frame.rowSpan || 2;
    }
  } else {
    modalTitle.textContent = "Add Frame";
    submitBtn.textContent = "Add Frame";
    editIdInput.value = "";
    urlInput.value = "";
    titleInput.value = "";
    selectedColSpan = 3;
    selectedRowSpan = 2;
  }

  // Sync chips
  document.querySelectorAll("#widthPresets .preset-chip").forEach((c) => {
    c.classList.toggle("active", parseInt(c.getAttribute("data-cols"), 10) === selectedColSpan);
  });
  document.querySelectorAll("#heightPresets .preset-chip").forEach((c) => {
    c.classList.toggle("active", parseInt(c.getAttribute("data-rows"), 10) === selectedRowSpan);
  });

  updatePreviewMatrix();
  openModal(frameModal);
}

function openFolderModal(folderId = null) {
  const modalTitle = document.getElementById("folderModalTitle");
  const submitBtn = document.getElementById("saveFolderSubmitBtn");
  const editIdInput = document.getElementById("folderEditId");
  const nameInput = document.getElementById("folderNameInput");

  if (folderId) {
    const folder = state.folders.find((f) => f.id === folderId);
    modalTitle.textContent = "Rename Folder";
    submitBtn.textContent = "Save Changes";
    editIdInput.value = folder.id;
    nameInput.value = folder.name;
  } else {
    modalTitle.textContent = "New Folder";
    submitBtn.textContent = "Create Folder";
    editIdInput.value = "";
    nameInput.value = "";
  }

  openModal(folderModal);
}

function openFullscreen(frame) {
  const ifr = document.getElementById("fullscreenIframe");
  const title = document.getElementById("fullscreenTitle");
  const favicon = document.getElementById("fullscreenFavicon");
  const extLink = document.getElementById("fullscreenExtLink");

  ifr.src = frame.url;
  title.textContent = frame.title || formatDomainAsTitle(frame.url);
  favicon.src = getFaviconUrl(frame.url);
  extLink.href = frame.url;

  fullscreenModal.classList.add("open");
}

function closeFullscreen() {
  const ifr = document.getElementById("fullscreenIframe");
  ifr.src = "";
  fullscreenModal.classList.remove("open");
}

function openTabMenu(folderId, targetEl) {
  activeTabMenuFolderId = folderId;
  const rect = targetEl.getBoundingClientRect();
  tabOptionsMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  tabOptionsMenu.style.left = `${rect.left + window.scrollX}px`;
  tabOptionsMenu.classList.add("open");
}

function closeTabMenu() {
  tabOptionsMenu.classList.remove("open");
  activeTabMenuFolderId = null;
}

// --- Toast Notifications ---
function showToast(message, undoCallback = null) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastContainer.textContent = "";

  const toast = document.createElement("div");
  toast.className = "toast";

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  if (undoCallback) {
    const undoBtn = document.createElement("button");
    undoBtn.type = "button";
    undoBtn.className = "toast-undo-btn";
    undoBtn.textContent = "Undo";
    undoBtn.addEventListener("click", () => {
      undoCallback();
      toast.remove();
    });
    toast.appendChild(undoBtn);
  }

  toastContainer.appendChild(toast);
  toastTimeout = setTimeout(() => {
    toast.remove();
  }, 5000);
}

// --- Import / Export / Sharing ---
function getShareableUrl() {
  try {
    const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    return `${window.location.origin}${window.location.pathname}#import=${serialized}`;
  } catch (err) {
    return window.location.href;
  }
}

function updateQrCode() {
  const qrContainer = document.getElementById("shareQrCode");
  const urlInput = document.getElementById("shareUrlInput");
  if (!qrContainer) return;

  const shareUrl = getShareableUrl();
  if (urlInput) urlInput.value = shareUrl;

  qrContainer.textContent = "";

  if (typeof QRCode !== "undefined") {
    try {
      new QRCode(qrContainer, {
        text: shareUrl,
        width: 160,
        height: 160,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
      });
      return;
    } catch (e) {
      console.warn("Local QRCode error, using image fallback", e);
    }
  }

  const qrImg = document.createElement("img");
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(shareUrl)}`;
  qrImg.alt = "Dashboard QR Code";
  qrImg.width = 160;
  qrImg.height = 160;
  qrContainer.appendChild(qrImg);
}

function copyShareLink() {
  const url = getShareableUrl();
  navigator.clipboard.writeText(url).then(() => {
    showToast("Shareable link copied to clipboard!");
  }).catch(() => {
    showToast("Error creating shareable link.");
  });
}

function checkUrlHashImport() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith("#import=")) return;

  try {
    const raw = hash.replace("#import=", "");
    const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
    if (decoded && Array.isArray(decoded.folders)) {
      importBanner.classList.add("active");
      document.getElementById("confirmImportBtn").onclick = () => {
        state = normalizeState(decoded);
        persist();
        importBanner.classList.remove("active");
        window.location.hash = "";
        renderAll();
        showToast("Shared dashboard imported!");
      };
      document.getElementById("dismissImportBtn").onclick = () => {
        importBanner.classList.remove("active");
        window.location.hash = "";
      };
    }
  } catch (e) {
    console.error("Invalid import hash", e);
  }
}

function exportJsonBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `frames-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Backup downloaded as JSON.");
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      state = normalizeState(parsed);
      persist();
      closeAllModals();
      renderAll();
      showToast("Dashboard restored from file!");
    } catch (err) {
      showToast("Invalid JSON backup file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function handleResetAll() {
  if (confirm("Are you sure you want to reset all folders and frames to defaults?")) {
    state = {
      version: 2,
      selectedFolderId: "folder-default",
      folders: [
        {
          id: "folder-default",
          name: "Dev & Docs",
          frames: STARTER_PACKS.dev.frames.map((f) => ({ ...f, id: makeId() }))
        },
        {
          id: "folder-monitoring",
          name: "Monitoring",
          frames: STARTER_PACKS.monitoring.frames.map((f) => ({ ...f, id: makeId() }))
        }
      ]
    };
    persist();
    closeAllModals();
    renderAll();
    showToast("Dashboard reset to defaults.");
  }
}

// --- State Persistence & Helpers ---
function loadState() {
  const defaultState = {
    version: 2,
    selectedFolderId: "folder-default",
    folders: [
      {
        id: "folder-default",
        name: "Dev & Docs",
        frames: STARTER_PACKS.dev.frames.map((f) => ({ ...f, id: makeId() }))
      },
      {
        id: "folder-monitoring",
        name: "Monitoring",
        frames: STARTER_PACKS.monitoring.frames.map((f) => ({ ...f, id: makeId() }))
      }
    ]
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
}

function normalizeState(parsed) {
  const fallbackId = makeId();

  // V1 Array legacy format migration
  if (Array.isArray(parsed)) {
    const migratedFrames = parsed.map((item) => normalizeFrame(item)).filter(Boolean);
    return {
      version: 2,
      selectedFolderId: fallbackId,
      folders: [{ id: fallbackId, name: "Default", frames: migratedFrames }]
    };
  }

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.folders)) {
    return {
      version: 2,
      selectedFolderId: fallbackId,
      folders: [{ id: fallbackId, name: "Default", frames: [] }]
    };
  }

  const folders = parsed.folders
    .map((folder, idx) => ({
      id: String(folder.id || makeId()),
      name: String(folder.name || `Folder ${idx + 1}`).slice(0, 40),
      frames: Array.isArray(folder.frames)
        ? folder.frames.map((f) => normalizeFrame(f)).filter(Boolean)
        : []
    }))
    .filter(Boolean);

  if (!folders.length) {
    folders.push({ id: fallbackId, name: "Default", frames: [] });
  }

  const selectedFolderId = folders.some((f) => f.id === parsed.selectedFolderId)
    ? parsed.selectedFolderId
    : folders[0].id;

  return {
    version: 2,
    selectedFolderId,
    folders
  };
}

function normalizeFrame(input) {
  if (!input || typeof input !== "object") return null;
  const url = validateUrl(String(input.url || "").trim());
  if (!url) return null;

  return {
    id: typeof input.id === "string" && input.id ? input.id : makeId(),
    url,
    title: input.title ? String(input.title).slice(0, 60) : formatDomainAsTitle(url),
    colSpan: clampInt(input.colSpan, 1, 6, 3),
    rowSpan: clampInt(input.rowSpan, 1, 8, 2)
  };
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

function validateUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function formatDomainAsTitle(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

function getFaviconUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return "";
  }
}

function clampInt(val, min, max, fallback) {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : Math.min(max, Math.max(min, num));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
