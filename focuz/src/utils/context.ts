class GlobalContext {
    timerReward = new Map<any, number>(); 
    growthMeter = new Map<any, number>();
    waterMeter = new Map<any, number>();
    deathMeter = new Map<any, number>();
  }
  
export const globalContext = new GlobalContext();