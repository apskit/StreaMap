# StreaMap

A lightweight, web application that allows users to place live streams on an interactive map (OpenStreetMap). It supports HLS (.m3u8) streams and uses local storage for persistence.

![Application stream popup view](/images/streamPopupView.png)

## Requirements
Application should work with every modern browser with enabled JavaScript.

## Tech stack
- HTML, CSS, JavaScript
- Leaflet 1.9.4
- hls.js library

## Usage
Application allows users to associate live cameras with their real-life coordinates for convenient representation in form of map markers. Stream autoplay starts with clicking on selected point.

### How to use
1. Add a Stream
	- Enter custom marker name
	- Click anywhere on the map to auto-fill the Latitude and Longitude fields
	- Provide HLS stream URL with file ending (`.m3u8` extension)
2. View stream - click on any marker to open the video player pop-up
3. Delete a stream - click the "Remove" button in the opened stream pop-up

All changes are being auto-saved locally.

### Markers managment
To save markers in the form of `.json` file, use the "Export" option in the control panel. Select "Clear map" button to Remove all streams from the map. To import markers back select option "Import" and provide a valid file.

### Example

#### Manual definition
Complete "Add stream source" form with provided data:
- Title: `Gdansk Old Town`
- Latitude: `54.347793`
- Longitude: `18.648305`
- Stream adress: `https://kamera.task.gda.pl/rtplive/k109.sdp/playlist.m3u8`

#### JSON import
Use `.json` data provided in `/examples` directory:
1. Select "Import" option in the control panel
2. Select valid `.json` file (`/examples/streaMapMarkersGDN.json`)
3. Find GDN Airport on the map to test loaded markers (54.376 N, 18.477 E)