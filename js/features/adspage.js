/* =========================================================
   js/features/adspage.js
   FINAL ADS PAGE ENGINE
========================================================= */

import { api } from "../core/api.js"

/* =========================================================
   DOM
========================================================= */

/* ADS */

const adsLibraryList =
document.getElementById(
  "adsLibraryList"
)

const adName =
document.getElementById(
  "adName"
)

const adType =
document.getElementById(
  "adType"
)

const adCode =
document.getElementById(
  "adCode"
)

const adDelay =
document.getElementById(
  "adDelay"
)

const adWeight =
document.getElementById(
  "adWeight"
)

const saveAdBtn =
document.getElementById(
  "saveAdBtn"
)

/* SHORTLINKS */

const shortLibraryList =
document.getElementById(
  "shortLibraryList"
)

const shortName =
document.getElementById(
  "shortName"
)

const shortBase =
document.getElementById(
  "shortBase"
)

const shortApi =
document.getElementById(
  "shortApi"
)

const saveShortBtn =
document.getElementById(
  "saveShortBtn"
)

/* POPUPS */

const popupLibraryList =
document.getElementById(
  "popupLibraryList"
)

const popupName =
document.getElementById(
  "popupName"
)

const popupCode =
document.getElementById(
  "popupCode"
)

const savePopupBtn =
document.getElementById(
  "savePopupBtn"
)

/* HOSTS */

const hostMonetizationList =
document.getElementById(
  "hostMonetizationList"
)

/* ANALYTICS */

const totalHosts =
document.getElementById(
  "totalHosts"
)

const totalAds =
document.getElementById(
  "totalAds"
)

const totalShortlinks =
document.getElementById(
  "totalShortlinks"
)

const totalClicks =
document.getElementById(
  "totalClicks"
)

/* =========================================================
   STATE
========================================================= */

let ADS = []
let SHORTLINKS = []
let POPUPS = []
let HOSTS = []

/* =========================================================
   INIT
========================================================= */

export async function initAdsPage(){

  await Promise.all([

    loadAds(),
    loadShortlinks(),
    loadPopups(),
    loadHosts()

  ])

  bindEvents()

  renderAnalytics()

}

/* =========================================================
   EVENTS
========================================================= */

function bindEvents(){

  saveAdBtn.onclick =
  saveAd

  saveShortBtn.onclick =
  saveShortlink

  savePopupBtn.onclick =
  savePopup

}

/* =========================================================
   LOAD ADS
========================================================= */

async function loadAds(){

  const data =
  await api(
    "/admin/ads-library"
  )

  ADS =
  Array.isArray(data)
  ? data
  : []

  renderAds()

}

/* =========================================================
   RENDER ADS
========================================================= */

function renderAds(){

  adsLibraryList.innerHTML = ""

  if(!ADS.length){

    adsLibraryList.innerHTML =

      `<p>No Ads Found</p>`

    return

  }

  ADS.forEach(ad=>{

    adsLibraryList.innerHTML += `

      <div class="library-item">

        <div>

          <b>

            ${ad.name}

          </b>

          <small>

            ${ad.type}

          </small>

        </div>

        <div class="actions">

          <button
            onclick="window.editAd('${ad.id}')"
          >

            Edit

          </button>

          <button
            onclick="window.deleteAd('${ad.id}')"
          >

            Delete

          </button>

        </div>

      </div>

    `

  })

}

/* =========================================================
   SAVE AD
========================================================= */

async function saveAd(){

  const payload = {

    name:
    adName.value.trim(),

    type:
    adType.value,

    code:
    adCode.value.trim(),

    delay:
    Number(
      adDelay.value || 0
    ),

    weight:
    Number(
      adWeight.value || 1
    )

  }

  if(
    !payload.name ||
    !payload.code
  ){

    alert(
      "Fill all fields"
    )

    return

  }

  const res =
  await api(

    "/admin/ads-library",

    {

      method:"POST",

      body:
      JSON.stringify(
        payload
      )

    }

  )

  if(!res?.success){

    return

  }

  adName.value = ""
  adCode.value = ""
  adDelay.value = ""
  adWeight.value = ""

  loadAds()

  renderAnalytics()

}

