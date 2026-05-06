export function createCard(anime){

  return `
    <a href="details.html?slug=${anime.slug}" class="rel-card">
      <img 
        src="${anime.poster}?tr=w-300,h-450"
        style="width:100%;height:100%;object-fit:cover;border-radius:8px"
      >
    </a>
  `;
}

export function debounce(fn,delay=400){

  let timer;

  return (...args)=>{
    clearTimeout(timer);

    timer = setTimeout(()=>{
      fn(...args);
    },delay);
  };
}

export function groupBySeason(list=[]){

  const map = {};

  list.forEach(ep=>{

    const s = ep.season || "1";

    if(!map[s]) map[s] = [];

    map[s].push(ep);

  });

  return map;
}
