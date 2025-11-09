import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  X,
  MapPin, 
  ArrowLeft,
  ImageIcon,
  Mail,
  Home
} from "lucide-react";

const LocationDirectory = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch airtable data
    const fetchLocationData = async () => {
      try {
        const response = await axios.get("/.netlify/functions/getLocations");
        // Transform Airtable records to location format
        const transformedData = response.data.records
          .filter((record) => record.fields.Approved === true) // Only show approved locations
          .map((record) => ({
            id: record.id,
            name: record.fields["Location name"] || "",
            photos: record.fields.Photos || [],
            address: record.fields.Address || "",
            city: record.fields.City || "",
            state: record.fields.State || "",
            country: record.fields.Country || "",
            zipCode: record.fields["Zip code"] || "",
            propertyOwner: record.fields["Property owner"] || "",
            propertyType: record.fields["Property type"] || "",
            notes: record.fields.Notes || "",
            approved: record.fields.Approved || false,
            approvedAt: record.fields["Approved at"] || "",
          }));

        setLocations(transformedData);
        setLoading(false);
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
  ];

  // Show locations based on search
  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase());
        location.propertyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPropertyType =
        selectedPropertyTypes.length === 0 ||
        selectedPropertyTypes.includes(location.propertyType);  
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
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
                          className="w-full h-96 object-contain"
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
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                              <svg
                                className="w-6 h-6"
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
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                              <svg
                                className="w-6 h-6"
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
                        <div className="p-4 flex gap-2 overflow-x-auto">
                          {selectedLocation.photos.map((photo, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedCurrentPhotoIndex(idx)}
                              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
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
                    <div className="h-96 flex items-center justify-center bg-gray-100">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Location Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedLocation.name}
                        </h1>
                        {selectedLocation.propertyType && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
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
                          <p className="text-gray-600 font-medium">Address</p>
                          <p className="text-gray-900">
                            {selectedLocation.city && selectedLocation.state
                              ? `${selectedLocation.city}, ${selectedLocation.state}`
                              : "Address not available"}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedLocation.notes && (
                        <div className="pt-4 border-t border-gray-200">
                          <h2 className="text-xl font-semibold mb-3">
                            Description
                          </h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedLocation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact to Book */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Book This Location
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Interested in booking this location? Contact HVFC to
                      inquire about availability and details.
                    </p>
                    <a
                      href="mailto:HVFC@HVFC.org?subject=Location Inquiry: "
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      Contact HVFC
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Directory View
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6 border border-gray-200">
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

            {/* Location card view */}
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
                    {location.propertyType && (
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

            {filteredLocations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No locations found matching your criteria.
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