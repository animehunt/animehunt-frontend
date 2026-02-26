<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
const video     = document.getElementById("wawVideo");
const timeline  = document.getElementById("wawTimeline");
const bufferBar = document.querySelector(".waw-buffer");
const playedBar = document.querySelector(".waw-played");
const scrubber  = document.querySelector(".waw-scrubber");

// 🔴 SOURCE
const SOURCE = "video.m3u8"; // or .mp4
let hls;

// ===== HLS CORE =====
if (SOURCE.endsWith(".m3u8") && Hls.isSupported()) {
  hls = new Hls({
    maxBufferLength: 30,
    maxMaxBufferLength: 60
  });
  hls.loadSource(SOURCE);
  hls.attachMedia(video);

  hls.on(Hls.Events.ERROR, (e, data) => {
    console.warn("HLS ERROR:", data.type);
  });
} else {
  video.src = SOURCE;
}

// ===== BUFFER TRACKING =====
video.addEventListener("progress", () => {
  if (!video.buffered.length) return;
  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
  const percent = (bufferedEnd / video.duration) * 100;
  bufferBar.style.width = percent + "%";
});

// ===== PLAYHEAD UPDATE =====
video.addEventListener("timeupdate", () => {
  const percent = (video.currentTime / video.duration) * 100;
  playedBar.style.width = percent + "%";
  scrubber.style.left = percent + "%";
});

// ===== SEEK LOGIC (PIXEL → TIME) =====
timeline.addEventListener("click", e => {
  const rect = timeline.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = x / rect.width;
  video.currentTime = percent * video.duration;
});
</script>
<script>
const player     = document.getElementById("wawPlayer");
const interact   = document.getElementById("wawInteract");
const volHud     = document.getElementById("wawVolHud");
const volFill    = document.getElementById("wawVolFill");

let lastTapTime = 0;
let cursorTimer;

// ===== TAP ZONE LOGIC =====
interact.addEventListener("click", e => {
  const now = Date.now();
  const rect = interact.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentX = x / rect.width;

  // DOUBLE TAP
  if (now - lastTapTime < 300) {
    if (percentX < 0.3) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    } 
    else if (percentX > 0.7) {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    }
    lastTapTime = 0;
    return;
  }

  // SINGLE TAP (center only)
  if (percentX >= 0.3 && percentX <= 0.7) {
    video.paused ? video.play() : video.pause();
  }

  lastTapTime = now;
});

// ===== CURSOR AUTO-HIDE =====
function resetCursorTimer(){
  player.classList.remove("waw-hide-cursor");
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(()=>{
    if(!video.paused){
      player.classList.add("waw-hide-cursor");
    }
  },3000);
}

player.addEventListener("mousemove", resetCursorTimer);
player.addEventListener("mouseenter", resetCursorTimer);

// ===== SCROLL TO VOLUME =====
player.addEventListener("wheel", e => {
  e.preventDefault();
  let vol = video.volume + (e.deltaY < 0 ? 0.05 : -0.05);
  vol = Math.min(1, Math.max(0, vol));
  video.volume = vol;

  volFill.style.width = (vol * 100) + "%";
  volHud.style.opacity = "1";

  clearTimeout(volHud._t);
  volHud._t = setTimeout(()=>{
    volHud.style.opacity = "0";
  },800);
},{ passive:false });
</script>
<script>
const topbar  = document.getElementById("wawTopbar");
const pauseOL = document.getElementById("wawPause");
const loader  = document.getElementById("wawLoading");

// SHOW UI ON HOVER / PAUSE
player.addEventListener("mousemove",()=>{
  player.classList.add("waw-ui-visible");
  clearTimeout(player._uiT);
  player._uiT = setTimeout(()=>{
    if(!video.paused) player.classList.remove("waw-ui-visible");
  },3000);
});

video.addEventListener("pause",()=>{
  pauseOL.style.opacity="1";
  player.classList.add("waw-ui-visible");
});

video.addEventListener("play",()=>{
  pauseOL.style.opacity="0";
});

// LOADING STATES
video.addEventListener("waiting",()=>{
  loader.style.opacity="1";
});
video.addEventListener("playing",()=>{
  loader.style.opacity="0";
});
</script>
<script>
const gear     = document.getElementById("wawGear");
const settings = document.getElementById("wawSettings");

const panels = {
  main:   document.getElementById("wawPanelMain"),
  quality:document.getElementById("wawPanelQuality"),
  speed:  document.getElementById("wawPanelSpeed"),
  subs:   document.getElementById("wawPanelSubs"),
  audio:  document.getElementById("wawPanelAudio")
};

// TOGGLE SETTINGS
gear.onclick = ()=>{
  settings.style.display =
    settings.style.display === "block" ? "none" : "block";
  showPanel("main");
};

// SHOW PANEL
function showPanel(name){
  Object.values(panels).forEach(p=>p.style.display="none");
  panels[name].style.display="block";
}

// MAIN PANEL NAV
panels.main.onclick = e=>{
  const t = e.target.dataset.open;
  if(t) showPanel(t);
};

// ===== QUALITY (HLS LEVELS) =====
function buildQuality(){
  panels.quality.innerHTML="";
  hls.levels.forEach((l,i)=>{
    const row = document.createElement("div");
    row.className="waw-row";
    row.textContent = l.height+"p";
    if(hls.currentLevel===i) row.classList.add("tick","active");
    row.onclick=()=>{
      hls.currentLevel=i;
      buildQuality();
    };
    panels.quality.appendChild(row);
  });
}
if(hls){
  hls.on(Hls.Events.MANIFEST_PARSED, buildQuality);
}

// ===== SPEED =====
const speeds=[0.25,0.5,0.75,1,1.25,1.5,2];
panels.speed.innerHTML="";
speeds.forEach(s=>{
  const row=document.createElement("div");
  row.className="waw-row";
  row.textContent=s+"x";
  if(s===1) row.classList.add("tick","active");
  row.onclick=()=>{
    video.playbackRate=s;
    [...panels.speed.children].forEach(r=>r.classList.remove("tick","active"));
    row.classList.add("tick","active");
  };
  panels.speed.appendChild(row);
});

// ===== SUBTITLES =====
function buildSubs(){
  panels.subs.innerHTML="";
  const off=document.createElement("div");
  off.className="waw-row tick";
  off.textContent="Off";
  off.onclick=()=>{
    [...video.textTracks].forEach(t=>t.mode="hidden");
    buildSubs();
  };
  panels.subs.appendChild(off);

  [...video.textTracks].forEach((t,i)=>{
    const row=document.createElement("div");
    row.className="waw-row";
    row.textContent=t.label;
    if(t.mode==="showing") row.classList.add("tick","active");
    row.onclick=()=>{
      [...video.textTracks].forEach(x=>x.mode="hidden");
      t.mode="showing";
      buildSubs();
    };
    panels.subs.appendChild(row);
  });
}

// ===== AUDIO =====
function buildAudio(){
  panels.audio.innerHTML="";
  hls.audioTracks.forEach((t,i)=>{
    const row=document.createElement("div");
    row.className="waw-row";
    row.textContent=t.name;
    if(hls.audioTrack===i) row.classList.add("tick","active");
    row.onclick=()=>{
      hls.audioTrack=i;
      buildAudio();
    };
    panels.audio.appendChild(row);
  });
}

if(hls){
  hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
    buildAudio();
    buildSubs();
  });
}
</script>
