const map = L.map("map").setView(
[-22.9068,-43.1729],
11
);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution:"© OpenStreetMap"
}
).addTo(map);

let rotaControle;

carregarHistorico();

function ehCEP(valor){

return /^\d{5}-?\d{3}$/.test(valor);

}

async function converterCEP(cep){

cep = cep.replace(/\D/g,'');

const resposta =
await fetch(
`https://viacep.com.br/ws/${cep}/json/`
);

const dados =
await resposta.json();

if(dados.erro){

throw new Error("CEP não encontrado");

}

return `
${dados.logradouro},
${dados.bairro},
${dados.localidade},
${dados.uf}
`;

}

async function buscarCoordenadas(local){

if(ehCEP(local)){

local =
await converterCEP(local);

}

const resposta =
await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`
);

const dados =
await resposta.json();

if(dados.length === 0){

throw new Error("Local não encontrado");

}

return {
lat:parseFloat(dados[0].lat),
lon:parseFloat(dados[0].lon)
};

}

async function calcularRota(){

let origem =
document.getElementById("origem").value;

let destino =
document.getElementById("destino").value;

if(!origem || !destino){

alert("Informe origem e destino.");

return;

}

try{

const origemCoord =
await buscarCoordenadas(origem);

const destinoCoord =
await buscarCoordenadas(destino);

if(rotaControle){

map.removeControl(rotaControle);

}

rotaControle =
L.Routing.control({

waypoints:[

L.latLng(
origemCoord.lat,
origemCoord.lon
),

L.latLng(
destinoCoord.lat,
destinoCoord.lon
)

],

routeWhileDragging:false,
addWaypoints:false

}).addTo(map);

rotaControle.on(
"routesfound",

function(e){

const rota =
e.routes[0];

const distancia =
(
rota.summary.totalDistance
/
1000
).toFixed(2);

const tempo =
Math.round(
rota.summary.totalTime
/
60
);

document.getElementById(
"distancia"
).innerHTML =
`Distância: ${distancia} km`;

document.getElementById(
"tempo"
).innerHTML =
`Tempo estimado: ${tempo} min`;

}

);

salvarHistorico(
origem,
destino
);

}catch(erro){

alert(
erro.message
);

console.error(
erro
);

}

}

function usarLocalizacao(){

if(!navigator.geolocation){

alert(
"Geolocalização não suportada."
);

return;

}

navigator.geolocation.getCurrentPosition(

async function(pos){

const lat =
pos.coords.latitude;

const lon =
pos.coords.longitude;

map.setView(
[lat,lon],
15
);

L.marker(
[lat,lon]
)

.addTo(map)

.bindPopup(
"Você está aqui"
)

.openPopup();

const resposta =
await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
);

const dados =
await resposta.json();

document.getElementById(
"origem"
).value =
dados.display_name;

}

);

}

function salvarHistorico(
origem,
destino
){

let historico =
JSON.parse(
localStorage.getItem(
"historico"
)
) || [];

historico.unshift({
origem,
destino
});

historico =
historico.slice(
0,
10
);

localStorage.setItem(
"historico",
JSON.stringify(
historico
)
);

carregarHistorico();

}

function carregarHistorico(){

const lista =
document.getElementById(
"historico"
);

if(!lista){

return;

}

const historico =
JSON.parse(
localStorage.getItem(
"historico"
)
) || [];

lista.innerHTML = "";

historico.forEach(item=>{

const li =
document.createElement(
"li"
);

li.innerHTML =
`
<strong>Origem:</strong>
${item.origem}
<br>
<strong>Destino:</strong>
${item.destino}
`;

lista.appendChild(
li
);

});

}
