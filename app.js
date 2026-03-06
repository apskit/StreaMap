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
let markersMap = {};
let currentHls = null;

function saveToStorage() {
    let streamsToSave = JSON.stringify(streamsData);
    localStorage.setItem('savedStreams', streamsToSave);
}

function loadFromStorage() {
    const savedStreams = localStorage.getItem('savedStreams');

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
                <button onclick="removeCamera('${streamData.id}')">Remove</button>
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

document.getElementById('import').addEventListener('click', selectFileToImport);
document.getElementById('import-file').addEventListener('change', importMarkers);
document.getElementById('export').addEventListener('click', exportMarkers);
document.getElementById('clear').addEventListener('click', removeAllMarkers);

function addNewPoint(event) {

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

    try {
        const parsedUrl = new URL(url)
        const filePath = parsedUrl.pathname.toLowerCase();

        const allowedExtensions = ['.m3u8'];
        
        if (!allowedExtensions.some(ext => filePath.endsWith(ext))) {
            alert("Url adress ends with unsupported extension");
            return;
        }
    } catch (error) {
        alert("URL adress is invalid");
        return;
    }

    const newStream = {
        id: id,
        name: name,
        latitude: latitude,
        longitude: longitude,
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

function removeAllMarkers() {
    Object.values(markersMap).forEach(marker => map.removeLayer(marker));
    streamsData = [];
    markersMap = {};
    saveToStorage();
}

function exportMarkers() {
    let streamsToExport = JSON.stringify(streamsData, null, 1);
    const blob = new Blob([streamsToExport], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = "streaMapMarkers.json";
    a.click();
    URL.revokeObjectURL(downloadUrl);
}

function selectFileToImport() {
    document.getElementById('import-file').click();
}

function importMarkers() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;

            try {
                const importedStreams = JSON.parse(fileContent);

                importedStreams.forEach((importedStream) => {
                    if(!streamsData.some(stream => stream.url === importedStream.url)) {
                        streamsData.push(importedStream);
                        createCameraMarker(importedStream);
                    }
                });

                saveToStorage();

            } catch(error) {
                alert("Import error: Selected file is invalid");
            }
        };

        reader.readAsText(file);        
    }

    fileInput.value = '';
}

loadFromStorage();
