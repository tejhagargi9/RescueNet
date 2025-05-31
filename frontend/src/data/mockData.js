// src/data/mockData.js
import { nanoid } from 'nanoid';

// Helper function to generate random coordinates
const getRandomCoordinates = (latMin = 18, latMax = 22, lonMin = 72, lonMax = 76) => ({ // Default: Approx Maharashtra
  latitude: parseFloat((Math.random() * (latMax - latMin) + latMin).toFixed(6)),
  longitude: parseFloat((Math.random() * (lonMax - lonMin) + lonMin).toFixed(6)),
});

// Coordinates for Belgaum City and surrounding areas
// Belgaum city center: ~15.8522° N, 74.5000° E
const getBelgaumCoordinates = (radiusKm = 15) => {
  const centerLat = 15.8522;
  const centerLon = 74.5000;
  const kmInDegree = 111.32; // Approximate km per degree

  const latOffset = (Math.random() * 2 - 1) * (radiusKm / kmInDegree);
  const lonOffset = (Math.random() * 2 - 1) * (radiusKm / (kmInDegree * Math.cos(centerLat * Math.PI / 180)));

  return {
    latitude: parseFloat((centerLat + latOffset).toFixed(6)),
    longitude: parseFloat((centerLon + lonOffset).toFixed(6)),
  };
};

const getRandomTimestamp = (daysAgoMax = 10, hoursAgoMax = 24) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgoMax));
  date.setHours(date.getHours() - Math.floor(Math.random() * hoursAgoMax));
  return date.toISOString();
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const sosMessages = [
  "Urgent help needed! Building partially collapsed, people trapped!",
  "SOS! Flash flood in our area, water rising rapidly. Stranded with family.",
  "Medical emergency! Severe injury, requires immediate evacuation.",
  "Fire breakout in residential complex, smoke everywhere. We need rescue.",
  "Landslide has blocked the main road, village cut off. Requesting aid.",
  "Group of hikers lost in forest area, no food or water.",
  "Vehicle accident on highway, multiple injuries reported.",
  "Power lines down and sparking, hazardous situation.",
  "Chemical spill reported near factory, strong fumes.",
  "Elderly person collapsed, unresponsive. Needs medical team fast.",
];

const dangerMessages = [
  "Bridge structure looks unstable, large cracks visible.",
  "Gas leak suspected in residential street.",
  "Fallen high-voltage power line on road.",
  "Wild animal sighting in populated area, causing panic.",
  "Unexploded ordnance found near construction site.",
  "Sinkhole appeared on main road, traffic hazard.",
];

const foodMessages = [
  "Community kitchen set up at town hall, serving hot meals.",
  "Requesting baby food and formula for infants shelter.",
  "Water purification tablets urgently needed for 100 families.",
  "Food supplies running low at relief camp Alpha.",
  "Distribution of food packets happening at school grounds.",
];

const shelterMessages = [
  "Temporary shelter opened at community sports complex.",
  "Need for blankets and warm clothing at XYZ shelter.",
  "Capacity reached at current shelter, new location needed.",
  "Evacuees seeking shelter, please guide to nearest safe zone.",
];

const missingMessages = [
  "Searching for Mr. Ramesh Kumar, 65, last seen near market.",
  "Child separated from parents during evacuation, wearing blue shirt.",
  "Lost contact with family member after the earthquake.",
];

const otherMessages = [
  "Road clearing operations underway on NH48.",
  "Communication lines are down in several areas.",
  "Volunteers needed for debris clearance.",
  "Requesting information about rescue team progress.",
];

const cities = [
  "Mumbai Central", "Pune Station", "Mumbai Suburb", "Nashik Hills", "Thane", "Nagpur", "Aurangabad", "Navi Mumbai", "Jalgaon",
  "Belgaum City", "Tilakwadi (Belgaum)", "Shahapur (Belgaum)", "Vadgaon (Belgaum)", "Udyambag (Belgaum)", "Hindwadi (Belgaum)", "Khanapur (Near Belgaum)", "Sankeshwar (Near Belgaum)"
];

