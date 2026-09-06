import {validateSnapshot} from './schema.js';
import {validateProgress,progressForCheckpoint} from './campaign.js';
import {DIFFICULTIES} from '../data/weapons.js';
import {LocalizedError} from '../i18n/index.js';
/** Change only the chosen difficulty and its metadata reference. No healing or RNG draws.
 * The next Simulation.restore configures the existing Health profile from this field.
 * Remaining damage/reload/reaction timers intentionally retain their elapsed state.
 */
export function campaignWithDifficulty(snapshot,progress,difficulty){
 if(!Object.hasOwn(DIFFICULTIES,difficulty))throw new LocalizedError('save.difficulty');
 validateSnapshot(snapshot);if(progress)validateProgress(progress,snapshot);
 const checkpoint=structuredClone(snapshot);checkpoint.difficulty=difficulty;
 const metadata=progressForCheckpoint(checkpoint,progress);
 validateSnapshot(checkpoint);validateProgress(metadata,checkpoint);
 return {checkpoint,progress:metadata};
}
