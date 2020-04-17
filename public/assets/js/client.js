const apiURL = 'http://localhost:3000/navigate';
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

const form = document.querySelector("form");
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
    console.log(fromTo);
    fetch(apiURL, {
        method: 'POST',
        body: JSON.stringify(fromTo),
        headers: {
            'content-type': 'application/json'
        }  
    })
});

