import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  X,
  MapPin,
  ArrowLeft,
  Image as ImageIcon,
  Mail,
  Home,
  Grid3x3,
  Map,
} from "lucide-react";

// helpter to send height to parent window
const sendHeightToParent = () => {
  if (window.parent !== window) {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage(
      {
        type: "resize-crew-directory",
        height,
      },
      "*"
    );
  }
};

//Adding comment to test API change
const LocationDirectory = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [mapsApiKey, setMapsApiKey] = useState("");
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const minimapRef = useRef(null);

  useEffect(() => {
    // Fetch airtable data
    const fetchLocationData = async () => {
      try {
        const response = await axios.get("/.netlify/functions/getLocations");

        //Maps API Key
        if (response.data.mapsApiKey) {
          setMapsApiKey(response.data.mapsApiKey);
        }

        // Transform Airtable records to location format
        const transformedData = response.data.records
          .filter((record) => record.fields.Approved === true) // Only show approved locations
          .map((record) => ({
            id: record.id,
            name: record.fields.LocationName || "",
            photos: record.fields.Photos || [],
            address: record.fields.Address || "",
            city: record.fields.City || "",
            state: record.fields.State || "",
            zipCode: record.fields.ZipCode|| "",
            propertyOwner: record.fields.PropertyOwner || "",
            propertyType: record.fields.PropertyType || "",
            description: record.fields.Description || "",
            approved: record.fields.Approved || false,
            approvedAt: record.fields.ApprovedTime || "",
          }));

        setLocations(transformedData);
        setLoading(false);

        setTimeout(sendHeightToParent, 100);
        setTimeout(sendHeightToParent, 500);
      } catch (err) {
        console.error("Error fetching from Airtable:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedCurrentPhotoIndex, setSelectedCurrentPhotoIndex] = useState(0);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const propertyTypes = [
    "Airports",
    "Animals",
    "Bars",
    "Bridges & Tunnels",
    "Cabins",
    "Camps & Retreats",
    "Castles",
    "Caves, Mines & Quarries",
    "Courthouses",
    "Diners",
    "Farms & Barns",
    "Historic exteriors",
    "Homes - Farm Houses",
    "Homes - Modern",
    "Homes - Unique",
    "Ice Cream Stands",
    "Industrial",
    "Motels",
    "Places of Worship",
    "Schools",
    "Sports",
    "Theaters",
    "Town Centers",
    "Trailers Trains",
    "Urban",
    "Vistas",
    "Water",
    "College",
    "Church",
    "Parks",
    "Yacht Clubs",
    "Other"
  ];

  // Show locations based on search
  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      // Normalize property type: handle both array and single string cases
      const locationTypes = Array.isArray(location.propertyType)
        ? location.propertyType.map((t) => t.toLowerCase())
        : [location.propertyType?.toLowerCase() || ""];

      // Filter matches any selected property type (case-insensitive)
      const matchesPropertyType =
        selectedPropertyTypes.length === 0 ||
        selectedPropertyTypes.some((type) =>
          locationTypes.includes(type.toLowerCase())
        );

      // Collate search fields (name, city, state, address, ALL property types)
      const fieldsToSearch = [
        location.name,
        location.city,
        location.state,
        location.address,
        ...(Array.isArray(location.propertyType)
          ? location.propertyType
          : [location.propertyType]),
      ]
        .filter(Boolean)
        .map((field) => field.toLowerCase());

      // Search matches if any field contains the term
      const matchesSearch =
        searchTerm === "" ||
        fieldsToSearch.some((field) =>
          field.includes(searchTerm.toLowerCase())
        );

      return matchesSearch && matchesPropertyType;
    });
  }, [locations, searchTerm, selectedPropertyTypes]);

  const togglePropertyType = (type) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPropertyTypes([]);
  };

  const getFullAddress = (location) => {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.zipCode,
      "United States",
    ].filter(Boolean);
    return parts.join(", ");
  };

const [locationCoords, setLocationCoords] = useState({});
const [isGeocoding, setIsGeocoding] = useState(false);
const [mapsScriptLoaded, setMapsScriptLoaded] = useState(false);

// Separate effect for geocoding all locations once
useEffect(() => {
  if (!mapsApiKey || locations.length === 0 || isGeocoding) return;

  const geocodeAllLocations = async () => {
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    const newCoords = { ...locationCoords };
    let hasNewCoords = false;

    for (const location of locations) {
      // Skip if already geocoded
      if (newCoords[location.id]) continue;

      try {
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode(
            { address: getFullAddress(location) },
            (results, status) => {
              if (status === "OK") resolve(results[0]);
              else reject(status);
            }
          );
        });
        newCoords[location.id] = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
        };
        hasNewCoords = true;
        // Small delay to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Failed to geocode ${location.name}:`, err);
      }
    }

    if (hasNewCoords) {
      setLocationCoords(newCoords);
    }
    setIsGeocoding(false);
  };

  // Load Google Maps script if not loaded
  if (!window.google) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    script.onload = () => {
      setMapsScriptLoaded(true);
      geocodeAllLocations();
    };
  } else {
    setMapsScriptLoaded(true);
    geocodeAllLocations();
  }
}, [mapsApiKey, locations, isGeocoding, locationCoords]);

