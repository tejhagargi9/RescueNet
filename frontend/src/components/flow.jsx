import React, { useState, useEffect } from "react";
import {
  User,
  Heart,
  MapPin,
  Phone,
  Shield,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Navigation,
} from "lucide-react";

const Flow = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [citizenData, setCitizenData] = useState({
    age: "",
    disabilities: "",
    addresses: [""],
    phoneNumbers: [""],
    location: null,
  });
  const [volunteerData, setVolunteerData] = useState({
    phoneNumbers: [""],
    addresses: [""],
    location: null,
  });

  // Check if user needs onboarding when component mounts
  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const onBoardStatus = localStorage.getItem("onBoard");
        const userTypeStored = localStorage.getItem("userType");

        console.log("Checking onboarding status:", {
          onBoardStatus,
          userTypeStored,
        });

        // Show onboarding if either onBoard is not "true" or userType is not set
        const shouldShowOnboarding =
          onBoardStatus !== "true" || !userTypeStored;

        setIsOpen(shouldShowOnboarding);

        // If user is already onboarded, we can optionally load their data
        if (!shouldShowOnboarding && userTypeStored) {
          setUserType(userTypeStored);
          try {
            const savedUserData = localStorage.getItem("userData");
            if (savedUserData) {
              const parsedData = JSON.parse(savedUserData);
              if (userTypeStored === "citizen") {
                setCitizenData(parsedData);
              } else {
                setVolunteerData(parsedData);
              }
            }
          } catch (error) {
            console.error("Error loading saved user data:", error);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If localStorage fails, show onboarding as fallback
        setIsOpen(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentStep(1);
  };

  const addArrayField = (type, field) => {
    if (type === "citizen") {
      setCitizenData((prev) => ({
        ...prev,
        [field]: [...prev[field], ""],
      }));
    } else {
      setVolunteerData((prev) => ({
        ...prev,
        [field]: [...prev[field], ""],
      }));
    }
  };

  const removeArrayField = (type, field, index) => {
    if (type === "citizen") {
      setCitizenData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    } else {
      setVolunteerData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const updateArrayField = (type, field, index, value) => {
    if (type === "citizen") {
      setCitizenData((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) => (i === index ? value : item)),
      }));
    } else {
      setVolunteerData((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) => (i === index ? value : item)),
      }));
    }
  };

  const updateField = (type, field, value) => {
    if (type === "citizen") {
      setCitizenData((prev) => ({ ...prev, [field]: value }));
    } else {
      setVolunteerData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const requestLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return null;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error("Location error:", error);
      alert("Location access is required. Please enable permissions.");
      return null;
    }
  };

  const handleComplete = (userData) => {
  try {
    localStorage.setItem("onBoard", "true");
    localStorage.setItem("userType", userType);
    localStorage.setItem("userData", JSON.stringify(userData));
    closeModal();
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving information. Please try again.");
  }
};
  const canProceed = () => {
    const data = userType === "citizen" ? citizenData : volunteerData;

    if (userType === "citizen") {
      switch (currentStep) {
        case 1:
          return (
            data.age && data.addresses[0].trim() && data.phoneNumbers[0].trim()
          );
        case 2:
          return true; // Always allow proceeding on location step
        default:
          return true;
      }
    } else {
      switch (currentStep) {
        case 1:
          return data.addresses[0].trim() && data.phoneNumbers[0].trim();
        case 2:
          return true; // Always allow proceeding on location step
        default:
          return true;
      }
    }
  };

  const nextStep = async () => {
    if (currentStep === 2) {
      const location = await requestLocation();
      if (location) {
        // Update state with the obtained location
        updateField(userType, "location", location);

        // Construct userData with current state and new location
        const userData =
          userType === "citizen"
            ? { ...citizenData, location }
            : { ...volunteerData, location };

        handleComplete(userData);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setUserType(null);
      setCurrentStep(0);
    }
  };

  // Reset onboarding (for testing purposes - you can remove this in production)
  const resetOnboarding = () => {
    localStorage.removeItem("onBoard");
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    setIsOpen(true);
    setUserType(null);
    setCurrentStep(0);
    setCitizenData({
      age: "",
      disabilities: "",
      addresses: [""],
      phoneNumbers: [""],
      location: null,
    });
    setVolunteerData({
      phoneNumbers: [""],
      addresses: [""],
      location: null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-scroll scrollbar-hide">
        {/* Header */}
        <div className="p-8 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome to RescueNet
                </h2>
                <p className="text-gray-600">
                  Let's set up your profile for emergency services
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= currentStep
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 0: User Type Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Choose Your Role
                </h3>
                <p className="text-gray-600">
                  Select how you'd like to participate in the RescueNet
                  community
                </p>
              </div>

              <div className="grid gap-6">
                <button
                  onClick={() => handleUserTypeSelect("citizen")}
                  className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">
                        I'm a Citizen
                      </h4>
                      <p className="text-gray-600">
                        I want to receive emergency assistance and connect with
                        local responders
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                <button
                  onClick={() => handleUserTypeSelect("volunteer")}
                  className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl border-2 border-transparent hover:border-green-200 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">
                        I'm a Volunteer
                      </h4>
                      <p className="text-gray-600">
                        I want to help others in emergency situations and serve
                        my community
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Information Collection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {userType === "citizen"
                    ? "Your Information"
                    : "Volunteer Details"}
                </h3>
                <p className="text-gray-600">
                  {userType === "citizen"
                    ? "Help us provide better emergency assistance"
                    : "Tell us where you can help others"}
                </p>
              </div>

              <div className="space-y-6">
                {/* Citizen-specific fields */}
                {userType === "citizen" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={citizenData.age}
                        onChange={(e) =>
                          updateField("citizen", "age", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Disabilities (Optional)
                      </label>
                      <textarea
                        value={citizenData.disabilities}
                        onChange={(e) =>
                          updateField("citizen", "disabilities", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Any medical conditions or disabilities we should know about"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {/* Phone Numbers */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Numbers <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {(userType === "citizen"
                      ? citizenData.phoneNumbers
                      : volunteerData.phoneNumbers
                    ).map((phone, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            updateArrayField(
                              userType,
                              "phoneNumbers",
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter phone number"
                        />
                        {index > 0 && (
                          <button
                            onClick={() =>
                              removeArrayField(userType, "phoneNumbers", index)
                            }
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayField(userType, "phoneNumbers")}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Number
                    </button>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {userType === "citizen"
                      ? "Addresses (Places You Visit Often)"
                      : "Service Areas"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {(userType === "citizen"
                      ? citizenData.addresses
                      : volunteerData.addresses
                    ).map((address, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) =>
                            updateArrayField(
                              userType,
                              "addresses",
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={
                            userType === "citizen"
                              ? "Enter address"
                              : "Enter area where you can help"
                          }
                        />
                        {index > 0 && (
                          <button
                            onClick={() =>
                              removeArrayField(userType, "addresses", index)
                            }
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayField(userType, "addresses")}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another {userType === "citizen" ? "Address" : "Area"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location Permission */}
          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Enable Location Services
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                We need access to your location to provide accurate emergency
                services and connect you with nearby help.
              </p>

              <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Privacy Notice
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Your location is only used for emergency services and is
                      stored securely. We never share your location data with
                      third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200/50 flex items-center justify-between">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentStep === 2 ? (
              <>
                <Navigation className="w-5 h-5" />
                Enable Location & Complete
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Debug button for testing - Remove in production */}
      <button
        onClick={resetOnboarding}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm opacity-50 hover:opacity-100"
        title="Reset onboarding (for testing)"
      >
        Reset
      </button>
    </div>
  );
};

export default Flow;
