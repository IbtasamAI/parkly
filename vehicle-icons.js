/* Parkly V6 vehicle art: original stylized SVG silhouettes, no licensed logos. */
const VEHICLE_STYLES=[
['sedan','Sedan','🚘'],['suv','SUV','🚙'],['batmobile','Shadow Cruiser','🦇'],['rocket','Rocket Sports Car','🚀'],
['sports','Sports Car','🏎️'],['supercar','Supercar','🏁'],['truck','Truck','🛻'],['pickup','Pickup','🚚'],
['motorbike','Motorbike','🏍️'],['bicycle','Bicycle','🚲'],['atv','ATV','🏜️'],['rc','RC Car','🎮'],
['fighter','Fighter Jet','✈️'],['helicopter','Helicopter','🚁'],['van','Van','🚐'],['bus','Bus','🚌'],
['scooter','Scooter','🛵'],['kart','Go-Kart','🏎️'],['classic','Classic Car','🚗'],['electric','Electric Car','⚡'],['taxi','Taxi','🚕'],['police','Police Car','🚓'],['ambulance','Ambulance','🚑'],['firetruck','Fire Truck','🚒'],['convertible','Convertible','🚘']
];
const vehicleDef=id=>VEHICLE_STYLES.find(v=>v[0]===id)||VEHICLE_STYLES[0];
const RENDERED_AVATARS={sedan:'sedan',suv:'suv',batmobile:'supercar',rocket:'rocket',sports:'sports',supercar:'supercar',truck:'truck',pickup:'truck',motorbike:'motorbike',bicycle:'bicycle',atv:'atv',rc:'rc',fighter:'fighter',helicopter:'helicopter',van:'van',bus:'bus',scooter:'motorbike',kart:'rocket',classic:'classic',electric:'convertible',taxi:'taxi',police:'police',ambulance:'ambulance',firetruck:'firetruck',convertible:'convertible'};
function vehicleSVG(type,small=false){
 const v=vehicleDef(type),art=RENDERED_AVATARS[v[0]]||'suv';
 return `<span class="vehicle-render-host vehicle-true3d ${small?'vehicle-small':''}" data-3d-style="${v[0]}" role="img" aria-label="Interactive rotatable 3D ${v[1]} vehicle. Drag left or right to rotate." tabindex="0"><canvas class="vehicle-3d-output" width="${small?240:480}" height="${small?180:340}" aria-hidden="true"></canvas><img class="vehicle-render-img vehicle-fallback" src="avatars/${art}.webp" alt="" loading="lazy" decoding="async" /></span>`;
}
function vehiclePicker(current='suv'){return `<div class="vehicle-picker"><div class="vehicle-picker-title">CHOOSE YOUR VEHICLE <span>REAL-TIME 3D · DRAG TO ROTATE · 25 OPTIONS</span></div><div class="vehicle-options" role="radiogroup" aria-label="Vehicle icon">${VEHICLE_STYLES.map(v=>`<label class="vehicle-option"><input type="radio" name="vehicleStyle" value="${v[0]}" ${current===v[0]?'checked':''}><span class="vehicle-tile">${vehicleSVG(v[0],true)}<span>${v[1]}</span></span></label>`).join('')}</div></div>`}
function chosenVehicleStyle(){return document.querySelector('input[name="vehicleStyle"]:checked')?.value||'suv'}
