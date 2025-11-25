import { GoogleGenAI } from "@google/genai";
import { IcaoResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAirportCoordinates = async (icaoCode: string): Promise<IcaoResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the precise latitude and longitude, official name, and city for the airport with ICAO code "${icaoCode}". 
      If the ICAO code matches a small airfield (like SDVH or SBBP in Brazil, or others globally), ensure the coordinates are for that specific location.
      If the input looks like a city name, search for the main airport in that city.
      
      Return the data in the following JSON format inside a code block:
      \`\`\`json
      {
        "lat": 12.3456,
        "lng": -65.4321,
        "name": "Airport Official Name",
        "city": "City Name"
      }
      \`\`\`
      `,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return null;

    // Extract JSON from the response text (it might be wrapped in ```json ... ```)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0];
      const data = JSON.parse(jsonString) as IcaoResponse;
      // Basic validation
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        return data;
      }
    }
    
    console.warn("Could not parse airport data from response:", text);
    return null;
  } catch (error) {
    console.error("Failed to fetch airport data", error);
    return null;
  }
};