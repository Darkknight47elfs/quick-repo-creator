import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, WMSTileLayer, FeatureGroup, useMap, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-google-places-autocomplete';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSatelliteDish, faLocationArrow, faMap, faRoad } from '@fortawesome/free-solid-svg-icons';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface SuccessModalProps {
  message: string;
  onClose: () => void;
  isError?: boolean;
}

interface FormData {
  rice_type: string;
  water_source: string;
  H_start_date: string;
}

interface FarmMapProps {
  farmerId: string | number;
  accessToken?: string;
  onFarmAdded?: (message: string) => void;
}

interface MapControlsProps {
  fetchCurLocation: () => void;
  cycleMapType: () => void;
  currentMapType: string;
  isLocating: boolean;
}

interface GooglePlacesAutocompleteProps {
  setCurPos: (pos: [number, number]) => void;
}

interface MapControllerProps {}

type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

declare global {
  interface Window {
    L: any;
  }
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose, isError = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-lg shadow-lg">
        <h2 className={`mb-4 text-2xl font-bold ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {isError ? 'Error!' : 'Success!'}
        </h2>
        <div className="mb-6 text-gray-700 whitespace-pre-line">{message}</div>
        <button
          onClick={onClose}
          className={`w-full px-4 py-2 text-white transition duration-300 rounded-lg ${
            isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const FarmMap: React.FC<FarmMapProps> = ({ farmerId, accessToken, onFarmAdded }) => {
  const [geojsonData, setGeojsonData] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    rice_type: '',
    water_source: '',
    H_start_date: '',
  });
  const [curPos, setCurPos] = useState<[number, number]>([10.648021, 76.549728]);
  const [mapType, setMapType] = useState<MapType>('hybrid'); 
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map | null>(null);

  const apiEndpoint = `${API_BASE_URL}/analyze/farms/${farmerId}/`;

  const closeModal = (): void => {
    setShowModal(false);
    setModalMessage('');
    setIsError(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = (e: any): void => {
    const newFeature = e.layer.toGeoJSON();
    const { id, ...featureWithoutId } = newFeature;
    setGeojsonData((prevData) => [...prevData, featureWithoutId]);
  };

  const handleEdit = (e: any): void => {
    const editedFeatures = Object.values(e.layers._layers).map((layer: any) => layer.toGeoJSON());
    setGeojsonData(editedFeatures);
  };

  const handleDelete = (e: any): void => {
    const deletedIds = Object.keys(e.layers._layers);
    const remainingFeatures = geojsonData.filter((feature: any) => !deletedIds.includes(feature.id));
    setGeojsonData(remainingFeatures);
  };

  const handleSubmit = async (): Promise<void> => {
    const accessToken = localStorage.getItem("token");
  
    if (!accessToken) {
      setModalMessage("Session expired. Please log in again.");
      setIsError(true);
      setShowModal(true);
      return;
    }
  
    if (!formData.rice_type || !formData.water_source || !formData.H_start_date || geojsonData.length === 0) {
      setModalMessage("Please fill all fields and draw a farm on the map.");
      setIsError(true);
      setShowModal(true);
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const payload = {
        farmer_id: parseInt(farmerId.toString()),  
        rice_type: formData.rice_type,
        water_source: formData.water_source,
        H_start_date: formData.H_start_date,
        geojson: {
          type: "FeatureCollection",
          features: geojsonData,
        },
      };
  
      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          Authorization: `Token ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      setModalMessage("Farm added successfully!");
      setIsError(false);
      setShowModal(true);
      
      // Clear form and map
      setGeojsonData([]);
      setFormData({
        rice_type: '',
        water_source: '',
        H_start_date: '',
      });
      featureGroupRef.current?.clearLayers();
      
      // Notify parent component
      if (onFarmAdded) {
        onFarmAdded("Farm added successfully!");
      }
    } catch (error: any) {
      console.error("Error adding farm:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         "Failed to add farm. Please try again.";
      setModalMessage(errorMessage);
      setIsError(true);
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCurLocation = (): void => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      setModalMessage('Geolocation is not supported by your browser');
      setIsError(true);
      setShowModal(true);
      setIsLocating(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setCurPos([latitude, longitude]);
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 18);
        }
        
        setIsLocating(false);
      },
      (error: GeolocationPositionError) => {
        setIsLocating(false);
        let errorMessage = 'Could not fetch your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while fetching location.';
        }
        
        setModalMessage(errorMessage);
        setIsError(true);
        setShowModal(true);
      },
      options
    );
  };

  // Cycle through map types
  const cycleMapType = (): void => {
    const types: MapType[] = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const MapController: React.FC<MapControllerProps> = () => {
    const map = useMap();
    mapRef.current = map;
    
    useEffect(() => {
      if (curPos) {
        map.setView(curPos, map.getZoom());
      }
    }, [curPos, map]);
    
    return null;
  };

  return (
    <div className="flex h-screen mt-5">
      {/* Form Container */}
      <div className="p-4 bg-gray-100 w-[25%]">
        <h1 className="mb-4 text-lg font-bold">Add Farm Details</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Crop Type</label>
          <input
            type="text"
            name="rice_type"
            placeholder="Enter your crop type"
            value={formData.rice_type}
            onChange={handleFormChange}
            className="w-full p-2 border border-black rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Plantation Begin Date</label>
          <input
            type="date"
            name="H_start_date"
            value={formData.H_start_date}
            onChange={handleFormChange}
            className="w-full p-2 border border-black rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Water Source Type</label>
          <input
            type="text"
            name="water_source"
            placeholder="Enter your water source"
            value={formData.water_source}
            onChange={handleFormChange}
            className="w-full p-2 border border-black rounded"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-[200px] py-2 text-lg font-semibold text-white bg-black rounded-full mx-auto transition-all hover:scale-105 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Confirm'}
        </button>
      </div>

      {/* Map Container */}
      <div className="w-[75%] h-screen">
        <MapContainer 
          center={curPos} 
          zoom={18} 
          style={{ height: '75%', width: '100%' }}
          key={`${curPos[0]}-${curPos[1]}`}
        >
          <MapController />
          
          {GOOGLE_MAPS_API_KEY && (
            <ReactLeafletGoogleLayer
              apiKey={GOOGLE_MAPS_API_KEY}
              type={mapType}
            />
          )}

          <WMSTileLayer
            url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
            layers="cadastral:cadastral_india"
            format="image/png"
            transparent={true}
            opacity={mapType === 'roadmap' ? 0.6 : 0.3}
          />

          <GooglePlacesAutocomplete setCurPos={setCurPos} />

          <MapControls 
            fetchCurLocation={fetchCurLocation} 
            cycleMapType={cycleMapType}
            currentMapType={mapType}
            isLocating={isLocating}
          />

          {geojsonData.length > 0 && geojsonData.map((geoJson, index) => (
            <GeoJSON key={`geojson-${index}`} data={geoJson} />
          ))}

          <FeatureGroup ref={featureGroupRef}>
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

      {/* Success/Error Modal */}
      {showModal && (
        <SuccessModal 
          message={modalMessage} 
          onClose={closeModal} 
          isError={isError} 
        />
      )}
    </div>
  );
};

const MapControls: React.FC<MapControlsProps> = ({ fetchCurLocation, cycleMapType, currentMapType, isLocating }) => {
  const map = useMap();

  const getMapTypeIcon = () => {
    switch (currentMapType) {
      case 'roadmap': return faRoad;
      case 'satellite': return faSatelliteDish;
      case 'hybrid': return faMap;
      case 'terrain': return faLocationArrow;
      default: return faMap;
    }
  };

  const getMapTypeTitle = (): string => {
    return `Current: ${currentMapType.charAt(0).toUpperCase() + currentMapType.slice(1)} - Click to change`;
  };

  useEffect(() => {
    const customControl = L.control({ position: 'topright' });

    customControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.style.backgroundColor = 'white';
      div.style.padding = '5px';
      div.style.cursor = 'pointer';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.alignItems = 'center';
      div.style.gap = '2px';

      const root = createRoot(div);
      root.render(
        <>
          <button 
            className={`map-button ${isLocating ? 'animate-spin' : ''}`} 
            onClick={fetchCurLocation} 
            title="Get Current Location"
            disabled={isLocating}
            style={{ padding: '8px', margin: '2px', border: 'none', background: 'none' }}
          >
            <FontAwesomeIcon icon={faLocationArrow} size="lg" />
          </button>
          <button 
            className="map-button" 
            onClick={cycleMapType} 
            title={getMapTypeTitle()}
            style={{ padding: '8px', margin: '2px', border: 'none', background: 'none' }}
          >
            <FontAwesomeIcon icon={getMapTypeIcon()} size="lg" />
          </button>
        </>
      );
      return div;
    };

    customControl.addTo(map);
    return () => {
      map.removeControl(customControl);
    };
  }, [map, fetchCurLocation, cycleMapType, currentMapType, isLocating]);

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
      placeholder: 'Search places...',
      position: 'topright',
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

export default FarmMap;