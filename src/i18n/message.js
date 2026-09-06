/** Language-neutral messages may be queued or serialized without freezing a locale. */
export function message(key, params = {}) {
 return Object.freeze({key, params:Object.freeze({...params})});
}
export const isLanguage=value=>value==='pl'||value==='en';
export const normalizeLanguage=value=>isLanguage(value)?value:null;