export const MOCK_REPORTS_INITIAL = [
  // === Belgaum Specific SOS Alerts ===
  { _id: nanoid(), ...getBelgaumCoordinates(2), message: sample(sosMessages) + " Near Fort Lake.", filter: 'sos', timestamp: getRandomTimestamp(0, 12), people_affected: randomInt(5, 15), severity: 5, city: "Belgaum City" },
  { _id: nanoid(), ...getBelgaumCoordinates(5), message: "Heavy rains caused wall collapse in Shahapur area. 3 injured.", filter: 'sos', timestamp: getRandomTimestamp(1, 24), people_affected: 3, severity: 4, city: "Shahapur (Belgaum)" },
  { _id: nanoid(), ...getBelgaumCoordinates(1), message: "SOS! Child fallen into open drain near Central Bus Stand.", filter: 'sos', timestamp: getRandomTimestamp(0, 2), people_affected: 1, severity: 5, city: "Belgaum CBS" },
  { _id: nanoid(), ...getBelgaumCoordinates(8), message: "Urgent medical aid required for accident victims on Pune-Bangalore highway near Belgaum bypass.", filter: 'sos', timestamp: getRandomTimestamp(0, 6), people_affected: randomInt(2, 4), severity: 4, city: "Belgaum Bypass" },
  { _id: nanoid(), ...getBelgaumCoordinates(3), message: "Fire in Udyambag industrial unit. Requesting fire tenders immediately.", filter: 'sos', timestamp: getRandomTimestamp(1, 5), people_affected: randomInt(0, 10), severity: 5, city: "Udyambag (Belgaum)" },

  // === Other Belgaum Reports ===
  { _id: nanoid(), ...getBelgaumCoordinates(1), message: "Water logging reported in Tilakwadi main roads.", filter: 'danger', timestamp: getRandomTimestamp(0, 8), city: "Tilakwadi (Belgaum)" },
  { _id: nanoid(), ...getBelgaumCoordinates(4), message: "Food and essentials being distributed at Maratha Mandal College.", filter: 'food', timestamp: getRandomTimestamp(1, 10), city: "Belgaum City" },
  { _id: nanoid(), ...getBelgaumCoordinates(2), message: "Temporary shelter available at GIT College campus.", filter: 'shelter', timestamp: getRandomTimestamp(0, 20), city: "Belgaum GIT Campus" },
  { _id: nanoid(), ...getBelgaumCoordinates(6), message: "Searching for Ashok Desai, last seen near Hindwadi market.", filter: 'missing', timestamp: getRandomTimestamp(2, 48), city: "Hindwadi (Belgaum)" },
  { _id: nanoid(), ...getBelgaumCoordinates(3), message: "Traffic diversion due to fallen tree on College Road.", filter: 'other', timestamp: getRandomTimestamp(0, 3), city: "Belgaum College Road" },
  { _id: nanoid(), ...getBelgaumCoordinates(10), message: "Request for drinking water supply in Yellur village.", filter: 'food', timestamp: getRandomTimestamp(1, 24), people_affected: randomInt(50, 200), severity: 3, city: "Yellur (Near Belgaum)" },
  { _id: nanoid(), ...getBelgaumCoordinates(12), message: "Minor landslide near Kakati, road partially blocked.", filter: 'danger', timestamp: getRandomTimestamp(2, 30), city: "Kakati (Near Belgaum)" },

  // === General SOS Alerts (More Data) ===
  { _id: nanoid(), ...getRandomCoordinates(19.0, 19.1, 72.8, 72.9), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(2), people_affected: randomInt(1, 20), severity: randomInt(3, 5), city: "Mumbai Central" },
  { _id: nanoid(), ...getRandomCoordinates(18.5, 18.6, 73.8, 73.9), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(1), people_affected: randomInt(1, 5), severity: randomInt(2, 4), city: "Pune Station Area" },
  { _id: nanoid(), ...getRandomCoordinates(19.0, 19.1, 72.8, 72.9), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(0), people_affected: randomInt(2, 8), severity: 5, city: "Mumbai Suburb Near River" },
  { _id: nanoid(), ...getRandomCoordinates(18.5, 18.6, 73.8, 73.9), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(1), people_affected: randomInt(1, 10), severity: 4, city: "Pune Residential Zone" },
  { _id: nanoid(), ...getRandomCoordinates(19.0, 19.1, 72.8, 72.9), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(0), people_affected: 1, severity: 3, city: "Mumbai Construction Site" },
  { _id: nanoid(), ...getRandomCoordinates(20.0, 20.1, 74.0, 74.1), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(3), people_affected: randomInt(10, 30), severity: 5, city: "Nashik Hills" },
  { _id: nanoid(), ...getRandomCoordinates(17.0, 17.5, 74.0, 74.5), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(0, 5), people_affected: randomInt(3, 7), severity: 4, city: "Satara Region" },
  { _id: nanoid(), ...getRandomCoordinates(21.0, 21.5, 79.0, 79.5), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(1, 6), people_affected: randomInt(2, 12), severity: 5, city: "Nagpur Outskirts" },
  { _id: nanoid(), ...getRandomCoordinates(16.7, 16.9, 74.2, 74.4), message: sample(sosMessages), filter: 'sos', timestamp: getRandomTimestamp(2, 7), people_affected: randomInt(5, 15), severity: 4, city: "Kolhapur City" },

  // === General Other Reports (More Data) ===
  { _id: nanoid(), ...getRandomCoordinates(), message: sample(dangerMessages), filter: 'danger', timestamp: getRandomTimestamp(3), city: "Thane" },
  { _id: nanoid(), ...getRandomCoordinates(), message: sample(foodMessages), filter: 'food', timestamp: getRandomTimestamp(1), city: "Nagpur" },
  { _id: nanoid(), ...getRandomCoordinates(), message: sample(shelterMessages), filter: 'shelter', timestamp: getRandomTimestamp(2), city: "Aurangabad" },
  { _id: nanoid(), ...getRandomCoordinates(), message: sample(missingMessages), filter: 'missing', timestamp: getRandomTimestamp(4), city: "Mumbai Local Market" },
  { _id: nanoid(), ...getRandomCoordinates(), message: sample(otherMessages), filter: 'other', timestamp: getRandomTimestamp(0), city: "Navi Mumbai" },
  { _id: nanoid(), ...getRandomCoordinates(19.2, 19.3, 72.9, 73.0), message: sample(dangerMessages), filter: 'danger', timestamp: getRandomTimestamp(0), city: "Mumbai Industrial Area" },
  { _id: nanoid(), ...getRandomCoordinates(21.0, 21.1, 75.0, 75.1), message: sample(foodMessages), filter: 'food', timestamp: getRandomTimestamp(1), city: "Jalgaon Village" },
  { _id: nanoid(), ...getRandomCoordinates(18.0, 18.3, 75.0, 75.3), message: sample(shelterMessages), filter: 'shelter', timestamp: getRandomTimestamp(1, 8), city: "Solapur Camp" },
  { _id: nanoid(), ...getRandomCoordinates(19.8, 20.0, 75.2, 75.4), message: sample(missingMessages), filter: 'missing', timestamp: getRandomTimestamp(5, 120), city: "Beed District" },
  { _id: nanoid(), ...getRandomCoordinates(17.5, 17.8, 73.0, 73.3), message: sample(dangerMessages), filter: 'danger', timestamp: getRandomTimestamp(2, 48), city: "Ratnagiri Coast" },
  { _id: nanoid(), ...getRandomCoordinates(20.7, 20.9, 78.0, 78.2), message: sample(foodMessages), filter: 'food', timestamp: getRandomTimestamp(0, 24), city: "Amravati Center" },
  { _id: nanoid(), ...getRandomCoordinates(18.9, 19.0, 73.0, 73.1), message: sample(otherMessages), filter: 'other', timestamp: getRandomTimestamp(1, 10), city: "Panvel Highway" },
];