// Rendering map with markers
useEffect(() => {
  if (!mapsApiKey || viewMode !== "map" || !mapRef.current || !mapsScriptLoaded)
    return;

  let isMounted = true;

  const initMap = () => {
    if (!isMounted) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create a new map instance when entering map view
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: { lat: 41.8, lng: -74.0 },
    });

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    // Add markers for filtered locations that have coordinates
    for (const location of filteredLocations) {
      const coords = locationCoords[location.id];
      if (!coords) continue;

      const marker = new window.google.maps.Marker({
        position: coords,
        map: googleMapRef.current,
        title: location.name,
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener("click", () => setHoveredLocation(location));
      markersRef.current.push(marker);
      bounds.extend(coords);
      hasMarkers = true;
    }

    if (hasMarkers) {
      googleMapRef.current.fitBounds(bounds);
    }
  };

  initMap();

  return () => {
    isMounted = false;
    // Clean up markers and nullify map reference
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    googleMapRef.current = null;
  };
}, [mapsApiKey, viewMode, filteredLocations, locationCoords, mapsScriptLoaded, selectedLocation]);

const scheduleResize = () => {
  setTimeout(sendHeightToParent, 100);
  setTimeout(sendHeightToParent, 400);
  setTimeout(sendHeightToParent, 900);
};

useEffect(scheduleResize, [selectedLocation]);
useEffect(scheduleResize, [showFilterPanel]);
useEffect(scheduleResize, [filteredLocations.length]);
useEffect(scheduleResize, [viewMode]);

useEffect(() => {
  sendHeightToParent();
  window.addEventListener("resize", sendHeightToParent);
  return () => window.removeEventListener("resize", sendHeightToParent);
}, []);

