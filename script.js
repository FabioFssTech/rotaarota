let map = L.map("map").setView(
[-22.9068, -43.1729],
11
);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution:"© OpenStreetMap"
}
).addTo(map);

let controleRota = null;

carregarHistorico();

async function buscarCoordenadas(endereco){

const resposta = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
);

const dados = await resposta.json();

if(!dados.length){
throw new Error("Endereço não encontrado");
}

return {
lat: parseFloat(dados[0].lat),
lon: parseFloat(dados[0].lon)
};

}

async function calcularRota(){

const origem =
document.getElementById("origem").value;

const destino =
document.getElementById("destino").value;

if(!origem || !destino){

alert("Informe origem e destino");

return;

}

try{

const origemCoord =
await buscarCoordenadas(origem);

const destinoCoord =
await buscarCoordenadas(destino);

if(controleRota){

map.removeControl(controleRota);

}

controleRota = L.Routing.control({

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

controleRota.on(
"routesfound",
function(e){

const rota =
e.routes[0];

const distanciaKm =
rota.summary.totalDistance / 1000;

document.getElementById(
"distancia"
).innerText =
`Distância: ${distanciaKm.toFixed(2)} km`;

calcularTempos(
distanciaKm
);

sugerirOnibus(
distanciaKm
);

}
);

salvarHistorico(
origem,
destino
);

}catch(erro){

alert(
"Não foi possível calcular esta rota."
);

}

}

function calcularTempos(distancia){

const carro =
Math.round(
(distancia/40)*60
);

const onibus =
Math.round(
(distancia/22)*60
);

const pe =
Math.round(
(distancia/5)*60
);

const bike =
Math.round(
(distancia/15)*60
);

document.getElementById(
"tempoCarro"
).innerText =
`${carro} min`;

document.getElementById(
"tempoOnibus"
).innerText =
`${onibus} min`;

document.getElementById(
"tempoPe"
).innerText =
`${pe} min`;

document.getElementById(
"tempoBike"
).innerText =
`${bike} min`;

}

function sugerirOnibus(distancia){

const lista =
document.getElementById(
"linhasOnibus"
);

lista.innerHTML = "";

const linhas = [

{
nome:"483",
rota:"Centro → Copacabana"
},

{
nome:"309",
rota:"Central → Botafogo"
},

{
nome:"104",
rota:"Centro → Ipanema"
},

{
nome:"474",
rota:"Jacaré → Jardim Oceânico"
}
];

linhas.forEach(item=>{

const li =
document.createElement("li");

li.innerHTML =
`<strong>Linha ${item.nome}</strong><br>${item.rota}`;

lista.appendChild(li);

});

}

function usarLocalizacao(){

navigator.geolocation.getCurrentPosition(

function(pos){

const lat =
pos.coords.latitude;

const lon =
pos.coords.longitude;

map.setView(
[lat,lon],
15
);

L.marker([lat,lon])
.addTo(map)
.bindPopup(
"Você está aqui"
)
.openPopup();

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
historico.slice(0,10);

localStorage.setItem(
"historico",
JSON.stringify(historico)
);

carregarHistorico();

}

function carregarHistorico(){

const historico =
JSON.parse(
localStorage.getItem(
"historico"
)
) || [];

const lista =
document.getElementById(
"listaHistorico"
);

if(!lista) return;

lista.innerHTML = "";

historico.forEach(item=>{

const li =
document.createElement("li");

li.innerHTML =
`
<strong>${item.origem}</strong>
<br>
⬇️
<br>
<strong>${item.destino}</strong>
`;

lista.appendChild(li);

});

}
