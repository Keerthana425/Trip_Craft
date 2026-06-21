import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.warn('WARNING: Gemini API Key is not set or is using placeholder value. Using mock fallback generators.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// HELPER: Calculate duration in days
const getDurationDays = (start, end) => {
  const diffTime = Math.abs(new Date(end) - new Date(start));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// FEATURE 1: Generate AI Itinerary
export const generateItineraryService = async (tripDetails) => {
  const { destination, startDate, endDate, budget, travelers, travelStyle, foodPreferences } = tripDetails;
  const daysCount = getDurationDays(startDate, endDate);
  const genAI = getGeminiClient();

  if (!genAI) {
    return generateMockItinerary(destination, daysCount, budget, travelStyle);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a professional travel planner and full-service concierge agent. Your task is to generate a comprehensive, structured day-wise itinerary for a trip to:
Destination: ${destination}
Duration: ${daysCount} days (From ${startDate} to ${endDate})
Budget Limit: $${budget} (USD)
Travelers: ${travelers} pax
Travel Style: ${travelStyle}
Food Preferences: ${foodPreferences}

Provide a JSON object strictly matching this schema:
{
  "summary": "overall description of the trip",
  "days": [
    {
      "day": 1,
      "morning": [
        { "title": "Activity Title", "location": "Location Name, Area", "desc": "Detailed description of what to do" }
      ],
      "afternoon": [
        { "title": "Activity Title", "location": "Location Name, Area", "desc": "Detailed description of what to do" }
      ],
      "evening": [
        { "title": "Activity Title", "location": "Location Name, Area", "desc": "Detailed description of what to do" }
      ],
      "restaurants": [
        { "name": "Restaurant Name", "type": "Style/dietary suitability, e.g. Vegetarian friendly ramen" }
      ],
      "budget": estimated cost in USD for this day (number)
    }
  ],
  "tips": [
    "General travel tip, custom rules, safety guidelines, emergency contacts"
  ]
}

Response MUST be a raw JSON object only. Do NOT warp in markdown code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Itinerary Generation Error:', error.message);
    return generateMockItinerary(destination, daysCount, budget, travelStyle);
  }
};

// FEATURE 2: Conversational AI Travel Assistant
export const chatConciergeService = async (context, chatHistory, userMessage) => {
  const { trip, itinerary, expenses, weather } = context;
  const genAI = getGeminiClient();

  if (!genAI) {
    return "Hello! I am your AI travel consultant. (API Key not loaded, showing mock reply). Based on your trip to Tokyo, I recommend checking out the Senso-ji temple in the morning before crowds arrive, and allocating around $40 for dinner at Tsukiji.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Construct context description
    const contextPrompt = `You are a personal AI travel consultant for a trip. Here is the metadata:
Destination: ${trip.destination}
Duration: From ${trip.startDate.toISOString().split('T')[0]} to ${trip.endDate.toISOString().split('T')[0]}
Travelers: ${trip.travelers} pax, Style: ${trip.travelStyle}, Food: ${trip.foodPreferences}
Budget: $${trip.budget} total.
Logged Expenses: ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}
Active Itinerary Outline: ${JSON.stringify(itinerary ? itinerary.days.map(d => ({ day: d.day, morning: d.morning.map(m=>m.title), afternoon: d.afternoon.map(a=>a.title), evening: d.evening.map(e=>e.title) })) : 'None')}
Current Weather Parameters: ${JSON.stringify(weather || 'Unavailable')}

Maintain a helpful, premium, friendly consultant persona. Answer the user's questions utilizing this metadata. If they ask to add/edit/reorder, remind them they can do it on the timeline screen.

Chat history:
${chatHistory.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}
User: ${userMessage}
Assistant:`;

    const result = await model.generateContent(contextPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Chat Concierge Error:', error.message);
    return "I apologize, but I encountered an error processing your query. Please check your network connection or try again.";
  }
};

// FEATURE 3: Replanning / Re-optimization
export const replanItineraryService = async (tripDetails, currentItinerary, promptText) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return currentItinerary;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a travel editor. You need to adjust the current travel itinerary based on the user's instructions: "${promptText}".
Current Destination: ${tripDetails.destination}
Budget: $${tripDetails.budget}

Current Itinerary:
${JSON.stringify(currentItinerary)}

Modify the itinerary, maintaining the same JSON structure. Return the FULL updated itinerary.
Response MUST be a raw JSON object only. Do NOT wrap in markdown code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Itinerary Replanning Error:', error.message);
    return currentItinerary;
  }
};

// FEATURE 4: Generate Packing Checklist
export const generatePackingListService = async (destination, durationDays, travelStyle) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return generateMockPackingList(travelStyle);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate a customized packing list checklist for a trip to:
Destination: ${destination}
Duration: ${durationDays} days
Travel Style: ${travelStyle}

Provide a JSON object strictly matching this schema:
{
  "items": [
    { "name": "Item name, e.g. Rain Jacket", "category": "Clothing/Electronics/Toiletries/Documents" }
  ]
}

Response MUST be a raw JSON object only. Do NOT wrap in markdown code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Packing List Generation Error:', error.message);
    return generateMockPackingList(travelStyle);
  }
};

