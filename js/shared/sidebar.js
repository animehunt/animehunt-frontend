import { $, $$ } from "../core/dom.js";

export function initSidebar(){

  const menu = $(".menu-btn");
  const sidebar = $(".sidebar");
  const overlay = $(".overlay");
  const close = $(".close-btn");

  if(!menu || !sidebar) return;

  function open(){
    sidebar.classList.add("active");
    overlay.classList.add("active");
  }

  function hide(){
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  menu.onclick = open;
  close.onclick = hide;
  overlay.onclick = hide;
}
