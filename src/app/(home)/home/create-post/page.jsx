"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ArrowLeft, MapPin, Users, ChevronDown, ChevronUp, Smile, Plus, Minus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function CreatePostPage() {
  const router = useRouter();

  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "image" | "video"
  const [videoUrl, setVideoUrl] = useState(null);

  // Crop state
  const [cropAspect, setCropAspect] = useState("1:1");

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
  const [hideLikes, setHideLikes] = useState(false);
  const [noComments, setNoComments] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // User info
  const [userInfo, setUserInfo] = useState(null);
  
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

  const fileInput = useRef();

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
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
      
      // If there's a file, upload it first
      if (file || videoUrl) {
        setUploadProgress(20);
        
        // For now, we'll use the local URL as a placeholder
        // In production, you would upload to presigned URL
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
      }
      
      // Extract hashtags from caption
      const hashtagRegex = /#(\w+)/g;
      const hashtags = [];
      let match;
      while ((match = hashtagRegex.exec(caption)) !== null) {
        hashtags.push(match[1]);
      }
      
      // Create the post
      const postData = {
        text: caption,
        media: mediaData,
        location: location,
        visibility: "public",
        allowComments: !noComments,
        allowShares: !hideLikes
      };
      
      setUploadProgress(90);
      
      const response = await postService.createPost(postData);
      
      setUploadProgress(100);
      
      if (response.data.status === "success") {
        // Navigate to home or the new post
        router.push("/home");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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

  const mediaEl = fileType === "video" ? (
    <video src={videoUrl} className="max-h-full max-w-full object-contain" autoPlay loop muted={!soundOn} />
  ) : (
    <img src={file} style={getImageStyle()} className="max-h-full max-w-full object-contain" alt="preview" />
  );

  // Determine modal size
  const isWide = step !== "upload";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div
        className={`bg-white  rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isWide ? "w-[940px] h-[520px]" : "w-[520px] h-[480px]"
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
              {step === "upload" && "Create new post"}
              {step === "crop" && "Crop"}
              {step === "edit" && "Edit"}
              {step === "share" && (fileType === "video" ? "New reel" : "Create new post")}
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
                onClick={() => fileInput.current.click()}
                className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                Select from computer
              </button>
              <input type="file" ref={fileInput} className="hidden" accept="image/*,video/*" onChange={handleFile} />
            </div>
          )}

          {/* CROP */}
          {step === "crop" && (
            <div className="flex w-full h-full">
              {/* Image area */}
              <div className="flex-1 bg-white  p-3 relative flex items-center justify-center overflow-hidden">
                {mediaEl}

                {/* Bottom toolbar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  {/* Aspect ratio button */}
                  <button className="bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-black/80 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="5" width="18" height="14" rx="2"/>
                    </svg>
                  </button>

                  {/* Multi-select / zoom */}
                  <div className="flex items-center gap-2">
                    <button className="bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-black/80 transition">
                      <Plus size={16} />
                    </button>
                    <button className="bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-black/80 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="10" height="10" rx="1.5"/>
                        <rect x="12" y="5" width="10" height="14" rx="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Aspect ratio overlay popup (always visible for demo) */}
                <div className="absolute bottom-14 left-3 bg-black/80 rounded-xl p-3 flex gap-4">
                  {["1:1", "4:5", "16:9"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setCropAspect(r)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                        cropAspect === r ? "bg-white/20" : "hover:bg-white/10"
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
              </div>
            </div>
          )}

          {/* EDIT — Image */}
          {step === "edit" && fileType === "image" && (
            <div className="flex w-full h-full ">
              <div className="flex-1 bg-white p-3 flex items-center justify-center overflow-hidden ">
                <img src={file} style={getImageStyle()} className="max-h-full max-w-full object-contain" alt="edit" />
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
                <video
                  src={videoUrl}
                  className="max-h-full max-w-full object-contain"
                  autoPlay
                  loop
                  muted={!soundOn}
                />
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
                  <img src={file} style={getImageStyle()} className="max-h-full max-w-full object-contain" alt="share" />
                )}
                {/* Tag people tooltip */}
                <div className="absolute top-4 left-4">
                  <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                    <Users size={14} />
                    {fileType === "video" ? "Tag people" : "Click photo to tag people"}
                  </div>
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

                {/* Caption */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    maxLength={2200}
                    className="w-full resize-none text-sm outline-none placeholder:text-gray-400 min-h-[100px]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button className="text-gray-400 hover:text-gray-600 transition">
                      <Smile size={20} />
                    </button>
                    <span className="text-xs text-gray-400">{caption.length}/2,200</span>
                  </div>
                </div>

                {/* Add location */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm text-[#262626]">Add location</span>
                  <MapPin size={18} className="text-gray-500" />
                </div>

                {/* Add collaborators */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm text-[#262626]">Add collaborators</span>
                  <Users size={18} className="text-gray-500" />
                </div>

                {/* Accessibility */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm text-[#262626]">Accessibility</span>
                  <ChevronDown size={18} className="text-gray-500" />
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
                      {/* Hide likes */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#262626]">Hide like and view counts on this post</span>
                          <button
                            onClick={() => setHideLikes(!hideLikes)}
                            className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ml-3 ${hideLikes ? "bg-[#0095f6]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hideLikes ? "translate-x-6" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                          Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people&apos;s posts, go to your account settings.{" "}
                          <a href="#" className="text-[#0095f6]">Learn more</a>
                        </p>
                      </div>

                      {/* Turn off commenting */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#262626]">Turn off commenting</span>
                          <button
                            onClick={() => setNoComments(!noComments)}
                            className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ml-3 ${noComments ? "bg-[#0095f6]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${noComments ? "translate-x-6" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          You can change this later by going to the ··· menu at the top of your post.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}