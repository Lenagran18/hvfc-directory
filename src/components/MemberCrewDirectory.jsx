import React, { useEffect, useState } from "react";
import axios from "axios";

const MemberCrewDirectory = () => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCrewMembers = async () => {
      try {
        const token = process.env.REACT_APP_AIRTABLE_API;
        const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;
        const tableName = process.env.REACT_APP_AIRTABLE_TABLE_NAME;

        if (!token || !baseId) {
          throw new Error(
            "Missing Airtable credentials check .env file."
          );
        }

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

        // Transform Airtable records to our format
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

{/* show members */}
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>User Data</h1>
      <pre>{JSON.stringify(crewMembers, null, 2)}</pre>
    </div>
);
}
export default MemberCrewDirectory;
