const API =
"https://animehunt-backend.animehunt715.workers.dev/api/player/public";

let PLAYER_CONFIG = null;

export async function getPlayerConfig(){

  try{

    if(PLAYER_CONFIG){
      return PLAYER_CONFIG;
    }

    const res = await fetch(API);

    if(!res.ok){
      return null;
    }

    PLAYER_CONFIG = await res.json();

    return PLAYER_CONFIG;

  }catch{

    return null;

  }

}
