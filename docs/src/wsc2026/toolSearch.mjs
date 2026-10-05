export function createToolSearch(onBusy){
 let worker=null,settle=null;
 function cancel(){if(!worker)return;worker.terminate();worker=null;const finish=settle;settle=null;onBusy(false);finish?.(null);}
 function run(tool,action,payload={}){
  cancel();onBusy(true);
  return new Promise((resolve,reject)=>{
   settle=resolve;
   try{
    const active=new Worker(new URL('./toolSearch.worker.mjs',import.meta.url),{type:'module'});worker=active;
    const finish=()=>{active.terminate();worker=null;settle=null;onBusy(false);};
    active.onmessage=({data})=>{if(worker!==active)return;finish();if(data.error)reject(new Error(data.error));else resolve(data.result);};
    active.onerror=()=>{if(worker!==active)return;finish();reject(new Error('Search worker failed. Please try again.'));};
    active.postMessage({tool,action,payload});
   }catch(error){worker=null;settle=null;onBusy(false);reject(error);}
  });
 }
 return {run,cancel};
}
