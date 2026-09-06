/** Revision 2: real geographic coordinates; military lines are documented generalizations.
 * Geography: GSHHG 2.3.6 (separately licensed regional data). Fronts: see docs/UI_ART.md, not a trench survey.
 * No campaign selection mutates Simulation, saves, mission availability or gameplay geometry.
 */
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const GEO_BOUNDS=freeze({west:-1.9,east:9.1,south:46.9,north:52.1});
export function projectGeo(lon,lat){return {x:(lon-GEO_BOUNDS.west)/(GEO_BOUNDS.east-GEO_BOUNDS.west)*1000,y:(GEO_BOUNDS.north-lat)/(GEO_BOUNDS.north-GEO_BOUNDS.south)*720};}
export const CHAPTER_COORDINATES=freeze({somme:[2.69,50.05],flers:[2.822,50.049],ypres:[2.885,50.852],cambrai:[3.2357,50.1766],amiens:[2.30,49.895]});
export const MAP_POINTS=freeze(Object.fromEntries(Object.entries(CHAPTER_COORDINATES).map(([id,p])=>[id,projectGeo(...p)])));
export const WHOLE_VIEW=freeze([0,0,1000,720]);
const viewAt=(id,width=405)=>{const p=MAP_POINTS[id],height=width*.72;return [Math.max(0,Math.min(1000-width,p.x-width*.5)),Math.max(0,Math.min(720-height,p.y-height*.48)),width,height];};
export const CAMBRAI_VIEW=freeze(viewAt('cambrai'));
export const YPRES_VIEW=freeze(viewAt('ypres'));
export const FRONT_DATE='1917-11-20'; // Default Cambrai snapshot; the screen reads the selected frame.
const north1916=[[2.748,51.143],[2.77,51.10],[2.862,51.03],[2.92,50.96],[2.96,50.90],[2.95,50.85],[2.91,50.77],[2.93,50.70],[2.89,50.64],[2.79,50.55],[2.80,50.48],[2.83,50.42],[2.80,50.34],[2.84,50.27]];
const sommeJuly=[[2.66,50.15],[2.646,50.13],[2.665,50.083],[2.69,50.05],[2.70,50.024],[2.712,49.998],[2.765,50.003],[2.78,49.986],[2.818,49.963],[2.865,49.912],[2.817,49.867],[2.766,49.824],[2.74,49.71],[2.81,49.59],[2.96,49.54],[3.30,49.39],[3.8,49.44]];
const sommeSeptember=[[2.66,50.15],[2.646,50.13],[2.665,50.083],[2.70,50.061],[2.74,50.044],[2.767,50.046],[2.78,50.035],[2.83,50.022],[2.864,50.01],[2.89,49.98],[2.916,49.944],[2.884,49.891],[2.817,49.847],[2.766,49.824],[2.74,49.71],[2.81,49.59],[2.96,49.54],[3.30,49.39],[3.8,49.44]];
const south1916=[[4.03,49.33],[4.31,49.26],[4.66,49.22],[4.94,49.19],[5.13,49.24],[5.24,49.28],[5.39,49.25],[5.45,49.20],[5.46,49.07],[5.45,48.89],[5.70,48.88],[6.05,48.91],[6.27,48.89],[6.42,48.84],[6.72,48.71],[6.90,48.62],[7.04,48.46],[7.15,48.39],[7.10,48.17],[7.10,48.02],[7.16,47.87],[7.06,47.81],[7.12,47.67],[7.165,47.504]];
const south1917=[[4.03,49.33],[4.31,49.27],[4.66,49.22],[4.94,49.23],[5.12,49.30],[5.28,49.33],[5.40,49.28],[5.50,49.22],...south1916.slice(8)];
const northOctober=[[2.748,51.143],[2.77,51.10],[2.862,51.03],[2.94,50.98],[3.00,50.936],[3.008,50.907],[3.004,50.87],[2.997,50.819],[2.96,50.768],[2.947,50.709],[2.896,50.642],[2.81,50.557],[2.82,50.48],[2.835,50.437],[2.855,50.377],[2.917,50.316],[2.934,50.238]];
const northNovember=[[2.748,51.143],[2.77,51.10],[2.862,51.03],[2.948,50.98],[3.04,50.94],[3.034,50.904],[3.019,50.869],[2.997,50.819],[2.96,50.768],[2.947,50.709],[2.896,50.642],[2.81,50.557],[2.82,50.48],[2.835,50.437],[2.855,50.377],[2.917,50.316],[2.934,50.238]];
const hindenburg=[[2.99,50.175],[3.054,50.151],[3.084,50.113],[3.083,50.056],[3.137,50.009],[3.21,49.953],[3.245,49.879],[3.27,49.817],[3.35,49.717],[3.37,49.65],[3.46,49.52],[3.78,49.455]];
const northAugust1918=[[2.748,51.143],[2.77,51.10],[2.862,51.03],[2.91,50.95],[2.946,50.869],[2.885,50.792],[2.775,50.785],[2.696,50.754],[2.619,50.703],[2.612,50.650],[2.72,50.603],[2.79,50.534],[2.82,50.48],[2.835,50.437],[2.855,50.377],[2.917,50.316],[2.88,50.22],[2.70,50.145],[2.628,50.049],[2.624,50.002],[2.583,49.942],[2.58,49.898],[2.57,49.860],[2.526,49.793],[2.49,49.765],[2.574,49.646],[2.80,49.585],[3.03,49.53],[3.35,49.40],[3.56,49.36],[3.69,49.31],[4.03,49.33]];
const sources=freeze(['https://www.trumanlibrary.gov/maps/m1236-map-front-line-movement-and-areas-allied-occupation','https://www.nam.ac.uk/explore/battle-somme','https://www.nam.ac.uk/explore/1917-year-stalemate','https://veterans.gc.ca/en/remembrance/military-history/first-world-war/map-western-front']);
const raw={
 somme:{date:'1916-07-01',front:[...north1916,...sommeJuly,...south1916],arrows:[[[2.55,50.025],[2.68,50.07]],[[2.64,49.92],[2.80,49.975]]]},
 flers:{date:'1916-09-15',front:[...north1916,...sommeSeptember,...south1916],arrows:[[[2.70,50.025],[2.837,50.069]],[[2.788,49.990],[2.895,50.03]]]},
 ypres:{date:'1917-10',front:[...northOctober,...hindenburg,...south1917],arrows:[[[2.90,50.887],[3.02,50.93]],[[2.94,50.83],[3.058,50.894]]]},
 cambrai:{date:'1917-11-20',front:[...northNovember,...hindenburg,...south1917],arrows:[[[3.018,50.088],[3.16,50.18]],[[3.07,50.025],[3.242,50.155]],[[3.168,50.055],[3.301,50.159]]]},
 amiens:{date:'1918-08-08',front:[...northAugust1918,...south1917.slice(1)],arrows:[[[2.48,49.92],[2.69,49.92]],[[2.47,49.853],[2.70,49.846]],[[2.40,49.79],[2.62,49.79]]]}
};
const xy=coords=>coords.map(p=>{const q=projectGeo(...p);return [q.x,q.y];});
export const FRONT_SNAPSHOTS=freeze(Object.fromEntries(Object.entries(raw).map(([id,f])=>[id,{id,date:f.date,dateKey:`campaign.${id}.date`,precision:id==='ypres'?'month':'day',front:xy(f.front),geographicFront:f.front,arrows:f.arrows.map(xy),point:MAP_POINTS[id],view:viewAt(id,id==='ypres'?335:405),sources,generalized:true}])));
export function campaignFrame(id){if(!Object.hasOwn(FRONT_SNAPSHOTS,id))throw new RangeError(`Unknown campaign mission: ${id}`);return FRONT_SNAPSHOTS[id];}
export const FRONT_LINE=FRONT_SNAPSHOTS.cambrai.front;
export const MAP_TOWNS=freeze([
 ['Calais',1.8587,50.9513],['Lille',3.0573,50.6292],['Arras',2.777,50.292],['Bapaume',2.85,50.105],['Péronne',2.933,49.933],['Saint-Quentin',3.286,49.848],['Reims',4.032,49.258],['Paris',2.3522,48.8566],['Verdun',5.384,49.159],['Nancy',6.184,48.693],['Strasbourg',7.752,48.573],['Belfort',6.863,47.639],['Bruxelles',4.3517,50.8503],['Metz',6.176,49.119]
].map(([name,lon,lat])=>({name,...projectGeo(lon,lat)})));
