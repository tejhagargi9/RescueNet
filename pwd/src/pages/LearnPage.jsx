import React, { useState, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  MessageCircle,
  // X, Send, // X and Send are not used in DisastersInfoPage, only in RescueBot
  CheckCircle,
  Circle,
  MapPin,
  Users,
  Calendar,
  Phone,
  // Home, // Home is not used
  Zap,
  Droplets,
  Wind,
  Flame,
  Mountain,
  // Thermometer, // Thermometer is not used
  CloudSnow,
  Sun,
  Waves,
  Bug,
  Shield,
} from "lucide-react";

// Main App Component
const LearnPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [isStorageLoading, setIsStorageLoading] = useState(true); // To manage initial load

  const STORAGE_KEY = "disasterCheckedItems";

  // Load checked items from localStorage on component mount
  useEffect(() => {
    console.log("[EFFECT LOAD] Attempting to load from localStorage...");
    setIsStorageLoading(true);
    try {
      const savedCheckedItems = localStorage.getItem(STORAGE_KEY);
      console.log(`[EFFECT LOAD] Raw data from localStorage for key "${STORAGE_KEY}":`, savedCheckedItems);
      if (savedCheckedItems) {
        const parsedItems = JSON.parse(savedCheckedItems);
        console.log("[EFFECT LOAD] Parsed items:", parsedItems);
        setCheckedItems(parsedItems);
      } else {
        console.log(`[EFFECT LOAD] No items found in localStorage for key "${STORAGE_KEY}". Initializing with empty.`);
        setCheckedItems({}); // Ensure it's an empty object if nothing is found
      }
    } catch (error) {
      console.error("[EFFECT LOAD] Error loading or parsing checked items from localStorage:", error);
      // If there's an error (e.g., corrupted data), reset to empty
      setCheckedItems({});
    } finally {
      setIsStorageLoading(false);
      console.log("[EFFECT LOAD] Finished loading. isStorageLoading: false");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save checked items to localStorage whenever checkedItems changes
  useEffect(() => {
    if (isStorageLoading) {
      console.log("[EFFECT SAVE] Skipping save, initial storage load in progress.");
      return; // Don't save until initial load is complete
    }
    console.log("[EFFECT SAVE] Attempting to save to localStorage. Current checkedItems:", checkedItems);
    try {
      const stringifiedItems = JSON.stringify(checkedItems);
      localStorage.setItem(STORAGE_KEY, stringifiedItems);
      console.log(`[EFFECT SAVE] Successfully saved to localStorage for key "${STORAGE_KEY}":`, stringifiedItems);
      // For immediate verification:
      // console.log('[EFFECT SAVE] Verifying save, read back from localStorage:', localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      console.error("[EFFECT SAVE] Error saving checked items to localStorage:", error);
    }
  }, [checkedItems, isStorageLoading]); // Re-run if checkedItems changes or loading finishes

  const disasters = [
    {
      id: "earthquake",
      name: "Earthquake",
      icon: Mountain,
      color: "from-amber-500 to-orange-600",
      description: "Ground shaking and structural damage preparation",
      severity: "High Risk",
    },
    {
      id: "flood",
      name: "Flood",
      icon: Waves,
      color: "from-blue-500 to-cyan-600",
      description: "Water damage and evacuation planning",
      severity: "Medium Risk",
    },
    {
      id: "wildfire",
      name: "Wildfire",
      icon: Flame,
      color: "from-red-500 to-orange-600",
      description: "Fire prevention and evacuation strategies",
      severity: "High Risk",
    },
    {
      id: "hurricane",
      name: "Hurricane",
      icon: Wind,
      color: "from-gray-600 to-blue-700",
      description: "High winds and storm surge preparation",
      severity: "High Risk",
    },
    {
      id: "tornado",
      name: "Tornado",
      icon: Wind,
      color: "from-purple-500 to-indigo-600",
      description: "Rotating storm and shelter planning",
      severity: "High Risk",
    },
    {
      id: "winter-storm",
      name: "Winter Storm",
      icon: CloudSnow,
      color: "from-blue-400 to-indigo-600",
      description: "Snow, ice, and cold weather preparation",
      severity: "Medium Risk",
    },
    {
      id: "heat-wave",
      name: "Heat Wave",
      icon: Sun,
      color: "from-yellow-500 to-red-600",
      description: "Extreme heat and cooling strategies",
      severity: "Medium Risk",
    },
    {
      id: "drought",
      name: "Drought",
      icon: Droplets,
      color: "from-yellow-600 to-brown-600",
      description: "Water conservation and supply planning",
      severity: "Low Risk",
    },
    {
      id: "power-outage",
      name: "Power Outage",
      icon: Zap,
      color: "from-gray-500 to-gray-700",
      description: "Electrical failure and backup power",
      severity: "Medium Risk",
    },
    {
      id: "pandemic",
      name: "Pandemic",
      icon: Bug,
      color: "from-green-500 to-teal-600",
      description: "Disease outbreak and health protection",
      severity: "Variable Risk",
    },
    {
      id: "chemical-spill",
      name: "Chemical Spill",
      icon: Shield,
      color: "from-yellow-500 to-red-700",
      description: "Hazardous material exposure protection",
      severity: "High Risk",
    },
    {
      id: "cyber-attack",
      name: "Cyber Attack",
      icon: AlertTriangle,
      color: "from-red-600 to-pink-700",
      description: "Digital infrastructure and data protection",
      severity: "Medium Risk",
    },
  ];

  // (Keep your disasterInfo object as is)
  const disasterInfo = {
    earthquake: {
      overview:
        "Earthquakes can strike without warning and cause significant structural damage. Preparation focuses on securing your environment and knowing how to respond during shaking.",
      before: [
        "Secure heavy furniture and appliances to walls",
        "Identify safe spots in each room (under sturdy desks/tables)",
        "Practice Drop, Cover, and Hold On drills with family",
        "Create an emergency kit with 72 hours of supplies",
        "Develop a family communication plan",
        "Know how to turn off gas, electricity, and water",
        "Ensure your home meets current building codes",
        "Consider earthquake insurance coverage",
      ],
      during: [
        "Drop to hands and knees immediately",
        "Take cover under a sturdy desk or table",
        "Hold on to your shelter and protect your head",
        "Stay away from windows, mirrors, and heavy objects",
        "If outdoors, move away from buildings and power lines",
        "If in a vehicle, pull over and stay inside",
        "Do not run outside during shaking",
      ],
      after: [
        "Check for injuries and provide first aid",
        "Inspect your home for damage before re-entering",
        "Turn off utilities if you suspect damage",
        "Use flashlights, not candles, for lighting",
        "Stay out of damaged buildings",
        "Be prepared for aftershocks",
        "Listen to emergency broadcasts for information",
      ],
    },
    flood: {
      overview:
        "Floods are among the most common natural disasters. They can develop slowly or flash flood within minutes, making preparation and quick response critical.",
      before: [
        "Know your area's flood risk and evacuation routes",
        "Keep important documents in waterproof containers",
        "Install sump pumps and backup power sources",
        "Create barriers like sandbags for your property",
        "Review and understand your insurance coverage",
        "Prepare an emergency kit for quick evacuation",
        "Plan for pet evacuation and care",
        "Sign up for community alert systems",
      ],
      during: [
        "Never drive through flooded roads - Turn Around Don't Drown",
        "Move to higher ground immediately if advised",
        "Avoid walking in moving water above ankle level",
        "Stay away from downed power lines",
        "Monitor emergency broadcasts continuously",
        "If trapped in building, go to highest level",
        "Signal for help from upper floors or roof",
      ],
      after: [
        "Wait for authorities to declare area safe",
        "Avoid flood waters - they may be contaminated",
        "Document damage with photos for insurance",
        "Clean and disinfect everything that got wet",
        "Check electrical systems before use",
        "Watch for animals displaced by flood waters",
        "Be aware of carbon monoxide from generators",
      ],
    },
    wildfire: {
      overview:
        "Wildfires can spread rapidly and unpredictably. Creating defensible space and having evacuation plans are essential for protection.",
      before: [
        "Create defensible space around your home (30+ feet)",
        "Use fire-resistant building materials and landscaping",
        "Install spark arresters on chimneys and stovepipes",
        "Keep gutters and roof clear of debris",
        "Plan multiple evacuation routes from your area",
        "Prepare go-bags for quick evacuation",
        "Sign up for emergency alert systems",
        "Know locations of gas shut-off valves",
      ],
      during: [
        "Evacuate immediately when ordered by authorities",
        "If trapped, call 911 and give your location",
        "Close all windows and doors to prevent drafts",
        "Remove flammable window treatments",
        "Move furniture to center of rooms",
        "Shut off gas and pilot lights",
        "Leave lights on for visibility through smoke",
        "If escaping by car, keep windows closed",
      ],
      after: [
        "Wait for official clearance before returning home",
        "Check for hot spots and extinguish them",
        "Wet down debris to minimize dust",
        "Watch for hazards like damaged power lines",
        "Document damage for insurance claims",
        "Be cautious of structural damage from heat",
        "Avoid damaged or charred trees that may fall",
      ],
    },
    hurricane: {
      overview:
        "Hurricanes bring multiple hazards including high winds, storm surge, and flooding. Preparation should begin before hurricane season starts.",
      before: [
        "Know your evacuation zone and routes",
        "Secure outdoor furniture and decorations",
        "Install permanent storm shutters or board up windows",
        "Stock up on water (1 gallon per person per day for 3-7 days)",
        "Prepare non-perishable food for several days",
        "Ensure vehicles are fueled and in good condition",
        "Charge all electronic devices and have backup batteries",
        "Review insurance policies and document belongings",
      ],
      during: [
        "Stay indoors away from windows and doors",
        "Go to interior room on lowest floor if winds intensify",
        "Avoid using electrical appliances",
        "Never go outside during the eye of the storm",
        "Monitor weather updates continuously",
        "Use generators outside only to prevent carbon monoxide",
        "Stay away from flood waters",
      ],
      after: [
        "Continue monitoring weather - storms can return",
        "Avoid downed power lines and standing water",
        "Use generators and grills outside only",
        "Document damage with photos before cleanup",
        "Be cautious when cleaning up debris",
        "Check on neighbors, especially elderly",
        "Conserve phone battery for emergencies only",
      ],
    },
    tornado: {
      overview:
        "Tornadoes can form quickly and cause devastating damage in a narrow path. Having a safe room and quick response plan is crucial.",
      before: [
        "Identify your safe room (interior room on lowest floor)",
        "Keep weather radio with battery backup",
        "Practice tornado drills with family",
        "Prepare emergency kit for your safe room",
        "Know the difference between tornado watch and warning",
        "Install weather alert apps on mobile devices",
        "Consider building a storm shelter or safe room",
        "Trim trees and secure outdoor items",
      ],
      during: [
        "Go to your safe room immediately when warned",
        "Get under sturdy furniture and protect your head",
        "Stay away from windows, doors, and outside walls",
        "If in mobile home, get out and go to sturdy building",
        "If outdoors, lie flat in low area away from cars",
        "Never try to outrun tornado in vehicle",
        "If in vehicle, get out and seek lower ground",
      ],
      after: [
        "Check for injuries and provide first aid",
        "Be careful of broken glass and debris",
        "Stay out of damaged buildings",
        "Watch for additional tornadoes which often occur",
        "Help injured or trapped persons if you can safely",
        "Use phone only for emergency calls",
        "Document damage for insurance purposes",
      ],
    },
    "winter-storm": {
      overview:
        "Winter storms can bring snow, ice, and freezing temperatures that can last for days. Staying warm and having adequate supplies is essential.",
      before: [
        "Insulate pipes and know water shut-off location",
        "Service heating equipment and clean chimneys",
        "Install weather stripping and insulation",
        "Stock up on heating fuel (safely stored)",
        "Prepare food that doesn't require cooking",
        "Have warm clothing and blankets readily available",
        "Keep rock salt or ice melt for walkways",
        "Ensure vehicles have winter emergency kits",
      ],
      during: [
        "Stay indoors and dress in layers",
        "Conserve heat by closing off unused rooms",
        "Never use charcoal grills or gas appliances for heating",
        "If power goes out, move to one room and close it off",
        "Drink plenty of fluids but avoid alcohol and caffeine",
        "Check on neighbors, especially elderly",
        "Avoid overexertion when shoveling snow",
      ],
      after: [
        "Check for frostbite and hypothermia symptoms",
        "Remove snow from vehicle exhaust pipe before starting",
        "Be cautious of carbon monoxide from generators",
        "Watch for signs of roof stress from snow load",
        "Clear walkways carefully to prevent injury",
        "Check on neighbors and community members",
        "Conserve fuel and electricity as supplies may be limited",
      ],
    },
    "heat-wave": {
      overview:
        "Extreme heat can be deadly, especially for vulnerable populations. Staying cool and hydrated is critical during heat waves.",
      before: [
        "Check air conditioning systems and have them serviced",
        "Install weather stripping and window coverings",
        "Identify cooling centers in your community",
        "Plan activities for cooler parts of the day",
        "Stock up on water and electrolyte drinks",
        "Prepare lightweight, light-colored clothing",
        "Check on elderly neighbors and relatives",
        "Never leave children or pets in vehicles",
      ],
      during: [
        "Stay in air-conditioned spaces as much as possible",
        "Drink plenty of water even if you don't feel thirsty",
        "Avoid alcoholic beverages and caffeine",
        "Take cool showers or baths",
        "Wear lightweight, light-colored, loose-fitting clothes",
        "Limit outdoor activities to early morning or evening",
        "Check on family, friends, and neighbors frequently",
      ],
      after: [
        "Continue monitoring for heat-related illness symptoms",
        "Gradually resume normal activities",
        "Check on vulnerable community members",
        "Document any property damage from extreme heat",
        "Review your heat emergency plan for improvements",
        "Consider long-term cooling solutions",
        "Stay informed about ongoing heat advisories",
      ],
    },
    drought: {
      overview:
        "Droughts develop slowly but can have long-lasting impacts on water supply, agriculture, and daily life. Water conservation is key.",
      before: [
        "Implement water conservation measures at home",
        "Install drought-resistant landscaping",
        "Fix leaks in plumbing and irrigation systems",
        "Install water-efficient appliances and fixtures",
        "Create water storage systems where legal",
        "Plan alternative water sources",
        "Understand local water restrictions",
        "Prepare for increased fire danger",
      ],
      during: [
        "Follow all local water use restrictions",
        "Use water-efficient practices for all activities",
        "Reuse water when safe and appropriate",
        "Monitor wells and water sources",
        "Be extra cautious with fire prevention",
        "Support community conservation efforts",
        "Consider temporary lifestyle changes",
      ],
      after: [
        "Continue water conservation even after drought ends",
        "Repair any damage to landscaping gradually",
        "Reassess long-term water needs and sources",
        "Review and improve water storage capabilities",
        "Document lessons learned for future droughts",
        "Support community drought resilience planning",
        "Monitor for ongoing water system impacts",
      ],
    },
    "power-outage": {
      overview:
        "Power outages can result from severe weather, equipment failure, or other disasters. Being prepared to manage without electricity is important.",
      before: [
        "Install surge protectors for sensitive electronics",
        "Have battery-powered or hand-crank radio",
        "Stock up on batteries, flashlights, and candles",
        "Consider backup power options (generator, solar)",
        "Keep mobile devices charged",
        "Have manual can opener and non-electric cooking method",
        "Know how to manually open electric garage doors",
        "Prepare for medical equipment power needs",
      ],
      during: [
        "Use flashlights instead of candles when possible",
        "Keep refrigerator and freezer doors closed",
        "Never use generators, grills, or camp stoves indoors",
        "Disconnect appliances to prevent surge damage",
        "Use phone sparingly to preserve battery",
        "Check on neighbors, especially elderly or disabled",
        "Stay cool/warm using non-electric methods",
      ],
      after: [
        "Check food safety - discard if temperature exceeded safe levels",
        "Gradually reconnect electronic devices",
        "Reset clocks and electronic equipment",
        "Restock emergency supplies used",
        "Document any losses for insurance",
        "Review backup power needs",
        "Consider improvements for future outages",
      ],
    },
    pandemic: {
      overview:
        "Pandemics can disrupt normal life for extended periods. Preparation focuses on health protection and maintaining essential supplies.",
      before: [
        "Stock up on prescription medications (30-90 day supply)",
        "Have thermometers and basic medical supplies",
        "Prepare non-perishable food for extended periods",
        "Plan for working and schooling from home",
        "Identify healthcare facilities and protocols",
        "Prepare cleaning and disinfection supplies",
        "Plan for caring for sick family members at home",
        "Create communication plan with family and work",
      ],
      during: [
        "Follow public health guidance and restrictions",
        "Practice good hygiene and social distancing",
        "Wear masks and protective equipment as recommended",
        "Monitor your health and seek care when needed",
        "Stay informed through reliable sources only",
        "Support vulnerable community members safely",
        "Maintain mental health and social connections",
      ],
      after: [
        "Continue following health guidance during recovery",
        "Gradually resume normal activities as advised",
        "Address mental health impacts of pandemic",
        "Restock medical and emergency supplies",
        "Support community recovery efforts",
        "Learn from experience to improve future preparedness",
        "Stay vigilant for ongoing health risks",
      ],
    },
    "chemical-spill": {
      overview:
        "Chemical spills can release hazardous substances into the environment. Quick evacuation or sheltering in place may be necessary.",
      before: [
        "Know industrial facilities and transportation routes nearby",
        "Understand difference between evacuation and shelter-in-place",
        "Prepare emergency kit for quick evacuation",
        "Identify safe rooms for sheltering in place",
        "Sign up for community emergency alerts",
        "Know symptoms of chemical exposure",
        "Have emergency contact information readily available",
        "Plan for pets during evacuation or sheltering",
      ],
      during: [
        "Follow official instructions immediately - evacuate or shelter",
        "If sheltering: go inside, close windows/doors, turn off ventilation",
        "If evacuating: take emergency kit and leave immediately",
        "Cover nose and mouth with cloth if exposed to vapors",
        "Move away from accident scene and upwind if possible",
        "Don't drive through vapor clouds",
        "Listen to emergency broadcasts for updates",
      ],
      after: [
        "Wait for official all-clear before returning to area",
        "Seek medical attention if you were exposed",
        "Dispose of contaminated clothing and items safely",
        "Clean yourself thoroughly if potentially exposed",
        "Avoid affected areas until declared safe",
        "Document any exposure or health effects",
        "Follow decontamination procedures if advised",
      ],
    },
    "cyber-attack": {
      overview:
        "Cyber attacks can disrupt digital infrastructure and compromise personal data. Digital preparedness and security are increasingly important.",
      before: [
        "Keep software and systems updated with security patches",
        "Use strong, unique passwords and two-factor authentication",
        "Regularly backup important data offline",
        "Have paper copies of critical information",
        "Know how to access services without internet",
        "Prepare alternative communication methods",
        "Understand your financial accounts and access options",
        "Keep some cash on hand for emergencies",
      ],
      during: [
        "Disconnect from internet if you suspect compromise",
        "Don't click suspicious links or download attachments",
        "Use alternative methods for critical communications",
        "Monitor financial accounts for unauthorized activity",
        "Report cyber incidents to appropriate authorities",
        "Follow guidance from your IT department or service providers",
        "Document evidence of the attack if safe to do so",
      ],
      after: [
        "Change passwords for all affected accounts",
        "Monitor credit reports and financial statements closely",
        "Update security software and run full system scans",
        "Restore data from clean backups",
        "Review and improve cybersecurity practices",
        "Stay alert for identity theft and fraud",
        "Report any ongoing suspicious activity",
      ],
    },
  };


  const filteredDisasters = disasters.filter(
    (disaster) =>
      disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disaster.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheckItem = (section, index) => {
    if (!selectedDisaster) return; // Guard against no selected disaster
    const key = `${selectedDisaster.id}-${section}-${index}`;
    setCheckedItems((prev) => {
      const newState = {
        ...prev,
        [key]: !prev[key],
      };
      console.log(`[TOGGLE] Item ${key} toggled. New checkedItems state for save:`, newState);
      return newState;
    });
  };

  const isItemChecked = (section, index) => {
    if (!selectedDisaster) return false; // Guard
    const key = `${selectedDisaster.id}-${section}-${index}`;
    return checkedItems[key] || false;
  };

  const getSectionProgress = (section) => {
    if (!selectedDisaster || !disasterInfo[selectedDisaster.id] || !disasterInfo[selectedDisaster.id][section]) {
      return 0;
    }
    const items = disasterInfo[selectedDisaster.id][section];
    if (!items || items.length === 0) return 0;

    const checkedCount = items.filter((_, idx) =>
      isItemChecked(section, idx)
    ).length;
    return Math.round((checkedCount / items.length) * 100);
  };

  if (isStorageLoading && !selectedDisaster) { // Show a loading indicator only if on main page and storage is loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-[5rem]">
        <p className="text-xl text-gray-700">Loading disaster preparedness data...</p>
      </div>
    );
  }


  if (selectedDisaster) {
    const info = disasterInfo[selectedDisaster.id];
    const IconComponent = selectedDisaster.icon;

    if (!info) {
        // Handle case where disasterInfo might not have an entry for selectedDisaster.id
        // Though with current static data, this shouldn't happen unless IDs mismatch
        console.error(`No info found for disaster ID: ${selectedDisaster.id}`);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
                <p className="text-xl text-red-500">Error: Disaster details not found.</p>
                <button
                  onClick={() => setSelectedDisaster(null)}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go Back
                </button>
            </div>
        );
    }


    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => setSelectedDisaster(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              ← Back to Disasters
            </button>
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${selectedDisaster.color} text-white`}
              >
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedDisaster.name} Preparedness
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedDisaster.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{info.overview}</p>
          </div>

          {/* Preparedness Sections */}
          <div className="space-y-8">
            {["before", "during", "after"].map((section) => {
              const sectionTitles = {
                before: "Before the Disaster",
                during: "During the Disaster",
                after: "After the Disaster",
              };

              const sectionColors = {
                before: "border-green-200 bg-green-50",
                during: "border-yellow-200 bg-yellow-50",
                after: "border-blue-200 bg-blue-50",
              };

              const progress = getSectionProgress(section);

              return (
                <div
                  key={section}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${sectionColors[section]}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {sectionTitles[section]}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {progress}% Complete
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {info[section] && info[section].map((item, index) => ( // Added info[section] check
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <button
                            onClick={() => toggleCheckItem(section, index)}
                            className="mt-0.5 text-green-600 hover:text-green-700 transition-colors"
                            aria-label={`Toggle item: ${item}`} // Accessibility
                          >
                            {isItemChecked(section, index) ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <span
                            className={`text-gray-700 leading-relaxed ${
                              isItemChecked(section, index)
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Contacts Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              Emergency Contacts
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Emergency Services:</strong> 911
                </p>
                <p>
                  <strong>Poison Control:</strong> 1-800-222-1222
                </p>
                <p>
                  <strong>Red Cross:</strong> 1-800-733-2767
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>FEMA:</strong> 1-800-621-3362
                </p>
                <p>
                  <strong>Local Emergency Mgmt:</strong> [Your Local Number]
                </p>
                <p>
                  <strong>Utility Companies:</strong> [Your Local Numbers]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br mt-[5rem] from-blue-50 to-indigo-100">
      {/* Header Content */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Disaster Preparedness Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay prepared, stay safe. Access personalized disaster
              preparedness checklists, emergency resources, and community
              coordination tools to protect yourself and your loved ones.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for specific disasters or preparedness topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">{disasters.length}</div>
              <div className="text-sm opacity-90">Disaster Types</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">200+</div> {/* This is hardcoded, consider calculating if needed */}
              <div className="text-sm opacity-90">Checklist Items</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">24/7</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">Live</div>
              <div className="text-sm opacity-90">Emergency Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Disaster Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDisasters.map((disaster) => {
            const IconComponent = disaster.icon;
            return (
              <div
                key={disaster.id}
                onClick={() => {
                    console.log(`[CLICK CARD] Selected disaster: ${disaster.name}`);
                    setSelectedDisaster(disaster);
                }}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${disaster.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${disaster.color} text-white`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {disaster.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          disaster.severity === "High Risk"
                            ? "bg-red-100 text-red-700"
                            : disaster.severity === "Medium Risk"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {disaster.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {disaster.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">
                      View Checklist →
                    </span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>Community Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDisasters.length === 0 && searchTerm && ( // Show only if search term is active
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No disasters found for "{searchTerm}"
            </h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Additional Resources Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Additional Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Emergency Locations
              </h3>
              <p className="text-gray-600">
                Find nearby shelters, hospitals, and emergency services in your
                area.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community Network</h3>
              <p className="text-gray-600">
                Connect with neighbors and local emergency response teams.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Training Events</h3>
              <p className="text-gray-600">
                Join local disaster preparedness training and community drills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;