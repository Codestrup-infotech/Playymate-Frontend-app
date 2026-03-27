"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { X, ArrowLeft, MapPin, Users, ChevronDown, ChevronUp, Smile, Plus, Minus, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import postService from "@/app/user/post";
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

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "image" | "video"
  const [videoUrl, setVideoUrl] = useState(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [existingPost, setExistingPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // Crop state
 const [cropAspect, setCropAspect] = useState("4:5");

  // Edit state
  const [editTab, setEditTab] = useState("Filters");
  // Per-image filter and adjustment state - stored as array indexed by image
  const [imageEdits, setImageEdits] = useState({});
  
  // Helper to get filter for a specific image
  const getImageFilter = (index) => {
    return imageEdits[index]?.filter || "Normal";
  };
  
  // Helper to get adjustments for a specific image
  const getImageAdjustments = (index) => {
    return imageEdits[index]?.adjustments || Object.fromEntries(ADJUSTMENTS.map((a) => [a, 0]));
  };
  
  // Helper to set filter for a specific image
  const setImageFilter = (index, filter) => {
    setImageEdits((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        filter
      }
    }));
  };
  
  // Helper to set adjustments for a specific image
  const setImageAdjustments = (index, newAdjustments) => {
    setImageEdits((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        adjustments: newAdjustments
      }
    }));
  };

  // Video edit
  const [soundOn, setSoundOn] = useState(true);
  const [selectedCoverIdx, setSelectedCoverIdx] = useState(0);

  // Share state
  const [caption, setCaption] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hideLikes, setHideLikes] = useState(false);
  const [noComments, setNoComments] = useState(false);

  // Toggle button component
