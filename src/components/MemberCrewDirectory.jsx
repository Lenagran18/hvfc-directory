import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Filter, X, MapPin, Mail, Phone, Globe } from "lucide-react";

const MemberCrewDirectory = () => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch airtable data
    const fetchCrewMembers = async () => {
      try {
        // Airtable API credentials from .env
        const token = process.env.REACT_APP_AIRTABLE_API;
        const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;
        const tableName = process.env.REACT_APP_AIRTABLE_TABLE_NAME;

        if (!token || !baseId) {
          throw new Error("Missing Airtable credentials check .env file.");
        }
        // Fetch data from Airtable
        const response = await axios.get(
          `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
            tableName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Transform Airtable records to hvfc format
        const transformedData = response.data.records.map((record) => ({
          id: record.id,
          name: record.fields.Name || "",
          photo:
            record.fields.Photo?.[0]?.url || "https://via.placeholder.com/400",
          position: record.fields.Position || "",
          specialties: record.fields.Specialties || [],
          bio: record.fields.Bio || "",
          email: record.fields.Email || "",
          phone: record.fields.Phone || "",
          website: record.fields.Website || "",
          location: record.fields.Location || "",
        }));

        setCrewMembers(transformedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching from Airtable:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCrewMembers();
  }, []);

  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const departmentCategories = [
    {
      name: "Production",
      roles: ["Producers", "UPMs", "Production Coordinators", "Secretaries"],
    },
    {
      name: "Assistant Directors",
      roles: ["1st ADs", "2nd ADs", "2nd 2nd ADs"],
    },
    {
      name: "Camera",
      roles: ["DPs", "Operators", "ACs", "Still Photographers"],
    },
    {
      name: "Electric",
      roles: [
        "Gaffers",
        "Best Person",
        "Genny Operators",
        "Dimmer Ops",
        "Electrics",
      ],
    },
    {
      name: "Grip",
      roles: ["Key Grips", "Dolly Grips", "Grips", "Riggers"],
    },
    {
      name: "Properties",
      roles: ["Prop Masters", "Props", "Armorers", "Food Stylists"],
    },
    {
      name: "Wardrobe/Costumes",
      roles: [
        "Designer",
        "Assistant Designer",
        "Wardrobe Supervisor",
        "Set Costumer",
        "Stylist",
        "Shopper",
        "Costume Coordinator",
        "PA",
        "Tailor",
      ],
    },
    {
      name: "Art Department",
      roles: [
        "Production Designers",
        "Art Directors",
        "Set Dressing",
        "Scenics",
      ],
    },
    {
      name: "Locations",
      roles: ["Managers", "Assistant Managers", "Scouts"],
    },
    {
      name: "Transportation Department",
      roles: ["Captain", "Drivers"],
    },
    {
      name: "Hair & Make-Up",
      roles: ["Department Heads", "Keys"],
    },
    {
      name: "Production Assistants",
      roles: [],
    },
    {
      name: "Casting",
      roles: ["Agencies & Directors"],
    },
    {
      name: "Accounting",
      roles: ["Accountants", "Payroll"],
    },
    {
      name: "Post-Production",
      roles: ["Editors", "Colorists", "VFX", "Composers"],
    },
  ];

  // Show members based on search
  const filteredMembers = useMemo(() => {
    return crewMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialties =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some((spec) => member.specialties.includes(spec));

      return matchesSearch && matchesSpecialties;
    });
  }, [crewMembers, searchTerm, selectedSpecialties]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialties([]);
  };

  // Detailed member view
  if (selectedMember) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedMember(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
          </button>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <img
                  alt={selectedMember.name}
                  src={selectedMember.photo}
                  className="w-48 h-48 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedMember.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    {selectedMember.position}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedMember.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                      >
                        <Mail size={18} />
                        {selectedMember.email}
                      </a>
                    )}

                    {selectedMember.phone && (
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                      >
                        <Phone size={18} />
                        {selectedMember.phone}
                      </a>
                    )}

                    {selectedMember.website && (
                      <a
                        href={selectedMember.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                      >
                        <Globe size={18} />
                        {selectedMember.website}
                      </a>
                    )}

                    {selectedMember.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={18} />
                        {selectedMember.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Bio
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {selectedMember.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Crew Directory Grid View
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Crew Directory
        </h1>

        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, position, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
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
            {selectedSpecialties.length > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedSpecialties.length}
              </span>
            )}
          </button>
        </div>
        {/* Selected Filters */}
        {selectedSpecialties.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedSpecialties.map((spec, idx) => (
              <button
                key={idx}
                onClick={() => toggleSpecialty(spec)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 hover:bg-blue-200"
              >
                {spec}
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
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filter by Specialty
                  </h2>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {departmentCategories.map((category, catIdx) => (
                    <div
                      key={catIdx}
                      className="border-b border-gray-200 last:border-b-0 pb-2"
                    >
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded px-2"
                      >
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedCategories[category.name]
                              ? "rotate-180"
                              : ""
                          }`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>

                      {expandedCategories[category.name] &&
                        category.roles.length > 0 && (
                          <div className="mt-2 ml-4 space-y-1">
                            {category.roles.map((role, roleIdx) => (
                              <label
                                key={roleIdx}
                                className="flex items-center py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSpecialties.includes(role)}
                                  onChange={() => toggleSpecialty(role)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {role}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                      {expandedCategories[category.name] &&
                        category.roles.length === 0 && (
                          <div className="mt-2 ml-4 text-sm text-gray-500 italic">
                            No specific roles
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              Showing {filteredMembers.length} crew{" "}
              {filteredMembers.length === 1 ? "member" : "members"}
            </div>

            {/* Display data visually - member card view */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{member.position}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.specialties.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                      {member.specialties.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{member.specialties.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      {member.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No crew members found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCrewDirectory;