useEffect(() => {
  if (viewMode === "map") {
    setTimeout(sendHeightToParent, 600);
    setTimeout(sendHeightToParent, 1200);
  }
}, [viewMode, mapsScriptLoaded, filteredLocations.length]);


    useEffect(() => {
    if (
      !selectedLocation ||
      !mapsApiKey ||
      !locationCoords[selectedLocation.id] ||
      !minimapRef.current ||
      !window.google
    )
      return;

    // Create minimap centered on this location
    const coords = locationCoords[selectedLocation.id];
    const minimapElement = minimapRef.current; // Copy ref to a local variable
    const minimap = new window.google.maps.Map(minimapElement, {
      center: coords,
      zoom: 16,
      disableDefaultUI: true,
    });

    new window.google.maps.Marker({
      position: coords,
      map: minimap,
      title: selectedLocation.name,
      animation: window.google.maps.Animation.DROP,
    });

    return () => {
      if (minimapElement) {
        minimapElement.innerHTML = "";
      }
    };
  }, [selectedLocation, mapsApiKey, locationCoords]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // Detailed location view
  if (selectedLocation) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <button
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
              onClick={() => {
                setSelectedLocation(null);
                setSelectedCurrentPhotoIndex(0);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="py-4 sm:py-8 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Location card Photo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {selectedLocation.photos &&
                  selectedLocation.photos.length > 0 ? (
                    <div>
                      <div className="relative bg-gray-900">
                        <img
                          src={
                            selectedLocation.photos[selectedCurrentPhotoIndex]
                              ?.url ||
                            selectedLocation.photos[selectedCurrentPhotoIndex]
                          }
                          alt={`${selectedLocation.name}`}
                          className="w-full h-64 sm:h-80 lg:h-96 object-contain"
                        />
                        {selectedLocation.photos.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setSelectedCurrentPhotoIndex((prev) =>
                                  prev === 0
                                    ? selectedLocation.photos.length - 1
                                    : prev - 1
                                )
                              }
                              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg"
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() =>
                                setSelectedCurrentPhotoIndex((prev) =>
                                  prev === selectedLocation.photos.length - 1
                                    ? 0
                                    : prev + 1
                                )
                              }
                              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg"
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                      {selectedLocation.photos.length > 1 && (
                        <div className="p-3 sm:p-4 flex gap-2 overflow-x-auto">
                          {selectedLocation.photos.map((photo, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedCurrentPhotoIndex(idx)}
                              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border-2 overflow-hidden ${
                                idx === selectedCurrentPhotoIndex
                                  ? "border-blue-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <img
                                src={photo?.url || photo}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center bg-gray-100">
                      <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Location Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          {selectedLocation.name}
                        </h1>
                        {selectedLocation.propertyType &&
                        Array.isArray(selectedLocation.propertyType) ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedLocation.propertyType.map((type, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-600 text-white"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-600 text-white">
                            {selectedLocation.propertyType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm sm:text-base text-gray-900">
                            {selectedLocation.city && selectedLocation.state
                              ? `${selectedLocation.city}, ${selectedLocation.state}`
                              : "Address not available"}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedLocation.description && (
                        <div className="pt-4 border-t border-gray-200">
                          <h2 className="text-lg sm:text-xl font-semibold mb-3">
                            Description
                          </h2>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedLocation.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Contact to Book */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                      Book This Location
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                      Interested in booking this location? Contact Hudson Valley Film Commission to
                      inquire about availability and details.
                    </p>
                    <a
                      href="mailto:info@hudsonvalleyfilmcommission.org?subject=Location Inquiry: "
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      <Mail className="h-4 w-4" />
                      Contact HVFC
                    </a>
                  </div>
                </div>

                {/* Map */}
                {/* {mapsApiKey &&
                  (selectedLocation.address || selectedLocation.city) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Location Map
                        </h3>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(
                              getFullAddress(selectedLocation)
                            )}`}
                            allowFullScreen
                            title="Location Map"
                          />
                        </div>
                      </div>
                    </div>
                  )} */}
                {mapsApiKey && locationCoords[selectedLocation.id] && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold mb-3">
                        Location Map
                      </h3>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          ref={minimapRef}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Directory View
  return (
    <div className="min-h-screen bg-white-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, city, state, or property type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Filter button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              showFilterPanel
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={20} />
            Filters
            {selectedPropertyTypes.length > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedPropertyTypes.length}
              </span>
            )}
          </button>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3x3 size={18} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Map size={18} />
              Map
            </button>
          </div>
        </div>

        {/* Selected Filters */}
        {selectedPropertyTypes.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedPropertyTypes.map((type, idx) => (
              <button
                key={idx}
                onClick={() => togglePropertyType(type)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 hover:bg-blue-200"
              >
                {type}
                <X size={14} />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="fixed inset-0 z-50 bg-white md:static md:w-80 md:flex-shrink-0">
              <div className="h-full overflow-y-auto md:h-auto md:overflow-visible bg-white md:bg-transparent rounded-none md:rounded-lg shadow-none md:shadow-s p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filter by Property Type
                  </h2>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {propertyTypes.map((type, idx) => (
                    <label
                      key={idx}
                      className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPropertyTypes.includes(type)}
                        onChange={() => togglePropertyType(type)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                  {propertyTypes.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No property types available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              Showing {filteredLocations.length} location
              {filteredLocations.length === 1 ? "" : "s"}
            </div>

            {/* Map View */}
            {viewMode === "map" && mapsApiKey && (
              <div className="relative h-[600px]">
                <div ref={mapRef} className="absolute inset-0" />

                {/* Card Overlay */}
                {hoveredLocation && (
                  <div className="absolute bottom-4 right-4 w-11/12 sm:w-96 z-10 pointer-events-none">
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto">
                      <button
                        onClick={() => setHoveredLocation(null)}
                        className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div
                        onClick={() => {
                          setSelectedLocation(hoveredLocation);
                          setSelectedCurrentPhotoIndex(0);
                          setHoveredLocation(null);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          {hoveredLocation.photos &&
                          hoveredLocation.photos.length > 0 ? (
                            <img
                              src={
                                hoveredLocation.photos[0]?.url ||
                                hoveredLocation.photos[0]
                              }
                              alt={hoveredLocation.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          {hoveredLocation.photos &&
                            hoveredLocation.photos.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <ImageIcon size={12} />
                                {hoveredLocation.photos.length}
                              </div>
                            )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {hoveredLocation.name}
                          </h3>
                          {hoveredLocation.propertyType &&
                            (Array.isArray(hoveredLocation.propertyType) ? (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {hoveredLocation.propertyType.map(
                                  (type, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                                    >
                                      {type}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-2">
                                {hoveredLocation.propertyType}
                              </span>
                            ))}
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                            <MapPin
                              size={16}
                              className="flex-shrink-0 mt-0.5"
                            />
                            <span>
                              {hoveredLocation.city && hoveredLocation.state
                                ? `${hoveredLocation.city}, ${hoveredLocation.state}`
                                : "Location not available"}
                            </span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            Click to view details →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location card view */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {location.photos && location.photos.length > 0 ? (
                        <img
                          src={location.photos[0]?.url || location.photos[0]}
                          alt={location.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {location.photos && location.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <ImageIcon size={12} />
                          {location.photos.length}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {location.name}
                      </h3>
                      {location.propertyType &&
                      Array.isArray(location.propertyType) ? (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {location.propertyType.map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-3">
                          {location.propertyType}
                        </span>
                      )}

                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {location.city && location.state
                            ? `${location.city}, ${location.state}`
                            : "Location not available"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredLocations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm.trim()
                    ? "No locations found matching your search."
                    : "No locations available."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDirectory;