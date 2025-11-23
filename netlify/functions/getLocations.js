const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const token = process.env.LOCATION_AIRTABLE_API;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.LOCATION_AIRTABLE_TABLE_NAME;
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    const response = await axios.get(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName || '')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        records: response.data.records,
        mapsApiKey: mapsApiKey || ''
      })
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};