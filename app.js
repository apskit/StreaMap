// Map initialization
let view = { lat: 54.38, lng: 18.58, zoom: 12 }

const savedView = localStorage.getItem('mapView');
if (savedView) {
    view = JSON.parse(savedView);
}

const map = L.map('map').setView([view.lat, view.lng], view.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
}).addTo(map);

// Map events

map.on('click', function(e) {
    document.getElementById('stream-lat').value = e.latlng.lat.toFixed(6);
    document.getElementById('stream-lng').value = e.latlng.lng.toFixed(6);
});

map.on('moveend', function() {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    const viewState = { lat: currentCenter.lat, lng: currentCenter.lng, zoom: currentZoom };
    localStorage.setItem('mapView', JSON.stringify(viewState));
});

// Streams and points handlers

let streamsData = [];
const markersMap = {};
let currentHls = null;

function saveToStorage() {
    let streamsToSave = JSON.stringify(streamsData);
    localStorage.setItem('savedStreams', streamsToSave);
}

function loadFromStorage() {
    savedStreams = localStorage.getItem('savedStreams');

    if (savedStreams) {
        streamsData = JSON.parse(savedStreams);
        streamsData.forEach(function(streamData) {
            createCameraMarker(streamData);
        });
    }
}

function createCameraMarker(streamData) {
    const marker = L.marker([streamData.latitude, streamData.longitude]).addTo(map);

    const popupContent = `
        <div class="video-popup">
            <h3>${streamData.name}</h3>
            <video id="${streamData.id}" muted autoplay playsinline></video>
            <div class="popup-controls">
                <button onclick="removeCamera('${streamData.id}')"">remove</button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    marker.id = streamData.id;

    marker.on('popupopen', () => {
        const videoElement = document.getElementById(streamData.id);
        
        if (currentHls) {
            currentHls.destroy();
            currentHls = null;
        }

        currentHls = new Hls();
        currentHls.loadSource(streamData.url);
        currentHls.attachMedia(videoElement);
        currentHls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoElement.play().catch(e => console.log("Autoplay error:", e));
        });

    });

    marker.on('popupclose', () => {
        if (currentHls) {
            currentHls.destroy();
            currentHls = null;
        }
    });

    markersMap[streamData.id] = marker;
}

const form = document.getElementById('add-stream-form');
form.addEventListener('submit', addNewPoint);

function addNewPoint() {

    event.preventDefault();

    const name = document.getElementById('stream-name').value || "Live Camera";
    const latitude = parseFloat(document.getElementById('stream-lat').value);
    const longitude = parseFloat(document.getElementById('stream-lng').value);
    const url = document.getElementById('stream-url').value;
    const id = Date.now().toString();

    if (isNaN(latitude) || isNaN(longitude)) {
        alert("Coordinates must be a number");
        return;
    }

    const newStream = {
        id: id,
        name: name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        url: url
    };

    streamsData.push(newStream);
    saveToStorage();

    createCameraMarker(newStream);

    form.reset();
}

function removeCamera(idToRemove) {
    streamsData = streamsData.filter(stream => stream.id !== idToRemove);
    saveToStorage();

    const markerToRemove = markersMap[idToRemove];
    
    if (markerToRemove) {
        map.removeLayer(markerToRemove);
        delete markersMap[idToRemove];
    }
}

loadFromStorage();