const volunteerNames = [
  "Aarav Sharma", "Priya Singh", "Rohan Mehta", "Sneha Patil", "Vikram Reddy", "Anita Desai",
  "Rajesh Kumar", "Deepika Iyer", "Amit Patel", "Sunita Rao", "Kiran Joshi", "Manoj Verma",
  "Lakshmi Nair", "Arjun Das", "Geeta Reddy", "Sameer Khan", "Pooja Chavan", "Vinod Kulkarni",
  "Anjali Bhat", "Suresh Gaikwad"
];
const volunteerSkills = [
  ["First Aid", "Search & Rescue"], ["Logistics", "Communication"], ["Medical Doctor", "Trauma Care"],
  ["Counseling", "Child Care"], ["Engineering", "Debris Removal"], ["Food Preparation", "Shelter Management"],
  ["Rope Access", "Swift Water Rescue"], ["Radio Operation", "Drone Piloting"], ["Heavy Machinery Operator"],
  ["Language Translation (Kannada, Marathi, Hindi)"], ["Data Management", "Coordination"], ["Vehicle Driving (Heavy/Light)"]
];
const volunteerStatuses = ['available', 'assigned', 'on_break', 'unavailable'];

export const MOCK_VOLUNTEERS_INITIAL = [];
for (let i = 0; i < 20; i++) {
  const locationCoords = (i % 4 === 0) ? getBelgaumCoordinates(20) : getRandomCoordinates(); // Some volunteers near Belgaum
  MOCK_VOLUNTEERS_INITIAL.push({
    id: nanoid(),
    name: volunteerNames[i % volunteerNames.length] + (i >= volunteerNames.length ? ` ${Math.floor(i / volunteerNames.length) + 1}` : ''), // Ensure unique names if >20
    skills: sample(volunteerSkills),
    status: sample(volunteerStatuses),
    assigned_mission_id: null, // Will be populated later if 'assigned'
    location: locationCoords,
    phone: `98${randomInt(10000000, 99999999)}`,
    last_seen_ping: getRandomTimestamp(randomInt(0, 1), randomInt(0, 23)),
  });
}

