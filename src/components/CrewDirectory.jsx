import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  X,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Users,
  ExternalLink,
  Briefcase,
  Calendar,
  Star,
  Building,
} from "lucide-react";
import { useOutsetaAuth } from "../hooks/useOutsetaAuth";

// Helper function to create URL-friendly slugs
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

const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const CrewDirectory = () => {
  const { isAuthenticated, loading: authLoading, user } = useOutsetaAuth();
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeMulti = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.flatMap((v) => v.split(",").map((s) => s.trim()));
    }
    return [value];
  };

  useEffect(() => {
    console.log("Auth Status:", { isAuthenticated, authLoading, user });
  }, [isAuthenticated, authLoading, user]);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      if (hash) {
        const member = crewMembers.find((m) => createSlug(m.name) === hash);
        if (member) {
          setSelectedMember(member);
        }
      } else {
        setSelectedMember(null);
      }
    };

    // Check hash on initial load and when it changes
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [crewMembers]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    // Fetch airtable data
    const fetchCrewMembers = async () => {
      try {
        const response = await axios.get("/.netlify/functions/getMembers");
        // Transform Airtable records to hvfc format
        const transformedData = response.data.records.map((record) => ({
          id: record.id,
          name: record.fields.FullName || "",
          photo:
            record.fields["Profile Photo"]?.[0]?.url ||
            "https://via.placeholder.com/400",
          jobTitle: normalizeMulti(record.fields.JobTitle),
          department: normalizeMulti(record.fields.Department),
          county: record.fields.County || "",
          yearsInIndustry: record.fields.YearsInTheIndustry || "",
          unionAffiliation: normalizeMulti(record.fields.UnionAffiliation),
          website: record.fields["Portfolio/IMDBLink"] || "",
          bio: record.fields.Bio || "",
          email: record.fields.Email || "",
          phone: record.fields.Phone || "",
          location: record.fields.Location || "",
          status: record.fields.Status || "Inactive",
        }));

        setCrewMembers(transformedData);
        setLoading(false);

        setTimeout(sendHeightToParent, 100);
        setTimeout(sendHeightToParent, 500);
      } catch (err) {
        console.error("Error fetching from Airtable:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCrewMembers();
  }, [authLoading, isAuthenticated]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  const departmentCategories = [
    {
      name: "Production",
      jobTitles: ["Producer", "UPM", "Production Coordinator", "Secretarie"],
    },
    {
      name: "Assistant Director",
      jobTitles: ["1st AD", "2nd AD", "2nd 2nd AD"],
    },
    {
      name: "Camera",
      jobTitles: ["DP", "Operator", "AC", "Still Photographer"],
    },
    {
      name: "Electric",
      jobTitles: [
        "Gaffer",
        "Best Person",
        "Genny Operator",
        "Dimmer Op",
        "Electric",
      ],
    },
    {
      name: "Grip",
      jobTitles: ["Key Grip", "Dolly Grip", "Grip", "Rigger"],
    },
    {
      name: "Properties",
      jobTitles: ["Prop Master", "Prop", "Armorer", "Food Stylist"],
    },
    {
      name: "Wardrobe/Costumes",
      jobTitles: [
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
      jobTitles: [
        "Production Designer",
        "Art Director",
        "Set Dressing",
        "Scenics",
      ],
    },
    {
      name: "Locations",
      jobTitles: ["Manager", "Assistant Manager", "Scout"],
    },
    {
      name: "Transportation Department",
      jobTitles: ["Captain", "Driver"],
    },
    {
      name: "Hair & Make-Up",
      jobTitles: ["Department Head", "Key"],
    },
    {
      name: "Production Assistant",
      jobTitles: [],
    },
    {
      name: "Actor",
      jobTitles: ["Actor"],
    },
    {
      name: "Background Actor",
      jobTitles: ["Background Actor"],
    },
    {
      name: "Intimacy Coordinator",
      jobTitles: ["Intimacy Coordinator"],
    },
    {
      name: "Casting",
      jobTitles: ["Agencies & Director"],
    },
    {
      name: "Accounting",
      jobTitles: ["Accountant", "Payroll"],
    },
    {
      name: "Post-Production",
      jobTitles: ["Editor", "Colorist", "VFX", "Composer"],
    },
  ];

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    const text = searchTerm.toLowerCase();
    return crewMembers.filter((member) => {
      if (member.status !== "Active") return false;
      const matchesSearch =
        !searchTerm ||
        member.name.toLowerCase().includes(text) ||
        member.location.toLowerCase().includes(text) ||
        member.jobTitle.some((title) => title.toLowerCase().includes(text)) ||
        member.department.some((dept) => dept.toLowerCase().includes(text)) ||
        member.unionAffiliation.some((u) => u.toLowerCase().includes(text));

      const nothingSelected =
        selectedDepartments.length === 0 && selectedJobTitles.length === 0;

      const matchesDepartment =
        selectedDepartments.length > 0 &&
        member.department.some((d) => selectedDepartments.includes(d));

      const matchesJobTitle =
        selectedJobTitles.length > 0 &&
        member.jobTitle.some((t) => selectedJobTitles.includes(t));

      const matchesFilters =
        nothingSelected || matchesDepartment || matchesJobTitle;

      return matchesSearch && matchesFilters;
    });
  }, [crewMembers, searchTerm, selectedDepartments, selectedJobTitles]);

  const scheduleResize = () => {
    setTimeout(sendHeightToParent, 100);
    setTimeout(sendHeightToParent, 400);
  };

  useEffect(scheduleResize, [selectedMember]);
  useEffect(scheduleResize, [showFilterPanel]);
  useEffect(scheduleResize, [filteredMembers.length]);  
  useEffect(() => {
    sendHeightToParent();
    window.addEventListener("resize", sendHeightToParent);
    return () => window.removeEventListener("resize", sendHeightToParent);
  }, []);


  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleDepartment = (department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const toggleJobTitle = (jobTitle) => {
    setSelectedJobTitles((prev) =>
      prev.includes(jobTitle)
        ? prev.filter((j) => j !== jobTitle)
        : [...prev, jobTitle]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartments([]);
    setSelectedJobTitles([]);
  };

  // Handle member selection with hash
  const handleMemberClick = (member) => {
    const slug = createSlug(member.name);
    window.location.hash = slug;
  };

  // Handle back to directory
  const handleBackToDirectory = () => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search
    );
    setSelectedMember(null);
  };

  if (loading || authLoading) {
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
              onClick={handleBackToDirectory}
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
                {/* Member Profile Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        className="w-48 h-48 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {selectedMember.name}
                        </h1>

                        {/* Professional info under name */}
                        <div className="space-y-2">
                          {selectedMember.jobTitle &&
                            selectedMember.jobTitle.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Briefcase className="h-4 w-4" />
                                <div className="flex flex-wrap gap-1">
                                  {selectedMember.jobTitle.map(
                                    (title, index) => (
                                      <span key={index}>
                                        {title}
                                        {index <
                                        selectedMember.jobTitle.length - 1
                                          ? ","
                                          : ""}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {selectedMember.department &&
                            selectedMember.department.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Building className="h-4 w-4" />
                                <div className="flex flex-wrap gap-1">
                                  {selectedMember.department.map(
                                    (dept, index) => (
                                      <span key={index}>
                                        {dept}
                                        {index <
                                        selectedMember.department.length - 1
                                          ? ","
                                          : ""}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {selectedMember.yearsInIndustry && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4" />
                              <span>{selectedMember.yearsInIndustry}</span>
                            </div>
                          )}
                          {selectedMember.unionAffiliation?.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Star className="h-4 w-4" />
                              <span>
                                {selectedMember.unionAffiliation.join(", ")}
                              </span>
                            </div>
                          )}
                          {selectedMember.county && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4" />
                              <span>{selectedMember.county} County</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About / Bio */}
                {selectedMember.bio && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold mb-4">About</h2>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedMember.bio}
                      </p>
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
                      {isAuthenticated ? (
                        // Members see all contact info
                        <>
                          {selectedMember.email && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-slate-600 mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                              </p>
                              <a
                                href={`mailto:${selectedMember.email}`}
                                className="text-blue-600 hover:text-blue-700 text-sm break-all"
                              >
                                {selectedMember.email}
                              </a>
                            </div>
                          )}
                          {selectedMember.phone && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-slate-600 mb-2 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone
                              </p>
                              <a
                                href={`tel:${selectedMember.phone}`}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                {selectedMember.phone}
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        // Non-members users see blurred contact info
                        <>
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
                        </>
                      )}
                    </div>
                    {/* Show "Become a Member" button only to non-members */}
                    {!isAuthenticated && (
                      <a
                        href="https://walrus-aqua-5zw3.squarespace.com/become-a-member"
                        target="_top"
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <Users className="h-4 w-4" />
                        Become a Member
                      </a>
                    )}
                  </div>
                </div>
                {/* Links */}
                {selectedMember.website && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Links</h3>
                      <div className="space-y-2">
                        <a
                          href={
                            selectedMember.website?.startsWith("http")
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
    <div className="min-h-screen bg-white-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, job title, department, or location..."
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
            {(selectedDepartments.length > 0 ||
              selectedJobTitles.length > 0) && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedDepartments.length + selectedJobTitles.length}
              </span>
            )}
          </button>
        </div>

        {/* Selected Filters */}
        {(selectedDepartments.length > 0 || selectedJobTitles.length > 0) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedDepartments.map((dept, idx) => (
              <button
                key={`dept-${idx}`}
                onClick={() => toggleDepartment(dept)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 hover:bg-blue-200"
              >
                {dept}
                <X size={14} />
              </button>
            ))}
            {selectedJobTitles.map((title, idx) => (
              <button
                key={`title-${idx}`}
                onClick={() => toggleJobTitle(title)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2 hover:bg-green-200"
              >
                {title}
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
                    Filter by Department &amp; Job Title
                  </h2>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2 max-h-full md:max-h-[calc(100vh-200px)] overflow-y-auto">
                  {departmentCategories.map((category, catIdx) => (
                    <div
                      key={catIdx}
                      className="border-b border-gray-200 last:border-b-0 pb-2"
                    >
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded px-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(
                              category.name
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleDepartment(category.name);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
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
                        category.jobTitles.length > 0 && (
                          <div className="mt-2 ml-4 space-y-1">
                            {category.jobTitles.map((title, titleIdx) => (
                              <label
                                key={titleIdx}
                                className="flex items-center py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedJobTitles.includes(title)}
                                  onChange={() => toggleJobTitle(title)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                      {expandedCategories[category.name] &&
                        category.jobTitles.length === 0 && (
                          <div className="mt-2 ml-4 text-sm text-gray-500 italic">
                            No specific job titles
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

            {/* Member card view */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="mb-3">
                      {/* Name and department tags in same flex container */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900 flex-shrink-0">
                          {member.name}
                        </h3>

                        {/* Department tag */}
                        {Array.isArray(member.department) &&
                          member.department.length > 0 && (
                            <div className="flex flex-wrap gap-1 flex-shrink">
                              {member.department
                                .slice(0, 2)
                                .map((dept, idx) => (
                                  <span
                                    key={`dept-${idx}`}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs whitespace-nowrap"
                                  >
                                    {dept}
                                  </span>
                                ))}
                              {member.department.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs whitespace-nowrap">
                                  +{member.department.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Job title */}
                      {Array.isArray(member.jobTitle) &&
                        member.jobTitle.length > 0 && (
                          <p className="text-gray-600">
                            {member.jobTitle.join(", ")}
                          </p>
                        )}
                    </div>

                    {/* Additional info */}
                    <div className="space-y-1 text-sm text-gray-500">
                      {member.county && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {member.county} County
                        </div>
                      )}
                      {member.yearsInIndustry && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {member.yearsInIndustry}
                        </div>
                      )}
                      {member.unionAffiliation?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Star size={14} />
                          {member.unionAffiliation.join(", ")}
                        </div>
                      )}
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

export default CrewDirectory;