// FEATURE 5: Local Recommendations (Customs, Phrases, Emergency)
export const generateLocalGuidelinesService = async (destination) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return generateMockLocalGuidelines(destination);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Provide local recommendations, guidelines, and emergency parameters for:
Destination: ${destination}

Provide a JSON object matching this schema:
{
  "foods": ["Must try food 1", "Must try food 2"],
  "customs": ["Cultural custom/courtesy 1", "Cultural custom 2"],
  "phrases": ["Useful local phrase 1 (Meaning)", "Useful local phrase 2"],
  "safety": ["Safety advice 1", "Safety advice 2"],
  "emergency": ["Police/Ambulance numbers", "Local emergency protocol info"]
}

Response MUST be a raw JSON object only. Do NOT wrap in markdown code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Local Guidelines Error:', error.message);
    return generateMockLocalGuidelines(destination);
  }
};

// --- MOCK FALLBACK DATA GENERATORS ---

function generateMockItinerary(destination, days, budget, style) {
  const mockDays = [];
  for (let i = 1; i <= days; i++) {
    mockDays.push({
      day: i,
      morning: [
        {
          title: `Explore Central ${destination} Sights`,
          location: `${destination} City Center`,
          desc: `Stroll around primary landmarks and get accustomed to the local neighborhood, transit lines, and architectures.`
        }
      ],
      afternoon: [
        {
          title: `Immersive ${style} Activity`,
          location: `${destination} Cultural District`,
          desc: `Indulge in a focused afternoon aligned with your ${style.toLowerCase()} travel style. Discover museum displays or walking tours.`
        }
      ],
      evening: [
        {
          title: `Dinner & Scenic View`,
          location: `Panoramic overlook in ${destination}`,
          desc: `Settle down at a local establishment, enjoy regional recipes, and take photos of the skyline panorama.`
        }
      ],
      restaurants: [
        { name: 'Local Bistro / Diner', type: 'Traditional Cuisine' }
      ],
      budget: Math.round(budget / days * 0.4)
    });
  }

  return {
    summary: `A customized ${style.toLowerCase()} expedition to ${destination} optimized across ${days} days.`,
    days: mockDays,
    tips: [
      'Carry local currency, as smaller merchants might not accept international credit cards.',
      'Utilize standard public transit lines which are efficient and cost-effective.',
      'Check weather reports in the morning to adjust walking parameters.'
    ]
  };
}

function generateMockPackingList(style) {
  return {
    items: [
      { name: 'Passport / Travel Documents', category: 'Documents' },
      { name: 'Credit Cards & Cash', category: 'Documents' },
      { name: 'Mobile Charger & Universal Adapter', category: 'Electronics' },
      { name: 'Comfortable Walking Shoes', category: 'Clothing' },
      { name: 'Toiletries Kit', category: 'Toiletries' },
      { name: style === 'Adventure' ? 'Trekking Jacket' : 'Casual Outerwear', category: 'Clothing' },
      { name: 'First Aid Kit & Prescriptions', category: 'General' }
    ]
  };
}

function generateMockLocalGuidelines(destination) {
  return {
    foods: [
      'Street Vendor Specialties',
      'Local Noodle Dishes',
      'Traditional Pastries'
    ],
    customs: [
      'Tipping is not standard; excellent service is included in the bill.',
      'Always greet shop owners when entering premises.',
      'Be mindful of volume when using public transportation.'
    ],
    phrases: [
      'Hello (Local equivalent)',
      'Thank you (Local equivalent)',
      'Where is the restroom? (Local equivalent)'
    ],
    safety: [
      'Stay alert in crowded tourist areas for petty pickpocketing.',
      'Only utilize licensed taxi systems or ride-sharing applications.'
    ],
    emergency: [
      'Police: 110 / Ambulance: 119',
      'Contact your local consulate in case of document loss.'
    ]
  };
}