const ToggleButton = ({ state, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 flex items-center rounded-full p-[2px] transition duration-300 ${
        state ? "bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]  hover:bg-gradient-r hover:from-[#FF8319] hover:to-[#EF3AFF]" : "bg-gray-300"
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


  const [files, setFiles] = useState([]); // multiple images
const [currentIndex, setCurrentIndex] = useState(0);

  
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

  // Handle edit mode - load existing post for editing
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsLoadingPost(true);
      setEditingPostId(editId);
      setIsEditing(true);
      
      const fetchPost = async () => {
        try {
          const response = await postService.getPost(editId);
          const postData = response?.data?.data || response?.data;
          
          if (postData) {
            setExistingPost(postData);
            // Pre-fill caption
            setCaption(postData.content?.text || '');
            setHideLikes(!postData.allow_shares);
            setNoComments(!postData.allow_comments);
            setLocation(postData.content?.location || null);
            
            // Load media if available
            if (postData.media && postData.media.length > 0) {
              const media = postData.media[0];
              if (media.type === 'video') {
                setFileType('video');
                setVideoUrl(media.url);
                setFile(media.url);
              } else {
                setFileType('image');
                setFile(media.url);
              }
              // Set step to share since we already have the media
              setStep('share');
            }
          }
        } catch (error) {
          console.error('Error fetching post for edit:', error);
          alert('Failed to load post for editing');
          router.push('/home');
        } finally {
          setIsLoadingPost(false);
        }
      };
      
      fetchPost();
    }
  }, [searchParams]);

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
            // Try to get the most relevant location name
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
          
          // Fallback to coordinates if no address found
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
          // Fallback to coordinates if reverse geocoding fails
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
      latitude: 0, // Default placeholder - in production would use geocoding API
      longitude: 0
    });
    setShowLocationPicker(false);
    setLocationError("");
  };

  const fileInput = useRef(null);

  const handleAddMoreFiles = () => {
    // Try using the ref first
    if (fileInput.current) {
      fileInput.current.click();
      return;
    }
    // Fallback to getElementById
    const input = document.getElementById('fileInput');
    if (input) {
      input.click();
    }
  };

  const handleFile = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Check if any selected file is a video
    const hasVideo = selectedFiles.some((file) => file.type.startsWith("video/"));

    const newFiles = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setFiles((prev) => {
      const updatedFiles = [...prev, ...newFiles];
      setCurrentIndex(updatedFiles.length - 1); // show latest on top
      return updatedFiles;
    });
    
    // Set fileType - if any video is selected, set as video; otherwise image
    if (hasVideo) {
      setFileType("video");
      setVideoUrl(newFiles.find((f) => f.type === "video")?.url);
    } else {
      setFileType("image");
    }
    
    setStep("crop");
    
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
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

  // Handle posting the content
  const handleShare = async () => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      let mediaData = [];

      // Check if we're using existing media (editing mode with no new files)
      const isExistingMedia = isEditing && existingPost?.media && existingPost.media.length > 0 && 
        files.length === 0 && !file && !videoUrl;
      
      // Check if there are new files to upload (images from files array)
      const hasNewFiles = files.length > 0 && files[0]?.url?.startsWith('blob:');
      
      if (isExistingMedia) {
        // Keep existing media data
        mediaData = existingPost.media.map(m => ({
          type: m.type,
          url: m.url,
          thumbnail_url: m.thumbnail_url,
          duration: m.duration,
          width: m.width,
          height: m.height
        }));
        setUploadProgress(100);
      } else if (hasNewFiles) {
        // Upload all multiple images
        const totalFiles = files.length;
        
        for (let i = 0; i < files.length; i++) {
          const item = files[i];
          const fileToUpload = item.url;
          const fileName = item.type === 'video' ? `video_${Date.now()}_${i}.mp4` : `image_${Date.now()}_${i}.jpg`;
          const mimeType = item.type === 'video' ? 'video/mp4' : 'image/jpeg';
          
          // Get presigned URL
          setUploadProgress(20 + (i * 30 / totalFiles));
          
          const presignResponse = await postService.presignMediaUpload({
            filename: fileName,
            mimeType: mimeType,
            type: item.type
          });
          
          const { upload_url, file_url, key } = presignResponse.data.data;
          
          setUploadProgress(40 + (i * 40 / totalFiles));
          
          // Upload the file
          const fileBlob = await fetch(fileToUpload).then(r => r.blob());
          await postService.uploadToPresignedUrl(upload_url, fileBlob, mimeType);
          
          // Get image dimensions
          let width = 1920;
          let height = 1080;
          
          if (item.type === 'image') {
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = fileToUpload;
            });
            width = img.width;
            height = img.height;
          }
          
          mediaData.push({
            type: item.type,
            url: file_url,
            thumbnail_url: null,
            duration: null,
            width,
            height
          });
          
          setUploadProgress(80 + (i * 15 / totalFiles));
        }
      } else if (file || videoUrl) {
        // Single file upload (legacy support for video or single image)
        setUploadProgress(20);
        
        const fileToUpload = file || videoUrl;
        const fileName = file ? `image_${Date.now()}.jpg` : `video_${Date.now()}.mp4`;
        const mimeType = file ? "image/jpeg" : "video/mp4";
        
        // Get presigned URL
        const presignResponse = await postService.presignMediaUpload({
          filename: fileName,
          mimeType: mimeType,
          type: fileType
        });
        
        const { upload_url, file_url, key } = presignResponse.data.data;
        
        setUploadProgress(40);
        
        // Upload the file
        const fileBlob = await fetch(fileToUpload).then(r => r.blob());
        await postService.uploadToPresignedUrl(upload_url, fileBlob, mimeType);
        
        setUploadProgress(70);
        
        // Get image dimensions
        let width = 1920;
        let height = 1080;
        
        if (fileType === "image") {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = file;
          });
          width = img.width;
          height = img.height;
        }
        
        mediaData = [{
          type: fileType,
          url: file_url,
          thumbnail_url: null,
          duration: null,
          width,
          height
        }];
        
        setUploadProgress(85);
      } else if (files.length > 0) {
        // Files array has URLs but not from blob (already uploaded or external URLs)
        for (let i = 0; i < files.length; i++) {
          const item = files[i];
          
          mediaData.push({
            type: item.type,
            url: item.url,
            width: item.width || 1920,
            height: item.height || 1080,
          });
        }
        setUploadProgress(100);
      } else {
        // No files to upload - this shouldn't happen
        throw new Error('No media to upload');
      }
      
      // Extract hashtags from caption
      const hashtagRegex = /#(\w+)/g;
      const hashtags = [];
      let match;
      while ((match = hashtagRegex.exec(caption)) !== null) {
        hashtags.push(match[1]);
      }
      
      // Prepare post data
      const postData = {
        text: caption,
        media: mediaData,
        location: location,
        visibility: "public",
        allowComments: !noComments,
        allowShares: !hideLikes
      };
      
      setUploadProgress(90);
      
      let response;
      if (isEditing && editingPostId) {
        // Update existing post
        response = await postService.updatePost(editingPostId, postData);
      } else {
        // Create new post
        response = await postService.createPost(postData);
      }
      
      setUploadProgress(100);
      
      if (response.data.status === "success") {
        // Navigate to home or the new post
        router.push("/home");
      }
    } catch (error) {
      console.error(isEditing ? "Error updating post:" : "Error creating post:", error);
      alert(isEditing ? "Failed to update post. Please try again." : "Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Compute CSS filter from adjustments + selected filter for a specific image
  const getImageStyle = (imageIndex) => {
    const filter = getImageFilter(imageIndex);
    const adjustments = getImageAdjustments(imageIndex);
    const base = FILTERS.find((f) => f.name === filter)?.style?.filter || "";
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
      case "1:1":
        return { aspectRatio: "1/1" };
      case "4:5":
        return { aspectRatio: "4/5" };
      case "16:9":
        return { aspectRatio: "16/9" };
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
   src={files[currentIndex]?.url}
    style={getImageStyle(currentIndex)}
    className="absolute w-full h-full object-cover"
    alt="preview"
  />
</div>
  );

  // Determine modal size
  const isWide = step !== "upload";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div
        className={`bg-white  rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isWide ? "w-[800px] h-[520px]" : "w-[520px] h-[480px]"
        }`}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step !== "upload" && (
              <button onClick={goBack} className="hover:opacity-60 transition">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-semibold text-[15px]">
              {step === "upload" && (isEditing ? "Edit post" : "Create new post")}
              {step === "crop" && "Crop"}
              {step === "edit" && "Edit"}
              {step === "share" && (fileType === "video" ? (isEditing ? "Edit reel" : "New reel") : (isEditing ? "Edit post" : "Create new post"))}
            </h2>
          </div>

          <div className="flex items-center gap-2  ">
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
                    {isEditing ? 'Saving...' : 'Sharing...'} {uploadProgress}%
                  </>
                ) : (
                  isEditing ? "Save" : "Share"
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

          {/* Hidden file input - always rendered but hidden */}
          <input
            id="fileInput"
            type="file"
            ref={fileInput}
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleFile}
          />

          {/* UPLOAD */}
          {step === "upload" && (
            <div
              className="flex flex-col items-center justify-center w-full gap-5  "
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
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
                onClick={handleAddMoreFiles}
                className="bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]  hover:bg-gradient-r hover:from-[#FF8319] hover:to-[#EF3AFF] text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                Select from computer
              </button>
            </div>
          )}

          {/* CROP */}
          {step === "crop" && (
            <div className="flex w-full h-full">
              {/* Image area */}
              <div className="flex-1 bg-gray-100 p-3 relative flex items-center justify-center overflow-hidden">
                {/* Aspect ratio overlay popup */}
                <div className="absolute bottom-3 left-3 z-20 bg-black/90 rounded-xl p-1 flex gap-2">
                  {["1:1", "4:5", "16:9"].map((r) => (
                    <button
                      key={r}
                 onClick={() => {
  setCropAspect(r);
  setShowAspectLabel(true);
}}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                        cropAspect === r ? "bg-white/30" : "hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`border-2 border-white ${
                          r === "1:1" ? "w-6 h-6" : r === "4:5" ? "w-5 h-6" : "w-8 h-5"
                        } rounded-sm`}
                      />
                      <span className="text-white text-[10px] font-medium">{r}</span>
                    </button>
                  ))}
                </div>

                {/* Image container with aspect ratio */}
      <div className="w-full h-full flex items-center justify-center">
  <div
    style={getAspectRatioStyle()}
    className="relative overflow-hidden w-full max-w-[400px]"
  >
    {/* Aspect ratio label */}
    {showAspectLabel && (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-30">
        {cropAspect}
      </div>
    )}

    {/* MULTI IMAGE STACK */}
    <div className="relative w-full h-full flex items-center justify-center">
      {files.map((item, index) => {
        const isActive = index === currentIndex;

        return (
          <img
            key={index}
            src={item.url}
            style={getImageStyle(index)}
            className={`absolute w-full h-full object-cover transition-all duration-300 ${
              isActive
                ? "z-20 scale-100 opacity-100"
                : "z-10 scale-95 opacity-60 translate-x-2"
            }`}
            alt="preview"
          />
        );
      })}
    </div>

    {/* LEFT ARROW */}
    {currentIndex > 0 && (
      <button
        onClick={() => setCurrentIndex((prev) => prev - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center z-40"
      >
        {"<"}
      </button>
    )}

    {/* RIGHT ARROW */}
    {currentIndex < files.length - 1 && (
      <button
        onClick={() => setCurrentIndex((prev) => prev + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center z-40"
      >
        {">"}
      </button>
    )}
  </div>
</div>

                {/* Bottom toolbar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                  {/* Image counter and thumbnails */}
                  <div className="flex items-center gap-2">
                   
                    
                    {/* Thumbnail strip */}
                    {files.length > 1 && (
                      <div className="flex items-center gap-1 bg-black/60 rounded-full p-1">
                        {files.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-7 h-7 rounded-full overflow-hidden transition ${
                              idx === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                            {idx === currentIndex && (
                              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#0095f6] rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                                {idx + 1}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add more / delete */}
                  <div className="flex items-center gap-2">
                    {/* Add more images button */}
                    <button
                      onClick={handleAddMoreFiles}
                      className="bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-black/80 transition"
                    >
                      <Plus size={16} />
                    </button>
                    
                    {/* Delete current image */}
                    {files.length > 1 && (
                      <button
                        onClick={() => {
                          const newFiles = files.filter((_, idx) => idx !== currentIndex);
                          setFiles(newFiles);
                          setCurrentIndex(Math.min(currentIndex, newFiles.length - 1));
                        }}
                        className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-red-500 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                        </svg>
                      </button>
                    )}
                    
                  
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT — Image */}
          {step === "edit" && fileType === "image" && (
            <div className="flex w-full h-full ">
              <div className="flex-1 bg-white p-3 relative flex items-center justify-center overflow-hidden ">
                {/* Navigation arrows */}
                {files.length > 1 && (
                  <>
                    {/* Left arrow */}
                    {currentIndex > 0 && (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition z-20"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6" />
                        </svg>
                      </button>
                    )}
                    {/* Right arrow */}
                    {currentIndex < files.length - 1 && (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition z-20"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6" />
                        </svg>
                      </button>
                    )}
                    {/* Image counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 z-20">
                      <span>{currentIndex + 1}</span>/<span>{files.length}</span>
                    </div>
                  </>
                )}
                
                <div style={getAspectRatioStyle()} className="flex items-center justify-center bg-gray-100 max-w-full max-h-full">
                  <img src={files[currentIndex]?.url} style={getImageStyle(currentIndex)} className="max-h-full max-w-full object-contain" alt="edit" />
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
                          onClick={() => setImageFilter(currentIndex, f.name)}
                          className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition ${
                            getImageFilter(currentIndex) === f.name ? "ring-2 ring-[#0095f6]" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-100">
                            <img
                             src={files[currentIndex]?.url}
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
                            <span className="text-gray-400">{getImageAdjustments(currentIndex)[item]}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={getImageAdjustments(currentIndex)[item]}
                            onChange={(e) => {
                              const newAdjustments = { ...getImageAdjustments(currentIndex), [item]: Number(e.target.value) };
                              setImageAdjustments(currentIndex, newAdjustments);
                            }}
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
                {fileType === "video" ? (
                  <video src={videoUrl} className="max-h-full max-w-full object-contain" autoPlay loop muted />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Multiple images carousel */}
                    {files.length > 1 ? (
                      <>
                        <img 
                          src={files[currentIndex]?.url} 
                          style={getImageStyle(currentIndex)} 
                          className="max-h-full max-w-full object-contain" 
                          alt="share" 
                        />
                        {/* Left arrow */}
                        {currentIndex > 0 && (
                          <button
                            onClick={() => setCurrentIndex((prev) => prev - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15,18 9,12 15,6" />
                            </svg>
                          </button>
                        )}
                        {/* Right arrow */}
                        {currentIndex < files.length - 1 && (
                          <button
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,18 15,12 9,6" />
                            </svg>
                          </button>
                        )}
                        {/* Image counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <span>{currentIndex + 1}</span>/<span>{files.length}</span>
                        </div>
                      </>
                    ) : (
                      <img src={files[currentIndex]?.url} style={getImageStyle(currentIndex)} className="max-h-full max-w-full object-contain" alt="share" />
                    )}
                  </div>
                )}
               
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

                {/* Caption */}
                <div className="px-4 py-3 border-b border-gray-100">
               <textarea
  value={caption}
  onChange={(e) => setCaption(e.target.value)}
  placeholder="Write a caption..."
  maxLength={600}
  className="w-full resize-none text-sm outline-none placeholder:text-gray-400 min-h-[10px]"
/>
<div className="flex items-center justify-between mt-2">
  <button className="text-gray-400 hover:text-gray-600 transition">
    <Smile size={20} />
  </button>
  <span className="text-xs text-gray-400">{caption.length}/600</span>
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
                {/* Advanced settings */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-[#262626]">Advanced settings</span>
                    {advancedOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                  </button>

                  {advancedOpen && (
                    <div className="px-4 pb-4 space-y-4">
                    {/* Allow Comments Toggle */}
{/* Allow Comments Toggle */}
<div className="flex items-center justify-between">
  <div className="flex flex-col">
    <span className="text-sm text-[#262626]">Allow comments</span>
    <span className="text-xs text-gray-500">
      {!noComments
        ? "People can comment on your post"
        : "No one can comment on your post"}
    </span>
  </div>
  <ToggleButton
    state={!noComments}
    onChange={() => setNoComments(prev => !prev)}
  />
</div>

{/* Allow Shares Toggle */}
<div className="flex items-center justify-between">
  <div className="flex flex-col">
    <span className="text-sm text-[#262626]">Allow shares</span>
    <span className="text-xs text-gray-500">
      {!hideLikes
        ? "People can share your post"
        : "No one can share your post"}
    </span>
  </div>
  <ToggleButton
    state={!hideLikes}
    onChange={() => setHideLikes(prev => !prev)}
  />
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
                className="w-full py-2.5 bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]  hover:bg-gradient-r hover:from-[#FF8319] hover:to-[#EF3AFF] text-white rounded-lg text-sm font-semibold transition"
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

// Wrapper component with Suspense boundary for useSearchParams
export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <Loader2 className="animate-spin mx-auto" size={32} />
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <CreatePostContent />
    </Suspense>
  );
}
