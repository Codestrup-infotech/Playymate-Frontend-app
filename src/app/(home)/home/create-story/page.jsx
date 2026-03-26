"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ArrowLeft, MapPin, Users, ChevronDown, ChevronUp, Smile, Plus, Minus, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { presignStoryUpload, createStory } from "@/app/user/homefeed";
import { userService } from "@/services/user";

// ---- Filters list ----
const FILTERS = [
  { name: "Normal", style: {} },
  { name: "Clarendon", style: { filter: "contrast(1.2) saturate(1.35)" } },
  { name: "Gingham", style: { filter: "brightness(1.05) hue-rotate(-10deg)" } },
  { name: "Moon", style: { filter: "grayscale(1) contrast(1.1) brightness(1.1)" } },
  { name: "Lark", style: { filter: "contrast(0.9) brightness(1.1) saturate(1.1)" } },
  { name: "Reyes", style: { filter: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" } },
  { name: "Juno", style: { filter: "saturate(1.4) contrast(1.1)" } },
  { name: "Slumber", style: { filter: "saturate(0.66) brightness(1.05)" } },
];

// ---- Adjustment Sliders ----
const ADJUSTMENTS = ["Brightness", "Contrast", "Fade", "Saturation", "Temperature", "Vignette", "Highlights", "Shadows"];

export default function CreateStoryPage() {
  const router = useRouter();

  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "image" | "video"
  const [videoUrl, setVideoUrl] = useState(null);

  // Crop state
  const [cropAspect, setCropAspect] = useState("9:16");

  // Edit state
  const [editTab, setEditTab] = useState("Filters");
  const [selectedFilter, setSelectedFilter] = useState("Normal");
  const [adjustments, setAdjustments] = useState(
    Object.fromEntries(ADJUSTMENTS.map((a) => [a, 0]))
  );

  // Video edit
  const [soundOn, setSoundOn] = useState(true);
  const [selectedCoverIdx, setSelectedCoverIdx] = useState(0);

  // Share state
  const [caption, setCaption] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Visibility: 'public' or 'close_friends' (default: public)
  const [visibility, setVisibility] = useState("public");
  
  // Allow comments and shares (default: true - enabled)
  const [allowComments, setAllowComments] = useState(true);
  const [allowShares, setAllowShares] = useState(true);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  
  const [showSizeChange, setShowSizeChange] = useState(false);

  const [showAspectLabel, setShowAspectLabel] = useState(false);

  // User info
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  


  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState([]);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [loadingMentions, setLoadingMentions] = useState(false);

  // Mention overlays with positions
  const [mentionOverlays, setMentionOverlays] = useState([]);

  useEffect(() => {
    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        const response = await userService.getMe();
        const data = response?.data?.data || response?.data;
        if (data) {
          setUserInfo({
            username: data.username || data.full_name || 'user',
            profileImage: data.profile_image_url
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch followers and following when mentions section is opened
  useEffect(() => {
    if (showMentions && mentionUsers.length === 0) {
      const fetchFollowersFollowing = async () => {
        setLoadingMentions(true);
        try {
          const meRes = await userService.getMe();
          const meData = meRes?.data?.data || meRes?.data;
          
          console.log("User data response:", meRes);
          
          if (meData && meData._id) {
            // Try to get followers and following from getMe response first
            let followersData = meData?.followers || meData?.follower_list || meData?.followers_list || [];
            let followingData = meData?.following || meData?.following_list || meData?.following_list || [];
            
            console.log("Followers:", followersData);
            console.log("Following:", followingData);
            
            // If no data from getMe, fetch separately
            if ((!followersData || followersData.length === 0) && (!followingData || followingData.length === 0)) {
              try {
                const [followersRes, followingRes] = await Promise.all([
                  userService.getFollowers(meData._id, 100, null),
                  userService.getFollowing(meData._id, 100, null)
                ]);
                
                followersData = followersRes?.data?.data?.items || followersRes?.data?.data || followersRes?.data || [];
                followingData = followingRes?.data?.data?.items || followingRes?.data?.data || followingRes?.data || [];
                
                console.log("Followers from API:", followersData);
                console.log("Following from API:", followingData);
              } catch (apiErr) {
                console.error("Error fetching followers/following:", apiErr);
              }
            }
            
            // Combine and remove duplicates
            const allUsers = [...followersData, ...followingData];
            const uniqueUsers = allUsers.filter((user, index, self) => {
              return index === self.findIndex((u) => u._id === user._id);
            });
            
            console.log("Unique users:", uniqueUsers);
            setMentionUsers(uniqueUsers);
          }
        } catch (error) {
          console.error("Error fetching mentions data:", error);
        } finally {
          setLoadingMentions(false);
        }
      };
      
      fetchFollowersFollowing();
    }
  }, [showMentions]);

  // Handle selecting a mention - add overlay with position
  const handleSelectMention = (user) => {
    if (!selectedMentions.find(m => m._id === user._id)) {
      const newMention = {
        ...user,
        // Position based on number of mentions (cascade from top-right)
        position: { 
          x: 30 + (selectedMentions.length * 15), 
          y: 50 - (selectedMentions.length * 10) 
        }
      };
      setSelectedMentions([...selectedMentions, newMention]);
    }

    setShowMentions(false);
    setMentionSearch("");
  };

  // Handle removing a mention - also remove from overlays
  const handleRemoveMention = (userId) => {
    setSelectedMentions(selectedMentions.filter(m => m._id !== userId));
  };

  // Handle getting current location via geolocation API
  const handleGetCurrentLocation = () => {
    setLocationError("");
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get human-readable address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'PlayymateApp/1.0'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }
          
          const data = await response.json();
          
          // Build human-readable address
          let displayText = "";
          const address = data.address;
          
          if (address) {
            const parts = [];
            
            if (address.neighbourhood && address.neighbourhood !== address.city) {
              parts.push(address.neighbourhood);
            }
            if (address.suburb && address.suburb !== address.city) {
              parts.push(address.suburb);
            }
            if (address.city || address.town || address.village) {
              parts.push(address.city || address.town || address.village);
            }
            if (address.state) {
              parts.push(address.state);
            }
            
            displayText = parts.join(", ");
          }
          
          if (!displayText) {
            displayText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          setLocation({
            display_text: displayText,
            latitude: latitude,
            longitude: longitude
          });
          setLocationInput(displayText);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          const displayText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation({
            display_text: displayText,
            latitude: latitude,
            longitude: longitude
          });
          setLocationInput(displayText);
        }
        
        setIsGettingLocation(false);
        setShowLocationPicker(false);
      },
      (error) => {
        let errorMessage = "Unable to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  
  // Handle manual location entry
  const handleLocationSubmit = () => {
    if (!locationInput.trim()) {
      setLocationError("Please enter a location");
      return;
    }
    
    setLocation({
      display_text: locationInput.trim(),
      latitude: 0,
      longitude: 0
    });
    setShowLocationPicker(false);
    setLocationError("");
  };

  const fileInput = useRef();

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    // Validate file type
   // Allow all file types
if (!selected.type) {
  setError("Invalid file");
  return;
}
    
    // Validate file size (max 50MB for stories)
    if (selected.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }
    
    setError(null);
    const isVideo = selected.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");
    if (isVideo) {
      setVideoUrl(URL.createObjectURL(selected));
      setFile(null);
    } else {
      setFile(URL.createObjectURL(selected));
      setVideoUrl(null);
    }
    setStep("crop");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    
    // Allow all file types but still validate existence
if (!dropped || dropped.size === 0) {
  setError("Invalid file");
  return;
}
    
    // Validate file size (max 50MB for stories)
    if (dropped.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }
    
    setError(null);
    const isVideo = dropped.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");
    if (isVideo) {
      setVideoUrl(URL.createObjectURL(dropped));
      setFile(null);
    } else {
      setFile(URL.createObjectURL(dropped));
      setVideoUrl(null);
    }
    setStep("crop");
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const closeModal = () => router.push("/home");

  const goBack = () => {
    if (step === "crop") setStep("upload");
    if (step === "edit") setStep("crop");
    if (step === "share") setStep("edit");
  };

  // Handle sharing the story
  const handleShare = async () => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      let fileToUpload = file || videoUrl;
      let fileName = file ? `story_image_${Date.now()}.jpg` : `story_video_${Date.now()}.mp4`;
      let mimeType = file ? "image/jpeg" : "video/mp4";
      let sizeBytes = fileToUpload ? (file?.size || videoUrl?.size || 0) : 0;
      
      setUploadProgress(20);
      
      // If it's an image and has filter/adjustments, apply them before uploading
      if (file && (selectedFilter !== "Normal" || Object.values(adjustments).some(v => v !== 0))) {
        console.log("[CreateStory] Applying filter to image before upload...");
        const filteredBlob = await applyFilterToImage(file, selectedFilter, adjustments);
        
        if (filteredBlob) {
          // Create a File object from the blob
          const filteredFile = new File([filteredBlob], fileName, { type: mimeType });
          fileToUpload = URL.createObjectURL(filteredBlob);
          sizeBytes = filteredBlob.size;
          console.log("[CreateStory] Filter applied, new size:", sizeBytes);
        }
      }
      
      // Get presigned URL
      const presignData = await presignStoryUpload(fileName, mimeType, sizeBytes, "story");
      
      if (!presignData?.upload_url) {
        throw new Error("Failed to get upload URL");
      }
      
      const { upload_url, file_url } = presignData;
      
      setUploadProgress(40);
      
      // Upload the file (filtered or original)
      const fileBlob = await fetch(fileToUpload).then(r => r.blob());
      
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: fileBlob,
        headers: {
          'Content-Type': mimeType,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }
      
      setUploadProgress(70);
      
      // Create the story record in the database
    const storyData = {
  media_url: file_url,
  media_type: fileType,
  caption: caption || "",
  location: location,
  mentions: selectedMentions.map(m => m._id),
  visibility: visibility,
  allow_comments: allowComments,
  allow_shares: allowShares,

  // ✅ ADD THIS
  filter: selectedFilter,
  adjustments: adjustments,

  overlays: selectedMentions.map((user) => ({
    type: "mention",
    content: "@" + (user.username || user.full_name?.toLowerCase().replace(/\s+/g, "_") || ""),
    user_id: user._id,
    position: user.position || { x: 30, y: 50 }
  }))
};
      
      console.log("[CreateStory] Creating story with data:", storyData);
      
      const createdStory = await createStory(storyData);
      
      console.log("[CreateStory] Create story response:", createdStory);
      
      setUploadProgress(100);
      
      // Navigate back to home on success
      router.push("/home?storyUploaded=true");
    } catch (err) {
      console.error("[CreateStory] Upload error:", err);
      setError(err.message || "Failed to upload story. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Apply filter to image using canvas before upload - bakes filter into the image
  const applyFilterToImage = async (imageUrl, filter, adjustments) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Filter map matching the UI filters
        const FILTER_MAP = {
          Normal: "",
          Clarendon: "contrast(1.2) saturate(1.35)",
          Gingham: "brightness(1.05) hue-rotate(-10deg)",
          Moon: "grayscale(1) contrast(1.1) brightness(1.1)",
          Lark: "contrast(0.9) brightness(1.1) saturate(1.1)",
          Reyes: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)",
          Juno: "saturate(1.4) contrast(1.1)",
          Slumber: "saturate(0.66) brightness(1.05)"
        };
        
        // Calculate adjustment values
        const b = 1 + (adjustments?.Brightness || 0) / 100;
        const c = 1 + (adjustments?.Contrast || 0) / 100;
        const s = 1 + (adjustments?.Saturation || 0) / 100;
        const fade = 1 - Math.max(0, adjustments?.Fade || 0) / 200;
        
        // Combine all filters
        const filterString = `brightness(${b}) contrast(${c}) saturate(${s}) opacity(${fade}) ${FILTER_MAP[filter] || ""}`;
        
        // Apply filter
        ctx.filter = filterString;
        
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.95);
      };
      img.onerror = () => {
        // If image fails to load, return null
        resolve(null);
      };
      img.src = imageUrl;
    });
  };

  // Compute CSS filter from adjustments + selected filter
  const getImageStyle = () => {
    const base = FILTERS.find((f) => f.name === selectedFilter)?.style?.filter || "";
    const b = 1 + adjustments["Brightness"] / 100;
    const c = 1 + adjustments["Contrast"] / 100;
    const s = 1 + adjustments["Saturation"] / 100;
    const fade = `opacity(${1 - Math.max(0, adjustments["Fade"]) / 200})`;
    const combined = `brightness(${b}) contrast(${c}) saturate(${s}) ${fade} ${base}`;
    return { filter: combined.trim() };
  };

  // Get aspect ratio style for crop preview
  const getAspectRatioStyle = () => {
  switch (cropAspect) {
    case "16:9":
      return { aspectRatio: "16/9" };
    case "1:1":
      return { aspectRatio: "1/1" };
    case "4:5":
      return { aspectRatio: "4/5" };
    case "9:16":
      return { aspectRatio: "9/16" };
    default:
      return {};
  }
};

  const mediaEl = fileType === "video" ? (
    <video src={videoUrl} className="max-h-full max-w-full object-contain" autoPlay loop muted={!soundOn} />
  ) : (
  <div
  style={getAspectRatioStyle()}
  className="relative bg-black overflow-hidden"
>
  <img
    src={file}
    style={getImageStyle()}
    className="absolute w-full h-full object-cover"
    alt="preview"
  />
</div>
  );

  // Determine modal size
  const isWide = step !== "upload";



  const ToggleButton = ({ state, setState }) => {
  return (
    <button
      onClick={() => setState((prev) => !prev)}
      className={`w-11 h-6 flex items-center rounded-full p-[2px] transition duration-300 ${
        state ? "bg-[#0095f6]" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ${
          state ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};


  return (
    <div className="fixed inset-0 z-50 bg-black/70 lg:flex items-center justify-center">
      <div
        className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isWide ? "  lg:w-[700px] lg:h-[540px]" : "lg:w-[520px] lg:h-[480px]"
        }`}
      >
        {/* ── HEADER ── */}
        <div className="lg:flex items-center justify-between border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="lg:flex items-center gap-3">
            {step !== "upload" && (
              <button onClick={goBack} className="hover:opacity-60 transition">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-semibold text-[15px]">
              {step === "upload" && "Create new story"}
              {step === "crop" && "Crop"}
              {step === "edit" && "Edit"}
              {step === "share" && (fileType === "video" ? "New reel" : "Create new story")}
            </h2>
          </div>

          <div className="lg:flex items-center gap-2">
            {step === "crop" && (
              <button onClick={() => setStep("edit")} className="text-[#0095f6] font-semibold text-sm hover:text-blue-800">
                Next
              </button>
            )}
            {step === "edit" && (
              <button onClick={() => setStep("share")} className="text-[#0095f6] font-semibold text-sm hover:text-blue-800">
                Next
              </button>
            )}
            {step === "share" && (
              <button 
                onClick={handleShare} 
                disabled={isUploading}
                className="text-[#0095f6] font-semibold text-sm hover:text-blue-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sharing... {uploadProgress}%
                  </>
                ) : (
                  "Share"
                )}
              </button>
            )}
            {step === "upload" && (
              <button onClick={closeModal} className="hover:opacity-60 transition">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex flex-1 min-h-0">

          {/* UPLOAD */}
          {step === "upload" && (
            <div
              className="flex flex-col items-center justify-center w-full gap-5"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {/* Error Message */}
              {error && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 max-w-md">
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              )}
              
              {/* Icon */}
              <div className="flex items-end gap-[-8px]">
                <svg width="80" height="80" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="18" width="52" height="44" rx="4" stroke="#262626" strokeWidth="3.5" fill="white"/>
                  <circle cx="22" cy="34" r="5" stroke="#262626" strokeWidth="3"/>
                  <polyline points="6,50 22,35 38,50 50,40 58,48" stroke="#262626" strokeWidth="3" fill="none" strokeLinejoin="round"/>
                  <rect x="44" y="36" width="44" height="38" rx="4" stroke="#262626" strokeWidth="3.5" fill="white"/>
                  <polygon points="56,42 80,55 56,68" fill="#262626"/>
                </svg>
              </div>
              <p className="text-[#262626] text-[18px] font-light">Drag photos and videos here</p>
              <button
                onClick={() => fileInput.current.click()}
                className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                Select from computer
              </button>
              <input type="file" ref={fileInput} className="hidden" accept="image/*,video/*" onChange={handleFile} />
<p className="text-xs text-gray-400">
  Supported all file types (max 50MB)
</p>
            </div>
          )}

          {/* CROP */}
          {step === "crop" && (
            <div className="flex w-full h-full">
              {/* Image area */}
              <div className="flex-1  p-3 relative flex items-center justify-center overflow-hidden">
               

              {/* Image container with aspect ratio */}
<div className="w-full h-full flex flex-col items-center justify-center relative">

  {/* IMAGE CONTAINER */}
  <div
    style={getAspectRatioStyle()}
    className="relative overflow-hidden h-full max-h-[500px]"
  >
    {/* Aspect ratio label */}
    {showAspectLabel && (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-20">
        {cropAspect}
      </div>
    )}

    {/* Image / Video */}
    {fileType === "video" ? (
      <video
        src={videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
      />
    ) : (
      <img
        src={file}
        style={getImageStyle()}
        className="w-full h-full object-cover"
        alt="preview"
      />
    )}
  </div>

  {/* ✅ FIXED BUTTONS (BOTTOM CENTER) */}
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/70 rounded-xl px-4 py-2 flex gap-4">
    {["16:9", "1:1", "4:5", "9:16"].map((r) => (
      <button
        key={r}
        onClick={() => {
          setCropAspect(r);
          setShowAspectLabel(true);
        }}
        className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition ${
          cropAspect === r ? "bg-white/30" : "hover:bg-white/10"
        }`}
      >
        <div
          className={`border-2 border-white ${
            r === "16:9"
              ? "w-7 h-4"
              : r === "1:1"
              ? "w-6 h-6"
              : r === "4:5"
              ? "w-5 h-6"
              : "w-4 h-7"
          } rounded-sm`}
        />
        <span className="text-white text-[10px] font-medium">{r}</span>
      </button>
    ))}
  </div>

</div>

              
              </div>
            </div>
          )}

          {/* EDIT — Image */}
          {step === "edit" && fileType === "image" && (
            <div className="flex w-full h-full">
              <div className="flex-1 bg-white p-3 flex items-center justify-center overflow-hidden">
                <div style={getAspectRatioStyle()} className="flex items-center justify-center  max-w-full max-h-full">
                  <img src={file} style={getImageStyle()} className="max-h-full max-w-full object-contain" alt="edit" />
                </div>
              </div>

              <div className="w-[340px] border-l border-gray-200 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                  {["Filters", "Adjustments"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEditTab(tab)}
                      className={`flex-1 py-3 text-sm font-medium transition ${
                        editTab === tab
                          ? "text-[#262626] border-b-2 border-[#262626]"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Filters tab */}
                  {editTab === "Filters" && (
                    <div className="p-3 grid grid-cols-3 gap-3">
                      {FILTERS.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setSelectedFilter(f.name)}
                          className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition ${
                            selectedFilter === f.name ? "ring-2 ring-[#0095f6]" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={file}
                              style={f.style}
                              className="w-full h-full object-cover"
                              alt={f.name}
                            />
                          </div>
                          <span className="text-[11px] text-gray-700">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Adjustments tab */}
                  {editTab === "Adjustments" && (
                    <div className="p-5 space-y-5">
                      {ADJUSTMENTS.map((item) => (
                        <div key={item}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#262626] font-medium">{item}</span>
                            <span className="text-gray-400">{adjustments[item]}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={adjustments[item]}
                            onChange={(e) =>
                              setAdjustments((prev) => ({ ...prev, [item]: Number(e.target.value) }))
                            }
                            className="w-full accent-[#262626] h-[3px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EDIT — Video */}
          {step === "edit" && fileType === "video" && (
            <div className="flex w-full h-full">
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                <div style={getAspectRatioStyle()} className="flex items-center justify-center bg-gray-900 max-w-full max-h-full">
                  <video
                    src={videoUrl}
                    className="max-h-full max-w-full object-contain"
                    autoPlay
                    loop
                    muted={!soundOn}
                  />
                </div>
              </div>

              <div className="w-[340px] border-l border-gray-200 overflow-y-auto p-5 space-y-6">
                {/* Cover photo */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-[#262626]">Cover photo</span>
                    <button className="text-[#0095f6] text-sm font-semibold">Select from computer</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCoverIdx(i)}
                        className={`flex-shrink-0 w-[70px] h-[70px] rounded-md overflow-hidden bg-gray-200 border-2 transition ${
                          selectedCoverIdx === i ? "border-[#0095f6]" : "border-transparent"
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-orange-300 to-blue-500 flex items-center justify-center text-white font-bold">
                          {39 + i * 17}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trim */}
                <div>
                  <span className="font-semibold text-sm text-[#262626] block mb-3">Trim</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-shrink-0 w-[70px] h-[54px] rounded bg-gray-200 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-blue-400 flex items-center justify-center text-gray-700 font-semibold text-xs">
                          {39 + i * 17}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Timeline */}
                  <div className="flex items-center mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
                      <div className="absolute left-0 right-0 h-full bg-gray-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0s</span>
                    <span>3s</span>
                    <span>6s</span>
                  </div>
                </div>

                {/* Sound on */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#262626]">Sound on</span>
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${soundOn ? "bg-[#0095f6]" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        soundOn ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SHARE */}
          {step === "share" && (
            <div className="flex w-full h-full">
              {/* Media preview */}
              <div className="flex-1 bg-white p-3 relative flex items-center justify-center overflow-hidden">
                <div className="relative">
                  {fileType === "video" ? (
                    <video src={videoUrl} className="max-h-full max-w-full object-contain" autoPlay loop muted />
                  ) : (
                    <img src={file} style={getImageStyle()} className="max-h-full max-w-full object-contain" alt="share" />
                  )}
                  
                  {/* Mention Overlays Display */}
                  {selectedMentions.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {selectedMentions.map((user, index) => (
                        <div
                          key={user._id}
                          className="absolute flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full"
                          style={{
                            left: `${user.position?.x || 30 + (index * 15)}%`,
                            top: `${user.position?.y || 50 - (index * 10)}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <span className="text-white text-xs font-medium">
                            @{user.username || user.full_name?.toLowerCase().replace(/\s+/g, "_") || ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="w-[380px] border-l border-gray-200 overflow-y-auto">
                {/* User row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {userInfo?.profileImage ? (
                        <img src={userInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#262626]">{userInfo?.username || 'user'}</span>
                </div>

                {/* Selected mentions display */}
                {selectedMentions.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap gap-2">
                    {selectedMentions.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-1 bg-[#0095f6]/10 text-[#0095f6] px-2 py-1 rounded-full text-sm"
                      >
                        <span>@{user.username || user.full_name}</span>
                        <button
                          onClick={() => handleRemoveMention(user._id)}
                          className="hover:bg-[#0095f6]/20 rounded-full p-0.5"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caption */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
maxLength={50}
                    className="w-full resize-none text-sm outline-none placeholder:text-gray-400 min-h-[30px]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button className="text-gray-400 hover:text-gray-600 transition">
                      <Smile size={20} />
                    </button>
                  <span className="text-xs text-gray-400">
  {caption.length}/50
</span>
                  </div>
                </div>

                {/* Add location */}
                <div 
                  onClick={() => setShowLocationPicker(true)}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  {location ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#0095f6]" />
                      <span className="text-sm text-[#262626]">{location.display_text}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(null);
                        }}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-[#262626]">Add location</span>
                      <MapPin size={18} className="text-gray-500" />
                    </>
                  )}
                </div>

            {/* Add mention in story */}
<div className="border-b border-gray-100">
  <button
    onClick={() => setShowMentions((prev) => !prev)}
    className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50"
  >
    <span className="text-sm text-[#262626]">Add mention in story</span>

    {showMentions ? (
      <ChevronUp size={18} className="text-gray-500" />
    ) : (
      <ChevronDown size={18} className="text-gray-500" />
    )}
  </button>

  {showMentions && (
    <div className="px-4 pb-4">
      {/* Search box */}
      <input
        type="text"
        value={mentionSearch}
        onChange={(e) => setMentionSearch(e.target.value)}
        placeholder="Search user..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0095f6]"
      />

      {/* Loading state */}
      {loadingMentions ? (
        <div className="mt-3 flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0095f6] rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Result list - show only 2 users visible, rest under scroll */
        <div className="mt-3 max-h-[150px] overflow-y-auto">
          {mentionUsers
            .filter((u) => {
              const name = u.full_name || u.username || "";
              return name.toLowerCase().includes(mentionSearch.toLowerCase());
            })
            .slice(0, 2)   // ✅ ONLY 2 USERS
            .map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                onClick={() => handleSelectMention(user)}
              >
                <img
                  src={user.profile_image_url || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover"
                  alt={user.full_name || user.username}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-[#262626]">{user.full_name || user.username}</span>
                  {user.username && user.username !== user.full_name && (
                    <span className="text-xs text-gray-500">@{user.username}</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )}
</div>

               

              {/* Advanced settings */}
<div className="border-b border-gray-100">
  <button
    onClick={() => setAdvancedOpen(!advancedOpen)}
    className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50"
  >
    <span className="text-sm font-semibold text-[#262626]">Advanced settings</span>
    {advancedOpen ? (
      <ChevronUp size={18} className="text-gray-500" />
    ) : (
      <ChevronDown size={18} className="text-gray-500" />
    )}
  </button>

  {advancedOpen && (
    <div className="px-4 pb-4 space-y-5">

      {/* Visibility Toggle - Public vs Close Friends */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-[#262626]">Visibility</span>
          <span className="text-xs text-gray-500">
            {visibility === "public" ? "Public - Anyone can view" : "Close Friends - Only close friends can view"}
          </span>
        </div>
        <button
          onClick={() => setVisibility(visibility === "public" ? "close_friends" : "public")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            visibility === "close_friends" 
              ? "bg-green-500 text-white" 
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {visibility === "public" ? "Public" : "Close Friends"}
        </button>
      </div>

      {/* Allow Comments Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-[#262626]">Allow comments</span>
          <span className="text-xs text-gray-500">
            {allowComments ? "People can reply to your story" : "No one can reply to your story"}
          </span>
        </div>
        <ToggleButton state={allowComments} setState={setAllowComments} />
      </div>

      {/* Allow Shares Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-[#262626]">Allow shares</span>
          <span className="text-xs text-gray-500">
            {allowShares ? "People can share your story" : "No one can share your story"}
          </span>
        </div>
        <ToggleButton state={allowShares} setState={setAllowShares} />
      </div>

    </div>
  )}
</div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-[15px]">Add location</h3>
              <button 
                onClick={() => {
                  setShowLocationPicker(false);
                  setLocationError("");
                }}
                className="hover:opacity-60 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Search input */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Search location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter location name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0095f6]"
                    onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit()}
                  />
                </div>
              </div>
              
              {/* Error message */}
              {locationError && (
                <p className="text-red-500 text-sm">{locationError}</p>
              )}
              
              {/* Current location button */}
              <button
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-[#262626] hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                    Use current location
                  </>
                )}
              </button>
              
              {/* Submit button */}
              <button
                onClick={handleLocationSubmit}
                className="w-full py-2.5 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg text-sm font-semibold transition"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