// Ensure MOCK_REPORTS_INITIAL has enough items before trying to access specific indices
const safeGetReport = (index, defaultLat = 20, defaultLon = 78) => {
  return MOCK_REPORTS_INITIAL[index] || {
    _id: `fallback_report_${index}`,
    latitude: defaultLat,
    longitude: defaultLon,
    filter: 'other',
    message: "Fallback report data",
    timestamp: new Date().toISOString(),
    city: "Unknown"
  };
};


export const MOCK_MISSIONS_INITIAL = [
  // Missions linked to Belgaum reports
  {
    id: 'mission_bga_1', title: "Fort Lake SOS Response", type: 'rescue', status: 'in_progress',
    related_report_ids: [safeGetReport(0)._id], // First report is a Belgaum SOS
    assigned_volunteer_ids: [], description: "Investigate SOS near Fort Lake, Belgaum.",
    priority: 5, created_at: getRandomTimestamp(0, 10),
    location: { latitude: safeGetReport(0).latitude, longitude: safeGetReport(0).longitude }
  },
  {
    id: 'mission_bga_2', title: "Shahapur Wall Collapse Aid", type: 'medical', status: 'pending',
    related_report_ids: [safeGetReport(1)._id], // Second report is Belgaum SOS
    assigned_volunteer_ids: [], description: "Medical assistance for wall collapse injuries in Shahapur.",
    priority: 4, created_at: getRandomTimestamp(1, 20),
    location: { latitude: safeGetReport(1).latitude, longitude: safeGetReport(1).longitude }
  },
  {
    id: 'mission_bga_3', title: "Udyambag Fire Control", type: 'emergency_response', status: 'in_progress',
    related_report_ids: [safeGetReport(4)._id],
    assigned_volunteer_ids: [], description: "Coordinate fire fighting and evacuation in Udyambag.",
    priority: 5, created_at: getRandomTimestamp(1, 4),
    location: { latitude: safeGetReport(4).latitude, longitude: safeGetReport(4).longitude }
  },

  // General Missions
  {
    id: 'mission_mum_1', title: "Rescue at Mumbai Building", type: 'rescue', status: 'in_progress',
    related_report_ids: [safeGetReport(12)._id], // A Mumbai SOS report
    assigned_volunteer_ids: [], description: "Urgent rescue for people trapped in building collapse.",
    priority: 5, created_at: getRandomTimestamp(2),
    location: { latitude: safeGetReport(12).latitude, longitude: safeGetReport(12).longitude }
  },
  {
    id: 'mission_pune_1', title: "Food Supply for Pune Area", type: 'supply', status: 'pending',
    related_report_ids: [safeGetReport(13)._id, safeGetReport(14)._id].filter(id => id && !id.startsWith('fallback')),
    assigned_volunteer_ids: [], description: "Deliver food packets to families affected.",
    priority: 3, created_at: getRandomTimestamp(1),
    location: { latitude: safeGetReport(13).latitude, longitude: safeGetReport(13).longitude }
  },
  {
    id: nanoid(), title: "Medical Aid for Nashik Hills Landslide", type: 'medical', status: 'completed',
    related_report_ids: [safeGetReport(17)._id],
    assigned_volunteer_ids: [], description: "Provide first aid and assess injuries from landslide.",
    priority: 4, created_at: getRandomTimestamp(3), completed_at: getRandomTimestamp(1),
    location: { latitude: safeGetReport(17).latitude, longitude: safeGetReport(17).longitude }
  },
  {
    id: nanoid(), title: "Road Clearance Satara", type: 'logistics', status: 'pending',
    related_report_ids: [safeGetReport(18)._id], // A Satara SOS report
    assigned_volunteer_ids: [], description: "Clear debris and restore road access in Satara region.",
    priority: 3, created_at: getRandomTimestamp(1),
    location: { latitude: safeGetReport(18).latitude, longitude: safeGetReport(18).longitude }
  },
  {
    id: nanoid(), title: "Shelter Setup Kolhapur", type: 'shelter_management', status: 'in_progress',
    related_report_ids: [safeGetReport(20)._id], // A Kolhapur SOS
    assigned_volunteer_ids: [], description: "Establish and manage temporary shelters for evacuees.",
    priority: 4, created_at: getRandomTimestamp(0, 15),
    location: { latitude: safeGetReport(20).latitude, longitude: safeGetReport(20).longitude }
  },
  {
    id: nanoid(), title: "Search for Missing in Beed", type: 'search_rescue', status: 'pending',
    related_report_ids: [safeGetReport(27)._id], // A missing person report
    assigned_volunteer_ids: [], description: "Conduct search operations for missing individual in Beed district.",
    priority: 3, created_at: getRandomTimestamp(2),
    location: { latitude: safeGetReport(27).latitude, longitude: safeGetReport(27).longitude }
  },
  {
    id: nanoid(), title: "Power Line Repair Ratnagiri", type: 'technical', status: 'completed',
    related_report_ids: [safeGetReport(28)._id], // A danger report
    assigned_volunteer_ids: [], description: "Assess and repair damaged power infrastructure.",
    priority: 4, created_at: getRandomTimestamp(3), completed_at: getRandomTimestamp(1, 12),
    location: { latitude: safeGetReport(28).latitude, longitude: safeGetReport(28).longitude }
  }
];

