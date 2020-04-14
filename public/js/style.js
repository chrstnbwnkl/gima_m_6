var coord;
const mymap = L.map('issmap', {
    zoomControl: false
}).setView([-37.812248, 144.962056], 15);
L.control.zoom({
     position:'bottomleft'
}).addTo(mymap);
const attr = '&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl,{ attr });
tiles.addTo(mymap);