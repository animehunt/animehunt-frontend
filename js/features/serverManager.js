import {
  $,
  setHTML
} from "../core/utils.js";

import {
  loadPlayer
} from "./playerControls.js";

/* ======================================================
   SERVER MANAGER
====================================================== */

let servers = [];

let currentServer = 0;

let currentConfig = {};

let onServerChange = null;

/* ======================================================
   INIT
====================================================== */

export function initServerManager({

  list = [],

  config = {},

  onChange

}) {

  servers = list || [];

  currentServer = 0;

  currentConfig = config || {};

  onServerChange = onChange;

  renderServers();

  loadCurrentServer();
}

/* ======================================================
   LOAD CURRENT
====================================================== */

function loadCurrentServer() {

  const server = servers[currentServer];

  if (!server) return;

  loadPlayer({

    url: server.url,

    config: currentConfig
  });

  if (typeof onServerChange === "function") {

    onServerChange(server);
  }

  renderServers();
}

/* ======================================================
   RENDER
====================================================== */

function renderServers() {

  const box = $("#serverList");

  if (!box) return;

  /* PLAYER CMS SUPPORT */

  if (
    currentConfig?.ui &&
    currentConfig.ui.servers === false
  ) {

    box.style.display = "none";

    return;
  }

  box.style.display = "flex";

  setHTML(
    box,

    servers.map((server, i) => `
    
      <button
        class="server ${
          i === currentServer
            ? "active"
            : ""
        }"
        data-index="${i}"
      >
        Server ${i + 1}
      </button>
    
    `).join("")
  );

  box.onclick = (e) => {

    const btn =
      e.target.closest("[data-index]");

    if (!btn) return;

    currentServer =
      Number(btn.dataset.index);

    loadCurrentServer();
  };
}

/* ======================================================
   AUTO FAILOVER
====================================================== */

export function switchToNextServer() {

  if (
    currentServer + 1 >= servers.length
  ) return false;

  currentServer++;

  loadCurrentServer();

  return true;
}

/* ======================================================
   GETTERS
====================================================== */

export function getCurrentServer() {
  return servers[currentServer];
}

export function getServers() {
  return servers;
}