// Assign some volunteers to missions
let assignedVolunteerCount = 0;
for (const mission of MOCK_MISSIONS_INITIAL) {
  if (mission.status === 'in_progress' || mission.status === 'pending') {
    const numToAssign = mission.status === 'in_progress' ? randomInt(1, 3) : (Math.random() < 0.3 ? 1 : 0); // Assign more to 'in_progress'
    for (let i = 0; i < numToAssign; i++) {
      const availableVolunteer = MOCK_VOLUNTEERS_INITIAL.find(
        v => v.status === 'available' && !mission.assigned_volunteer_ids.includes(v.id)
      );
      if (availableVolunteer) {
        mission.assigned_volunteer_ids.push(availableVolunteer.id);
        availableVolunteer.status = 'assigned';
        availableVolunteer.assigned_mission_id = mission.id;
        assignedVolunteerCount++;
      } else {
        break; // No more available volunteers
      }
    }
  } else if (mission.status === 'completed') { // Assign some to completed missions for history
    if (Math.random() < 0.5) { // 50% chance to assign a volunteer to a completed mission
      const randomVolunteer = MOCK_VOLUNTEERS_INITIAL[randomInt(0, MOCK_VOLUNTEERS_INITIAL.length - 1)];
      if (!randomVolunteer.assigned_mission_id && randomVolunteer.status !== 'assigned') { // If not currently busy
        mission.assigned_volunteer_ids.push(randomVolunteer.id);
      }
    }
  }
}
console.log(`Assigned ${assignedVolunteerCount} volunteers to active/pending missions.`);

// Ensure some volunteers are definitely available, on_break etc. for variety if all got assigned
const ensureStatusDiversity = (status, count) => {
  let currentCount = MOCK_VOLUNTEERS_INITIAL.filter(v => v.status === status).length;
  for (let i = 0; i < MOCK_VOLUNTEERS_INITIAL.length && currentCount < count; i++) {
    if (!MOCK_VOLUNTEERS_INITIAL[i].assigned_mission_id || status !== 'assigned') {
      MOCK_VOLUNTEERS_INITIAL[i].status = status;
      MOCK_VOLUNTEERS_INITIAL[i].assigned_mission_id = null; // Clear mission if not assigned
      currentCount++;
    }
  }
};

ensureStatusDiversity('available', Math.max(3, Math.floor(MOCK_VOLUNTEERS_INITIAL.length * 0.2))); // At least 3 or 20% available
ensureStatusDiversity('on_break', Math.max(1, Math.floor(MOCK_VOLUNTEERS_INITIAL.length * 0.1)));  // At least 1 or 10% on_break