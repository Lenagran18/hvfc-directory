import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Filter, X, MapPin, Mail, Phone, ArrowLeft, Users, ExternalLink } from "lucide-react";

const MemberCrewDirectory = () => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch airtable data
    const fetchCrewMembers = async () => {
      try {
       const response = await axios.get("/.netlify/functions/getMembers");
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
          //TO DO: add all fields from hvfc
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

  //Detailed member view
  if (selectedMember) {
    return (
      <div>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSelectedMember(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Member Profile Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        className="w-48 h-48 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold text-gray-900">
                            {selectedMember.name}
                          </h1>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                            {selectedMember.position}
                          </span>
                        </div>
                        {selectedMember.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {selectedMember.location}
                          </div>
                        )}
                        <p className="text-slate-700 leading-relaxed mt-4">
                          {selectedMember.bio || "No bio available."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TO DO: What info to show here? will need to replace texts */}
                {/* About */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">About</h2>
                    <p className="text-slate-700 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                </div>

                {/* Skills & Specialties */}
                {selectedMember.specialties &&
                  selectedMember.specialties.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">
                          Skills & Specialties
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.specialties.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-slate-100 text-slate-900"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-slate-600 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </p>
                        <p className="text-slate-400 blur-sm select-none text-sm">
                          member@email.com
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                          <em>Members only</em>
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-slate-600 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </p>
                        <p className="text-slate-400 blur-sm select-none text-sm">
                          (555) 555-5555
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                          <em>Members only</em>
                        </p>
                      </div>
                    </div>
                    {/* Become a member button TO DO: link will need to change */}
                    <a
                      href="https://https://walrus-aqua-5zw3.squarespace.com/become-a-member"
                      target="_parent"
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      <Users className="h-4 w-4" />
                      Become a Member
                    </a>
                  </div>
                </div>
                {/* Links */}
                {selectedMember.website && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Links</h3>
                      <div className="space-y-2">
                        <a
                          href={selectedMember.website?.startsWith('http')
                            ? selectedMember.website
                            : `https://${selectedMember.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </a>
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