/* =========================================================
   EDIT AD
========================================================= */

window.editAd = function(id){

  const ad =
  ADS.find(
    x=>x.id===id
  )

  if(!ad) return

  adName.value =
  ad.name

  adType.value =
  ad.type

  adCode.value =
  ad.code

  adDelay.value =
  ad.delay || 0

  adWeight.value =
  ad.weight || 1

}

/* =========================================================
   DELETE AD
========================================================= */

window.deleteAd =
async function(id){

  if(
    !confirm(
      "Delete ad?"
    )
  ){

    return

  }

  await api(

    `/admin/ads-library/${id}`,

    {
      method:"DELETE"
    }

  )

  loadAds()

  renderAnalytics()

}

/* =========================================================
   LOAD SHORTLINKS
========================================================= */

async function loadShortlinks(){

  const data =
  await api(
    "/admin/shortlinks-library"
  )

  SHORTLINKS =
  Array.isArray(data)
  ? data
  : []

  renderShortlinks()

}

/* =========================================================
   RENDER SHORTLINKS
========================================================= */

function renderShortlinks(){

  shortLibraryList.innerHTML = ""

  if(!SHORTLINKS.length){

    shortLibraryList.innerHTML =

      `<p>No Shortlinks Found</p>`

    return

  }

  SHORTLINKS.forEach(short=>{

    shortLibraryList.innerHTML += `

      <div class="library-item">

        <div>

          <b>

            ${short.name}

          </b>

        </div>

        <div class="actions">

          <button
            onclick="window.editShort('${short.id}')"
          >

            Edit

          </button>

          <button
            onclick="window.deleteShort('${short.id}')"
          >

            Delete

          </button>

        </div>

      </div>

    `

  })

}

/* =========================================================
   SAVE SHORTLINK
========================================================= */

async function saveShortlink(){

  const payload = {

    name:
    shortName.value.trim(),

    base_url:
    shortBase.value.trim(),

    api_key:
    shortApi.value.trim()

  }

  if(
    !payload.name ||
    !payload.base_url
  ){

    alert(
      "Fill all fields"
    )

    return

  }

  const res =
  await api(

    "/admin/shortlinks-library",

    {

      method:"POST",

      body:
      JSON.stringify(
        payload
      )

    }

  )

  if(!res?.success){

    return

  }

  shortName.value = ""
  shortBase.value = ""
  shortApi.value = ""

  loadShortlinks()

  renderAnalytics()

}

/* =========================================================
   EDIT SHORTLINK
========================================================= */

window.editShort =
function(id){

  const short =
  SHORTLINKS.find(
    x=>x.id===id
  )

  if(!short) return

  shortName.value =
  short.name

  shortBase.value =
  short.base_url

  shortApi.value =
  short.api_key || ""

}

/* =========================================================
   DELETE SHORTLINK
========================================================= */

window.deleteShort =
async function(id){

  if(
    !confirm(
      "Delete shortlink?"
    )
  ){

    return

  }

  await api(

    `/admin/shortlinks-library/${id}`,

    {
      method:"DELETE"
    }

  )

  loadShortlinks()

  renderAnalytics()

}

/* =========================================================
   LOAD POPUPS
========================================================= */

async function loadPopups(){

  const data =
  await api(
    "/admin/popup-library"
  )

  POPUPS =
  Array.isArray(data)
  ? data
  : []

  renderPopups()

}

/* =========================================================
   RENDER POPUPS
========================================================= */

function renderPopups(){

  popupLibraryList.innerHTML = ""

  if(!POPUPS.length){

    popupLibraryList.innerHTML =

      `<p>No Popups Found</p>`

    return

  }

  POPUPS.forEach(popup=>{

    popupLibraryList.innerHTML += `

      <div class="library-item">

        <div>

          <b>

            ${popup.name}

          </b>

        </div>

        <div class="actions">

          <button
            onclick="window.editPopup('${popup.id}')"
          >

            Edit

          </button>

          <button
            onclick="window.deletePopup('${popup.id}')"
          >

            Delete

          </button>

        </div>

      </div>

    `

  })

}

