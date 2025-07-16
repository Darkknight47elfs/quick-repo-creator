import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  FeatureGroup,
  useMap,
  GeoJSON,
  WMSTileLayer,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSatelliteDish,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import "leaflet-google-places-autocomplete";


const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapWithDraw = ({ onGeoJSONUpdate, initialGeoJSON = [] }) => {
  const [geojsonData, setGeojsonData] = useState(initialGeoJSON);
  const [isSatellite, setIsSatellite] = useState(true);
  const [curPos, setCurPos] = useState(null);

  const wrapAsFeatureCollection = (features) => ({
    type: "FeatureCollection",
    features,
  });

  const getGeoJSONCenter = (geojson) => {
    if (!geojson || geojson.length === 0) return null;
    const bounds = L.geoJSON(geojson).getBounds();
    return bounds.getCenter();
  };

  useEffect(() => {
    if (initialGeoJSON.length > 0) {
      setGeojsonData(initialGeoJSON);
      const center = getGeoJSONCenter(initialGeoJSON);
      setCurPos(center);
    }
  }, [initialGeoJSON]);

  const fetchCurLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) =>
          setCurPos([latitude, longitude]),
        (err) => {
          console.error("Error fetching location:", err);
          alert("Unable to fetch location.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  }, []);

  const updateGeoJSON = useCallback(
    (newFeatures) => {
      const featureCollection = wrapAsFeatureCollection(newFeatures);
      setGeojsonData(featureCollection.features);
      onGeoJSONUpdate(featureCollection);
      const center = getGeoJSONCenter(featureCollection.features);
      if (center) setCurPos(center);
    },
    [onGeoJSONUpdate]
  );

  const handleCreate = (e) =>
    updateGeoJSON([...geojsonData, e.layer.toGeoJSON()]);
  const handleEdit = (e) =>
    updateGeoJSON(
      geojsonData.map((geoJson) =>
        geoJson.id === e.layer._leaflet_id ? e.layer.toGeoJSON() : geoJson
      )
    );
  const handleDelete = (e) =>
    updateGeoJSON(
      geojsonData.filter((geoJson) => geoJson.id !== e.layer._leaflet_id)
    );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={curPos || [10.648021, 76.549728]}
        zoom={20}
        className="w-full h-full"
        style={{ minHeight: "100%", position: "absolute" }}
      >
        {/* Google Maps Layer */}
        <ReactLeafletGoogleLayer
          apiKey={GOOGLE_MAPS_API_KEY}
          type={isSatellite ? "hybrid" : "roadmap"} // Changed from "satellite" to "hybrid"
        />

        {/* Optional: Bhuvan WMS Layer */}
        <WMSTileLayer
          url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
          layers="cadastral:cadastral_india"
          format="image/png"
          transparent={true}
          opacity={0.6}
        />

        {/* Google Places Search */}
        <GooglePlacesAutocomplete setCurPos={setCurPos} />

        <MapControls
          fetchCurLocation={fetchCurLocation}
          toggleSatellite={() => setIsSatellite(!isSatellite)}
        />
        {curPos && <MapCenter pos={curPos} />}

        {geojsonData.map((geoJson, index) => (
          <GeoJSON key={index} data={geoJson} />
        ))}

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onEdited={handleEdit}
            onDeleted={handleDelete}
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

// Center map when pos changes
const MapCenter = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, map.getZoom());
  }, [pos, map]);
  return null;
};

// Custom controls (current location, satellite toggle)
const MapControls = ({ fetchCurLocation, toggleSatellite }) => {
  const map = useMap();

  useEffect(() => {
    const customControl = L.control({ position: "topright" });

    customControl.onAdd = () => {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      div.style.backgroundColor = "white";
      div.style.padding = "5px";
      div.style.cursor = "pointer";
      div.style.display = "flex";
      div.style.flexDirection = "column";
      div.style.alignItems = "center";

      const root = createRoot(div);
      root.render(
        <>
          <button
            className="map-button"
            onClick={fetchCurLocation}
            title="Get Current Location"
          >
            <FontAwesomeIcon icon={faLocationArrow} size="lg" />
          </button>
          <button
            className="map-button"
            onClick={toggleSatellite}
            title="Toggle Satellite View"
          >
            <FontAwesomeIcon icon={faSatelliteDish} size="lg" />
          </button>
        </>
      );
      return div;
    };

    customControl.addTo(map);
    return () => map.removeControl(customControl);
  }, [map, fetchCurLocation, toggleSatellite]);

  return null;
};

// Google Places Autocomplete Control
const GooglePlacesAutocomplete = ({ setCurPos }) => {
  const map = useMap();

  useEffect(() => {
    if (!window.L.Control.GPlaceAutocomplete) return;

    const control = new window.L.Control.GPlaceAutocomplete({
      callback: function (place) {
        if (place && place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          const latLng = [loc.lat(), loc.lng()];
          setCurPos(latLng);
          map.setView(latLng, 18);
        }
      },
      placeholder: "Search places...",
      position: "topright",
    });

    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map, setCurPos]);

  return null;
};

export default MapWithDraw;
