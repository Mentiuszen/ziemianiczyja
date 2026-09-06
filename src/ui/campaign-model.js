import {CAMPAIGN} from '../data/cambrai.js';
/** Pure view model. A preview never mutates progress and never starts a world. */
export function buildCampaignViewModel({checkpointState='none',checkpoint=null,progress=null,intent='continue',selectedMissionId='cambrai',newDifficultyId='soldier'}={}){
 const mission=CAMPAIGN.find(m=>m.id===selectedMissionId);
 const ready=checkpointState==='ready'&&!!checkpoint;
 const completed=ready&&progress?.status==='complete';
 const mode=!mission?.available?'unavailable':intent==='new'?'new':completed?'complete':ready?'resume':'unavailable';
 return{canContinue:ready,missionId:selectedMissionId,mission,mode,checkpointLabel:checkpoint?.director?.lastCheckpoint??null,difficultyId:intent==='new'?newDifficultyId:(checkpoint?.difficulty||'soldier'),completedIds:progress?.completedMissionIds?.slice()||[],canStart:!!mission?.available&&checkpointState!=='loading'&&(mode==='new'||mode==='resume'),requiresOverwrite:intent==='new'&&(ready||checkpointState==='invalid')};
}
