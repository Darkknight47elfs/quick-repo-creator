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

interface MapWithDrawProps {
  onGeoJSONUpdate: (featureCollection: any) => void;
  initialGeoJSON?: any[];
}

interface MapCenterProps {
  pos: [number, number];
}

interface MapControlsProps {
  fetchCurLocation: () => void;
  toggleSatellite: () => void;
}

interface GooglePlacesAutocompleteProps {
  setCurPos: (pos: [number, number] | null) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapWithDraw: React.FC<MapWithDrawProps> = ({ onGeoJSONUpdate, initialGeoJSON = [] }) => {
  const [geojsonData, setGeojsonData] = useState<any[]>(initialGeoJSON);
  const [isSatellite, setIsSatellite] = useState<boolean>(true);
  const [curPos, setCurPos] = useState<[number, number] | null>(null);

  const wrapAsFeatureCollection = (features: any[]): any => ({
    type: "FeatureCollection",
    features,
  });

  const getGeoJSONCenter = (geojson: any[]): [number, number] | null => {
    if (!geojson || geojson.length === 0) return null;
    const bounds = L.geoJSON(geojson).getBounds();
    const center = bounds.getCenter();
    return [center.lat, center.lng];
  };

  useEffect(() => {
    if (initialGeoJSON.length > 0) {
      setGeojsonData(initialGeoJSON);
      const center = getGeoJSONCenter(initialGeoJSON);
      setCurPos(center);
    }
  }, [initialGeoJSON]);

  const fetchCurLocation = useCallback((): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }: GeolocationPosition) =>
          setCurPos([latitude, longitude]),
        (err: GeolocationPositionError) => {
          console.error("Error fetching location:", err);
          alert("Unable to fetch location.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  }, []);

  const updateGeoJSON = useCallback(
    (newFeatures: any[]): void => {
      const featureCollection = wrapAsFeatureCollection(newFeatures);
      setGeojsonData(featureCollection.features);
      onGeoJSONUpdate(featureCollection);
      const center = getGeoJSONCenter(featureCollection.features);
      if (center) setCurPos(center);
    },
    [onGeoJSONUpdate]
  );

  const handleCreate = (e: any): void =>
    updateGeoJSON([...geojsonData, e.layer.toGeoJSON()]);
  
  const handleEdit = (e: any): void =>
    updateGeoJSON(
      geojsonData.map((geoJson: any) =>
        geoJson.id === e.layer._leaflet_id ? e.layer.toGeoJSON() : geoJson
      )
    );
  
  const handleDelete = (e: any): void =>
    updateGeoJSON(
      geojsonData.filter((geoJson: any) => geoJson.id !== e.layer._leaflet_id)
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
const MapCenter: React.FC<MapCenterProps> = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, map.getZoom());
  }, [pos, map]);
  return null;
};

// Custom controls (current location, satellite toggle)
const MapControls: React.FC<MapControlsProps> = ({ fetchCurLocation, toggleSatellite }) => {
  const map = useMap();

  useEffect(() => {
    const customControl = L.control({ position: "topright" });

    customControl.onAdd = function() {
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
    return () => {
      map.removeControl(customControl);
    };
  }, [map, fetchCurLocation, toggleSatellite]);

  return null;
};

// Google Places Autocomplete Control
const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({ setCurPos }) => {
  const map = useMap();

  useEffect(() => {
    if (!window.L.Control.GPlaceAutocomplete) return;

    const control = new window.L.Control.GPlaceAutocomplete({
      callback: function (place: any) {
        if (place && place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          const latLng: [number, number] = [loc.lat(), loc.lng()];
          setCurPos(latLng);
          map.setView(latLng, 18);
        }
      },
      placeholder: "Search places...",
      position: "topright",
    });

    map.addControl(control);
    return () => {
      if (map.hasLayer && map.hasLayer(control)) {
        map.removeControl(control);
      }
    };
  }, [map, setCurPos]);

  return null;
};

export default MapWithDraw;