const textNav = 'http://localhost:5000/navigate';
const coordNav = 'http://localhost:5000/route';
var coord;
const form = document.querySelector("form");

var style_new = {
    "weight": 5,
    "color": "#362fed"
};

var style_quick = {
    "color": "#e84423",
    "weight": 5,
    "opacity": 0.65
};

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
var group_new = L.layerGroup(null);
var group_quick = L.layerGroup(null);
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
        //console.log(e.target._latlng);
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
        let menu = document.getElementById('list');
        while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
        }
        let response = await fetch(coordNav, {
            method: 'POST',
            body: JSON.stringify(fromTo),
            headers: {
                'content-type': 'application/json'
            }  
        });
        let coords = await response.json();
        console.log(coords.route_new[1]);
        group_new.remove();
        group_quick.remove();
        routeList_new = [];
        routeList_quick = [];
        descr = [];
        str_name = [];
        for (i=0; i<coords.route_new.length; i++) {
             routeList_new.push(L.geoJSON(JSON.parse(coords.route_new[i].geojson), {
                style: style_new
            }));
            descr.push(Math.floor(coords.route_new[i].seg_length));
            str_name.push(coords.route_new[i].osm_name);
        }
        console.log(descr, str_name);
        group_new = L.layerGroup(routeList_new).addTo(mymap);

        for (i=0; i<coords.route_quick.length; i++) {
            routeList_quick.push(L.geoJSON(JSON.parse(coords.route_quick[i].geojson), {
                style: style_quick
            }))
       }
       group_quick = L.layerGroup(routeList_quick).addTo(mymap);
       
       //Add description
       for (i = 0; i < descr.length; i++) {
        var li = document.createElement("li");
        var text = document.createTextNode(`${descr[i]}m on ${str_name[i]}`);
        li.appendChild(text);
        document.getElementById("list").appendChild(li);
      }
        btn.innerHTML = 'Go';
    }
    getCoords()
    .catch(err => {
        console.log(err);
    });
});