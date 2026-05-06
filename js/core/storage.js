export function save(key,data){
  localStorage.setItem(key, JSON.stringify(data));
}

export function load(key,fallback=null){
  try{
    return JSON.parse(localStorage.getItem(key)) || fallback;
  }catch{
    return fallback;
  }
}

export function remove(key){
  localStorage.removeItem(key);
}
