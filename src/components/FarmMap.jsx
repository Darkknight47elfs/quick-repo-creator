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

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const SuccessModal = ({ message, onClose, isError = false }) => {
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

const FarmMap = ({ farmerId, accessToken, onFarmAdded }) => {
  const [geojsonData, setGeojsonData] = useState([]);
  const [formData, setFormData] = useState({
    rice_type: '',
    water_source: '',
    H_start_date: '',
  });
  const [curPos, setCurPos] = useState([10.648021, 76.549728]);
  const [mapType, setMapType] = useState('hybrid'); 
  const [isLocating, setIsLocating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const featureGroupRef = useRef();
  const mapRef = useRef(null);

  const apiEndpoint = `${API_BASE_URL}/analyze/farms/${farmerId}/`;

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setIsError(false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = (e) => {
    const newFeature = e.layer.toGeoJSON();
    const { id, ...featureWithoutId } = newFeature;
    setGeojsonData((prevData) => [...prevData, featureWithoutId]);
  };

  const handleEdit = (e) => {
    const editedFeatures = Object.values(e.layers._layers).map((layer) => layer.toGeoJSON());
    setGeojsonData(editedFeatures);
  };

  const handleDelete = (e) => {
    const deletedIds = Object.keys(e.layers._layers);
    const remainingFeatures = geojsonData.filter((feature) => !deletedIds.includes(feature.id));
    setGeojsonData(remainingFeatures);
  };

  const handleSubmit = async () => {
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
        farmer_id: parseInt(farmerId),  
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
    } catch (error) {
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

  const fetchCurLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      setModalMessage('Geolocation is not supported by your browser');
      setIsError(true);
      setShowModal(true);
      setIsLocating(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurPos([latitude, longitude]);
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 18);
        }
        
        setIsLocating(false);
      },
      (error) => {
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
  const cycleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const MapController = () => {
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
        <MapContainer center={curPos} zoom={18} style={{ height: '75%', width: '100%' }}>
          <MapController />
          
          {/* Google Maps Layer */}
          <ReactLeafletGoogleLayer
            apiKey={GOOGLE_MAPS_API_KEY}
            type={mapType}
          />

          {/* Bhuvan WMS Layer */}
          <WMSTileLayer
            url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
            layers="cadastral:cadastral_india"
            format="image/png"
            transparent={true}
            opacity={mapType === 'roadmap' ? 0.6 : 0.3}
          />

          {/* Google Places Search */}
          <GooglePlacesAutocomplete setCurPos={setCurPos} />

          {/* Map Controls */}
          <MapControls 
            fetchCurLocation={fetchCurLocation} 
            cycleMapType={cycleMapType}
            currentMapType={mapType}
            isLocating={isLocating}
          />

          {/* Render GeoJSON features */}
          {geojsonData.map((geoJson, index) => (
            <GeoJSON key={index} data={geoJson} />
          ))}

          {/* Drawing controls */}
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

const MapControls = ({ fetchCurLocation, cycleMapType, currentMapType, isLocating }) => {
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

  const getMapTypeTitle = () => {
    return `Current: ${currentMapType.charAt(0).toUpperCase() + currentMapType.slice(1)} - Click to change`;
  };

  useEffect(() => {
    const customControl = L.control({ position: 'topright' });

    customControl.onAdd = () => {
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
    return () => map.removeControl(customControl);
  }, [map, fetchCurLocation, cycleMapType, currentMapType, isLocating]);

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
      placeholder: 'Search places...',
      position: 'topright',
    });

    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map, setCurPos]);

  return null;
};

export default FarmMap;