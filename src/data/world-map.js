/** All coordinates are metres. Cosmetic quality must never mutate these values. */
export const MAP=Object.freeze({minX:-108,minZ:-32,width:216,depth:272,minPlayX:-93,maxPlayX:93,minPlayZ:-23,maxPlayZ:213,navMinX:-92,navMinZ:-22,navMaxX:92,navMaxZ:212});
export const MISSION_VERSION=2;
/** Move the northern sector, preserving the authored start, first line and aid station. */
export const northZ=z=>z>=85?z+40:z;
export const LANDMARKS=Object.freeze({orders:{x:3,z:3},bunker:{x:23,z:60},aid:{x:-27,z:69},telephone:{x:4,z:159}});
export function roadX(z){return 40+Math.sin(z*.017)*7+Math.sin(z*.041)*2;}
export const RUIN_BUILDINGS=Object.freeze([
 {x:-72,z:166,w:10,d:13,h:3.8},{x:62,z:171,w:12,d:15,h:4.2},
 {x:30,z:194,w:9,d:11,h:3.4},{x:-35,z:190,w:11,d:12,h:3.7},
 {x:69,z:106,w:8,d:10,h:2.8}
]);
