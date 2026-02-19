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
Application allows users to associate live cameras with their real-life coordinates for convenient representation in form of map markers. Stream autoplay starts with clicking on selected marker.

### How to use
1. Add a Stream
	- Enter custom marker name
	- Click anywhere on the map to auto-fill the Latitude and Longitude fields
	- Provide HLS stream URL (with `.m3u8` extension)
2. View stream - click on any marker to open the video player pop-up
3. Delete a stream - click the "Delete" button in the opened stream pop-up

All changes are being auto-saved locally.

### Example stream
Complete "Add stream source" form with provided data:
- Title: `Gdansk Old Town`
- Latitude: `54.347793`
- Longitude: `18.648305`
- Stream adress: `https://kamera.task.gda.pl/rtplive/k109.sdp/playlist.m3u8`