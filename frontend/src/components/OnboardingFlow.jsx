import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext"; // Use our context
import {
  User, Heart, MapPin, Phone, Shield, Users, ChevronRight, ChevronLeft, X,
  AlertCircle, Plus, Trash2, Navigation, CheckCircle, AlertTriangle as WarningIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingFlow = ({ onComplete }) => {
  const { currentUser, updateUserProfile, isLoading: isAuthLoading, isSignedIn } = useAuthContext();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState(null); // 'citizen' or 'volunteer'
  const [currentStep, setCurrentStep] = useState(0); // 0: Role, 1: Details, 2: Location

  const initialCitizenData = { age: "", disabilities: "", addresses: [""], phoneNumbers: [""], location: null };
  const initialVolunteerData = { addresses: [""], phoneNumbers: [""], location: null };

  // Default to citizen data initially, will be updated upon role selection or pre-fill
  const [formData, setFormData] = useState(initialCitizenData);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth context to be ready

    if (isSignedIn) {
      if (currentUser && !currentUser.onboarded) {
        setIsOpen(true);
        // Only initialize if we are at the logical start of the flow (step 0 and no type picked yet in this modal session)
        if (currentStep === 0 && !userType) {
          if (currentUser.role && (currentUser.role === 'citizen' || currentUser.role === 'volunteer')) {
            // Pre-fill if role exists from a previous attempt, and jump to step 1
            const preSelectedUserType = currentUser.role;
            setUserType(preSelectedUserType);

            let dataToLoad;
            if (preSelectedUserType === 'citizen') {
              dataToLoad = {
                ...initialCitizenData,
                age: currentUser.age || "",
                disabilities: currentUser.disabilities || "",
                addresses: currentUser.addresses?.length ? [...currentUser.addresses] : [""],
                phoneNumbers: currentUser.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [""],
                location: currentUser.location || null,
              };
            } else { // Volunteer
              dataToLoad = {
                ...initialVolunteerData,
                addresses: currentUser.addresses?.length ? [...currentUser.addresses] : [""],
                phoneNumbers: currentUser.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [""],
                location: currentUser.location || null,
              };
            }
            setFormData(dataToLoad);
            setCurrentStep(1); // Move to details step
          } else {
            // No pre-existing valid role, start fresh from role selection
            setUserType(null);
            setFormData(initialCitizenData); // Reset form data to default (citizen, then adjusted on selection)
            setCurrentStep(0);
          }
        }
      } else if (currentUser && currentUser.onboarded) {
        setIsOpen(false);
        if (onComplete) onComplete();
      } else if (!currentUser && isSignedIn) {
        // Signed in, but profile fetch failed or pending, keep modal closed.
        setIsOpen(false);
      }
    } else { // Not signed in
      setIsOpen(false);
      // Reset local state if user signs out during onboarding
      setCurrentStep(0);
      setUserType(null);
      setFormData(initialCitizenData);
    }
  }, [currentUser, isAuthLoading, isSignedIn, onComplete]); // currentStep and userType are intentionally NOT dependencies here
  // to prevent this effect from re-running on internal step/type changes.

  const closeModal = () => {
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    if (type === "citizen") {
      setFormData({
        ...initialCitizenData,
        age: currentUser?.age || "",
        disabilities: currentUser?.disabilities || "",
        addresses: currentUser?.addresses?.length ? [...currentUser.addresses] : [...initialCitizenData.addresses],
        phoneNumbers: currentUser?.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [...initialCitizenData.phoneNumbers],
        // location will be from initialCitizenData (null)
      });
    } else if (type === "volunteer") {
      setFormData({
        ...initialVolunteerData,
        addresses: currentUser?.addresses?.length ? [...currentUser.addresses] : [...initialVolunteerData.addresses],
        phoneNumbers: currentUser?.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [...initialVolunteerData.phoneNumbers],
        // location will be from initialVolunteerData (null)
      });
    }
    setCurrentStep(1);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const requestLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser."); return null;
      }
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
        });
      });
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch (error) {
      console.error("Location error:", error);
      alert("Location access denied or unavailable. You can proceed without it for now, but some features might be limited.");
      return null;
    }
  };

  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const finalLocation = await requestLocation();
    const dataToSubmit = {
      ...formData,
      location: finalLocation,
      role: userType,
    };

    dataToSubmit.phoneNumbers = dataToSubmit.phoneNumbers.filter(p => p.trim() !== "");
    dataToSubmit.addresses = dataToSubmit.addresses.filter(a => a.trim() !== "");
    if (dataToSubmit.phoneNumbers.length === 0) {
      setSubmissionError("At least one phone number is required.");
      setIsSubmitting(false);
      return;
    }
    if (dataToSubmit.addresses.length === 0) {
      setSubmissionError("At least one address/service area is required.");
      setIsSubmitting(false);
      return;
    }


    try {
      const updatedProfile = await updateUserProfile(dataToSubmit); // Get fresh profile
      setIsOpen(false);
      if (onComplete) onComplete();
      navigate(updatedProfile?.role === 'admin' ? '/admin/dashboard' : '/'); // Use role from fresh profile
    } catch (error) {
      console.error("Onboarding submission error:", error);
      setSubmissionError(error.response?.data?.message || error.message || "Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = useCallback(() => {
    if (currentStep === 0) return userType !== null; // User must select a type
    if (currentStep === 1) { // Details step
      if (!formData.phoneNumbers?.[0]?.trim() || !formData.addresses?.[0]?.trim()) {
        return false;
      }
      if (userType === 'citizen') {
        const ageValue = parseInt(formData.age, 10);
        return !isNaN(ageValue) && ageValue > 0;
      }
      return true; // Volunteer only needs phone and address (already checked)
    }
    return true; // Step 2 (Location) can always proceed
  }, [currentStep, userType, formData]);

  const nextStep = () => {
    if (!canProceedToNextStep()) return; // Should be disabled, but as a safeguard

    if (currentStep === 2) {
      handleSubmitOnboarding();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 1) { // Going from Details (step 1) to Role Selection (step 0)
      setUserType(null);
      setCurrentStep(0);
      setFormData(initialCitizenData); // Reset form data
    } else if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  if (!isOpen || isAuthLoading) return null;
  if (!isSignedIn) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome to RescueNet</h2>
                <p className="text-sm md:text-base text-gray-600">Let's set up your profile</p>
              </div>
            </div>
            <button onClick={closeModal} className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {submissionError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <WarningIcon className="w-5 h-5" /> {submissionError}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Choose Your Role</h3>
                <p className="text-gray-600">How would you like to participate?</p>
              </div>
              <div className="grid gap-4 md:gap-6">
                <button onClick={() => handleUserTypeSelect("citizen")} className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border-2 border-transparent hover:border-blue-300 transition-all duration-300 text-left shadow-sm hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg md:text-2xl font-bold text-gray-800 mb-1">I'm a Citizen</h4>
                      <p className="text-sm md:text-base text-gray-600">Receive emergency assistance and alerts.</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                <button onClick={() => handleUserTypeSelect("volunteer")} className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl border-2 border-transparent hover:border-green-300 transition-all duration-300 text-left shadow-sm hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg md:text-2xl font-bold text-gray-800 mb-1">I'm a Volunteer</h4>
                      <p className="text-sm md:text-base text-gray-600">Help others and serve your community.</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 && userType && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {userType === "citizen" ? "Your Information" : "Volunteer Details"}
                </h3>
                <p className="text-gray-600">
                  {userType === "citizen" ? "This helps us assist you better." : "Tell us how you can contribute."}
                </p>
              </div>
              {userType === "citizen" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age <span className="text-red-500">*</span></label>
                    <input type="number" value={formData.age} onChange={(e) => updateField("age", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Your age" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medical Conditions / Disabilities (Optional)</label>
                    <textarea value={formData.disabilities} onChange={(e) => updateField("disabilities", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="e.g., Diabetic, Wheelchair user" rows="2" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Numbers <span className="text-red-500">*</span></label>
                {formData.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="tel" value={phone} onChange={(e) => updateArrayField("phoneNumbers", index, e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Phone number" />
                    {formData.phoneNumbers.length > 1 && <button onClick={() => removeArrayField("phoneNumbers", index)} className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl"><Trash2 className="w-5 h-5" /></button>}
                  </div>
                ))}
                <button onClick={() => addArrayField("phoneNumbers")} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"><Plus className="w-4 h-4" /> Add Number</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {userType === "citizen" ? "Frequent Addresses" : "Service Areas"} <span className="text-red-500">*</span>
                </label>
                {formData.addresses.map((address, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="text" value={address} onChange={(e) => updateArrayField("addresses", index, e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={userType === "citizen" ? "e.g., Home, Work" : "e.g., Downtown, North Suburbs"} />
                    {formData.addresses.length > 1 && <button onClick={() => removeArrayField("addresses", index)} className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl"><Trash2 className="w-5 h-5" /></button>}
                  </div>
                ))}
                <button onClick={() => addArrayField("addresses")} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"><Plus className="w-4 h-4" /> Add {userType === "citizen" ? "Address" : "Area"}</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Enable Location Services</h3>
              <p className="text-gray-600 max-w-md mx-auto">This helps us provide accurate emergency response and connect you with nearby help. Location is requested upon completion.</p>
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800 mb-1">Privacy Note</h4>
                    <p className="text-blue-700 text-sm">Your location is used for emergency services and stored securely. It is not shared with third parties without explicit consent for an emergency.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Only show if not on the first step (role selection) */}
        {currentStep > 0 && (
          <div className="p-6 md:p-8 border-t border-gray-200/50 flex items-center justify-between">
            <button onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl transition-all">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <button onClick={nextStep} disabled={!canProceedToNextStep() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg">
              {isSubmitting ? "Saving..." : (currentStep === 2 ? <><CheckCircle className="w-5 h-5" /> Enable Location & Complete</> : <>Continue <ChevronRight className="w-5 h-5" /></>)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;