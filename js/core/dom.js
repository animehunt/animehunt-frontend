export const $ = (s) => document.querySelector(s);

export const $$ = (s) => [...document.querySelectorAll(s)];

export function show(el){
  if(el) el.style.display = "block";
}

export function hide(el){
  if(el) el.style.display = "none";
}
