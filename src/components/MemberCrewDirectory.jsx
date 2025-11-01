import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter } from "lucide-react";

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
          throw new Error(
            "Missing Airtable credentials check .env file."
          );
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
          photo: record.fields.Photo?.[0]?.url || "https://via.placeholder.com/400",
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

  // Detailed member view
  if (selectedMember) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <button onClick={() => setSelectedMember(null)}>
            Back to Directory
          </button>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1>{selectedMember.name}</h1>
            <p>{selectedMember.position}</p>
            <p>{selectedMember.bio}</p>
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

        {/* Display data visually - member card view */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crewMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MemberCrewDirectory;
