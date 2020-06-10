const textNav = 'http://localhost:5000/navigate';
const coordNav = 'http://localhost:5000/route';
var coord;
const form = document.querySelector("form");

// Leaflet setup
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
var sourceMarker = L.marker([-37.812248, 144.962056], {
	draggable: true
})
	 .on("dragend", function(e) {
        console.log(e.target._latlng);
        var lat = e.target._latlng.lat;
        var lon = e.target._latlng.lng;
        document.getElementById('from').value = `${lon}, ${lat}`;
	 })
    .addTo(mymap);
    
var targetMarker = L.marker([-37.812348, 144.961056], {
    draggable: true
})
     .on("dragend", function(e) {
        console.log(e.target._latlng);
        var lat = e.target._latlng.lat;
        var lon = e.target._latlng.lng;
        document.getElementById('to').value = `${lon}, ${lat}`;
     })
    .addTo(mymap);

// Send address to server for geocoding and add results as markers to Leaflet

form.addEventListener('submit', event => {
    event.preventDefault();
    const btn = document.getElementById('send');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>';
    const formData = new FormData(form);
    const from = formData.get('from');
    const to = formData.get('to');
    const fromTo = {
        from,
        to
    }
    async function getCoords() {
        let response = await fetch(coordNav, {
            method: 'POST',
            body: JSON.stringify(fromTo),
            headers: {
                'content-type': 'application/json'
            }  
        });
        let coords = await response.json();
        for (i=0;i<coords.route.length;i++) {
            L.geoJSON(JSON.parse(coords.route[i].geojson)).addTo(mymap);
        }
        btn.innerHTML = 'Go';
    }
    getCoords()
    .catch(err => {
        console.log(err);
    });
});
// mymap.on('click', function(e) {
//     var lat = e.latlng.lat;
//     var lon = e.latlng.lng;
//     document.getElementById('from').value = `${lon}, ${lat}`;
//     var pos = L.marker().addTo(mymap);
// });