/* =========================================================
   SAVE POPUP
========================================================= */

async function savePopup(){

  const payload = {

    name:
    popupName.value.trim(),

    script:
    popupCode.value.trim()

  }

  if(
    !payload.name ||
    !payload.script
  ){

    alert(
      "Fill all fields"
    )

    return

  }

  const res =
  await api(

    "/admin/popup-library",

    {

      method:"POST",

      body:
      JSON.stringify(
        payload
      )

    }

  )

  if(!res?.success){

    return

  }

  popupName.value = ""
  popupCode.value = ""

  loadPopups()

}

/* =========================================================
   EDIT POPUP
========================================================= */

window.editPopup =
function(id){

  const popup =
  POPUPS.find(
    x=>x.id===id
  )

  if(!popup) return

  popupName.value =
  popup.name

  popupCode.value =
  popup.script

}

/* =========================================================
   DELETE POPUP
========================================================= */

window.deletePopup =
async function(id){

  if(
    !confirm(
      "Delete popup?"
    )
  ){

    return

  }

  await api(

    `/admin/popup-library/${id}`,

    {
      method:"DELETE"
    }

  )

  loadPopups()

}

/* =========================================================
   LOAD HOSTS
========================================================= */

async function loadHosts(){

  const data =
  await api(
    "/admin/host-monetization"
  )

  HOSTS =
  Array.isArray(data)
  ? data
  : []

  renderHosts()

}

/* =========================================================
   RENDER HOSTS
========================================================= */

function renderHosts(){

  hostMonetizationList.innerHTML = ""

  if(!HOSTS.length){

    hostMonetizationList.innerHTML =

      `<p>No Hosts Found</p>`

    return

  }

  HOSTS.forEach(host=>{

    hostMonetizationList.innerHTML += `

      <div class="host-card">

        <div class="host-top">

          <div>

            <h2>

              ${host.host}

            </h2>

            <p>

              Storage :
              ${host.storage || "Unknown"}

            </p>

          </div>

          <div class="host-badges">

            <span>

              Knight :
              ${host.knight ? "YES" : "NO"}

            </span>

          </div>

        </div>

        <div class="host-section">

          <h4>

            Ads

          </h4>

          ${
            host.ads?.length

            ? host.ads.map(ad=>`

              <label>

                <input
                  type="checkbox"
                  checked
                  disabled
                >

                ${ad}

              </label>

            `).join("")

            :

            `<label>OFF</label>`
          }

        </div>

        <div class="host-section">

          <h4>

            Shortlinks

          </h4>

          ${
            host.shortlinks?.length

            ? host.shortlinks.map(short=>`

              <label>

                <input
                  type="checkbox"
                  checked
                  disabled
                >

                ${short}

              </label>

            `).join("")

            :

            `<label>NONE</label>`
          }

        </div>

        <div class="host-section">

          <h4>

            Popups

          </h4>

          ${
            host.popups?.length

            ? host.popups.map(popup=>`

              <label>

                <input
                  type="checkbox"
                  checked
                  disabled
                >

                ${popup}

              </label>

            `).join("")

            :

            `<label>NONE</label>`
          }

        </div>

        <div class="host-section">

          <h4>

            Mode

          </h4>

          <select disabled>

            <option>

              ${host.mode || "random"}

            </option>

          </select>

        </div>

      </div>

    `

  })

}

/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalytics(){

  totalHosts.innerText =
  HOSTS.length

  totalAds.innerText =
  ADS.length

  totalShortlinks.innerText =
  SHORTLINKS.length

  totalClicks.innerText =

    HOSTS.reduce((acc,host)=>{

      return (
        acc +
        Number(
          host.clicks || 0
        )
      )

    },0)

}
