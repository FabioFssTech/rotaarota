let map = L.map('map').setView([-22.9068, -43.1729], 11);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'© OpenStreetMap'
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

alert("Preencha origem e destino");

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

controleRota.on("routesfound",function(e){

const rota = e.routes[0];

const distancia =
(rota.summary.totalDistance/1000)
.toFixed(2);

const tempo =
Math.round(
rota.summary.totalTime/60
);

document.getElementById(
"distancia"
).innerText =
`Distância: ${distancia} km`;

document.getElementById(
"tempo"
).innerText =
`Tempo: ${tempo} min`;

});

salvarHistorico(origem,destino);

}catch(error){

alert(
"Não foi possível localizar os endereços."
);

}

}

function usarLocalizacao(){

if(!navigator.geolocation){

alert("GPS não suportado");

return;

}

navigator.geolocation.getCurrentPosition(

function(posicao){

const lat =
posicao.coords.latitude;

const lon =
posicao.coords.longitude;

map.setView([lat,lon],15);

L.marker([lat,lon])
.addTo(map)
.bindPopup("Você está aqui")
.openPopup();

fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
)

.then(resp=>resp.json())

.then(data=>{

document.getElementById(
"origem"
).value =
data.display_name;

});

}

);

}

function salvarHistorico(origem,destino){

let historico =
JSON.parse(
localStorage.getItem("historico")
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
localStorage.getItem("historico")
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
${item.origem}
<br>
⬇️
<br>
${item.destino}
`;

lista.appendChild(li);

});

}