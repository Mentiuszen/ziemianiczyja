import {validateSnapshot} from './schema.js';
const clone=v=>structuredClone(v);
export const CAMPAIGN_KEY='campaign-progress-v1';
const difficulties=['recruit','soldier','veteran'];
export function checkpointReference(cp){return{mission:cp.mission,missionVersion:cp.missionVersion,time:cp.time,difficulty:cp.difficulty||'soldier'};}
export function newRunId(){return globalThis.crypto?.randomUUID?.()||`run-${Date.now().toString(36)}-${++newRunId.serial}`;}
newRunId.serial=0;
export function createProgress(checkpoint,runId=newRunId()){
 const complete=checkpoint.director.phase>=7;
 return{version:1,campaignId:'western-front',runId,currentMissionId:'cambrai',status:complete?'complete':'in-progress',completedMissionIds:complete?['cambrai']:[],checkpointRef:checkpointReference(checkpoint)};
}
export function validateProgress(p,cp){
 if(!p||p.version!==1||p.campaignId!=='western-front'||typeof p.runId!=='string'||!p.runId.trim()||p.runId.length>160||p.currentMissionId!=='cambrai'||!['in-progress','complete'].includes(p.status)||!Array.isArray(p.completedMissionIds))throw new Error('Invalid campaign metadata');
 if(p.completedMissionIds.some(id=>id!=='cambrai')||new Set(p.completedMissionIds).size!==p.completedMissionIds.length||((p.status==='complete')!==p.completedMissionIds.includes('cambrai')))throw new Error('Inconsistent campaign completion');
 const ref=checkpointReference(cp);if(!p.checkpointRef||Object.keys(ref).some(k=>p.checkpointRef[k]!==ref[k])||!difficulties.includes(p.checkpointRef.difficulty))throw new Error('Campaign checkpoint mismatch');
 if(cp.director.phase>=7&&p.status!=='complete')throw new Error('Campaign completion mismatch');return p;
}
export function progressForCheckpoint(cp,previous){
 const p=createProgress(cp,previous?.runId||newRunId());
 if(previous?.status==='complete'){p.status='complete';p.completedMissionIds=['cambrai'];}return p;
}
export function completeProgress(progress,checkpoint){return{...createProgress(checkpoint,progress?.runId||newRunId()),status:'complete',completedMissionIds:['cambrai']};}
export function reconcileCampaign(checkpoint,progress,legacyCompleted=false){
 if(!checkpoint)return{checkpoint:null,progress:null,checkpointState:'none',legacyCompleted,metadataRepaired:!!progress};
 const cp=validateSnapshot(checkpoint);let metadataRepaired=false;
 try{validateProgress(progress,cp);}catch{metadataRepaired=!!progress;progress=createProgress(cp,`legacy-${cp.mission}-${cp.time}-${cp.difficulty||'soldier'}`);}
 return{checkpoint:clone(cp),progress:clone(progress),checkpointState:'ready',legacyCompleted,metadataRepaired};
}
