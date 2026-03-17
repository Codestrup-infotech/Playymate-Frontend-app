"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ArrowLeft, Users, Globe, Lock, Loader2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import postService from "@/app/user/post";
import { userService } from "@/services/user";

export default function CreateReelPage() {
  const router = useRouter();

  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [duration, setDuration] = useState(0);

  // Crop state
  const [cropAspect, setCropAspect] = useState("9:16");

  // Edit state
  const [editTab, setEditTab] = useState("Cover");
  const [selectedCoverIdx, setSelectedCoverIdx] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [coverFrames, setCoverFrames] = useState([]);

  // Share state
  const [caption, setCaption] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuets, setAllowDuets] = useState(false);
  const [allowStitches, setAllowStitches] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // User info
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
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
    
    console.log('[CREATE-REEL] 📁 File selected:', {
      name: selected.name,
      type: selected.type,
      size: selected.size,
      sizeMB: (selected.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    
    if (!selected.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (selected.size > maxSize) {
      alert("Video file is too large. Maximum size is 100MB");
      return;
    }

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setVideoUrl(url);
    console.log('[CREATE-REEL] 🔗 Video URL created:', url);
    
    // Get video duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const videoDuration = Math.floor(video.duration);
      console.log('[CREATE-REEL] ⏱️ Video duration:', videoDuration, 'seconds');
      if (videoDuration > 60) {
        alert("Video duration cannot exceed 60 seconds");
        setFile(null);
        setVideoUrl(null);
        return;
      }
      setDuration(videoDuration);
      console.log('[CREATE-REEL] 🖼️ Generating cover frames...');
      generateCoverFrames(url);
    };
    video.src = url;
    
    setStep("crop");
    console.log('[CREATE-REEL] 📝 Step changed to: crop');
  };

  const generateCoverFrames = (url) => {
    console.log('[CREATE-REEL] 🎨 generateCoverFrames called with URL:', url);
    // Generate cover frames from video
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    
    video.onloadedmetadata = () => {
      console.log('[CREATE-REEL] 📐 Video metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      const frames = [];
      const interval = Math.max(1, Math.floor(video.duration / 5)); // 5 frames
      console.log('[CREATE-REEL] 📊 Frame interval:', interval, 'seconds');
      
      const captureFrame = (time) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");
        
        video.currentTime = time;
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL("image/jpeg", 0.8));
          console.log(`[CREATE-REEL] 📸 Captured frame at ${time}s`);
          
          if (time + interval < video.duration) {
            captureFrame(time + interval);
          } else {
            console.log('[CREATE-REEL] ✅ All frames captured:', frames.length, 'frames');
            setCoverFrames(frames);
            if (frames.length > 0) {
              setThumbnailUrl(frames[0]);
              console.log('[CREATE-REEL] 🖼️ Thumbnail URL set to first frame');
            }
          }
        };
      };
      
      captureFrame(0);
    };
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    
    if (!dropped.type.startsWith("video/")) {
      alert("Please drop a video file");
      return;
    }
    
    // Trigger file input manually
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(dropped);
    fileInput.current.files = dataTransfer.files;
    handleFile({ target: { files: dataTransfer.files } });
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const closeModal = () => router.push("/home");

  const goBack = () => {
    if (step === "crop") {
      setStep("upload");
      if (file) {
        URL.revokeObjectURL(videoUrl);
      }
      setFile(null);
      setVideoUrl(null);
      setThumbnailUrl(null);
    }
    if (step === "edit") setStep("crop");
    if (step === "share") setStep("edit");
  };

  // Handle posting the reel
  const handleShare = async () => {
    if (isUploading || !file) return;
    
    console.log('[CREATE-REEL] 🚀 handleShare started');
    console.log('[CREATE-REEL] 📋 Share configuration:', {
      caption,
      visibility,
      allowComments,
      allowDuets,
      allowStitches,
      cropAspect,
      duration,
      hasThumbnail: !!thumbnailUrl,
      coverFramesCount: coverFrames.length
    });
    
    setIsUploading(true);
    setUploadProgress(5);
    console.log('[CREATE-REEL] ⬆️ Upload started, progress:', 5);
    
    try {
      setUploadProgress(15);
      console.log('[CREATE-REEL] ⬆️ Progress:', 15, '- Uploading video file directly to backend...');
      
      // Step 1: Upload video directly to backend (which handles S3 upload)
      const videoUploadResponse = await postService.uploadReelFile(file, 'video');
      const { wasabi_direct_url: videoUrl } = videoUploadResponse.data.data;
      console.log('[CREATE-REEL] ✅ Video uploaded successfully!', { videoUrl });
      
      setUploadProgress(60);
      console.log('[CREATE-REEL] ⬆️ Progress:', 60);
      
      // Step 2: Upload thumbnail if selected
      let thumbnailUrlFinal = "";
      if (thumbnailUrl && coverFrames.length > 0) {
        console.log('[CREATE-REEL] 🖼️ Uploading thumbnail...');
        try {
          // Convert data URL to blob
          const thumbResponse = await fetch(thumbnailUrl);
          const thumbBlob = await thumbResponse.blob();
          const thumbFile = new File([thumbBlob], "thumbnail.jpg", { type: "image/jpeg" });
          console.log('[CREATE-REEL] 📁 Thumbnail file:', {
            name: thumbFile.name,
            size: thumbBlob.size,
            type: thumbFile.type
          });
          
          // Upload thumbnail directly to backend (avoids CORS)
          const thumbUploadResponse = await postService.uploadReelFile(thumbFile, 'thumbnail');
          const { wasabi_direct_url: thumbUrl } = thumbUploadResponse.data.data;
          console.log('[CREATE-REEL] ✅ Thumbnail uploaded successfully!', { thumbUrl });
          
          thumbnailUrlFinal = thumbUrl;
          setUploadProgress(75);
        } catch (thumbError) {
          console.error('[CREATE-REEL] ❌ Error uploading thumbnail:', thumbError);
        }
      } else {
        console.log('[CREATE-REEL] ℹ️ No thumbnail to upload');
      }
      
      // Step 3: Create reel
      console.log('[CREATE-REEL] 🎬 Creating reel...');
      // Extract hashtags from caption
      const hashtagRegex = /#(\w+)/g;
      const hashtags = [];
      let match;
      while ((match = hashtagRegex.exec(caption)) !== null) {
        hashtags.push(match[1]);
      }
      console.log('[CREATE-REEL] #️⃣ Extracted hashtags:', hashtags);
      
      // Extract mentions
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      while ((match = mentionRegex.exec(caption)) !== null) {
        mentions.push(match[1]);
      }
      console.log('[CREATE-REEL] @️⃣ Extracted mentions:', mentions);
      
      const reelData = {
        videoUrl: videoUrl,
        duration: duration,
        thumbnailUrl: thumbnailUrlFinal,
        aspectRatio: cropAspect,
        title: caption.substring(0, 100),
        caption: caption,
        hashtags: hashtags,
        mentions: mentions,
        visibility: visibility,
        allowComments: allowComments,
        allowDuets: allowDuets,
        allowStitches: allowStitches
      };
      
      console.log('[CREATE-REEL] 📤 Reel data prepared:', reelData);
      
      const createResponse = await postService.createReel(reelData);
      console.log('[CREATE-REEL] ✅ Reel created successfully!', createResponse.data);
      
      setUploadProgress(100);
      console.log('[CREATE-REEL] ⬆️ Progress:', 100, '- Upload complete!');
      
      // Navigate to home
      setTimeout(() => {
        router.push("/home");
      }, 500);
      
    } catch (error) {
      console.error('[CREATE-REEL] ❌ Error creating reel:', error);
      alert(error.message || "Failed to create reel. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Cover frame selection
  const handleCoverSelect = (index) => {
    console.log('[CREATE-REEL] 🖼️ Cover selected at index:', index);
    setSelectedCoverIdx(index);
    if (coverFrames[index]) {
      setThumbnailUrl(coverFrames[index]);
      console.log('[CREATE-REEL] 🖼️ Thumbnail URL updated');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-semibold text-lg">Create Reel</h1>
        </div>
        
        {step === "share" && (
          <button
            onClick={handleShare}
            disabled={isUploading || !file}
            className="bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              "Share"
            )}
          </button>
        )}
        
        <button onClick={closeModal} className="text-white">
          <X size={24} />
        </button>
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
            <p className="text-white text-[18px] font-light">Drag videos here</p>
            <p className="text-gray-400 text-sm">Max 60 seconds</p>
            <button
              onClick={() => fileInput.current.click()}
              className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              Select from computer
            </button>
            <input 
              type="file" 
              ref={fileInput} 
              className="hidden" 
              accept="video/*" 
              onChange={handleFile} 
            />
          </div>
        )}

        {/* CROP */}
        {step === "crop" && videoUrl && (
          <div className="flex w-full h-full">
            {/* Video area */}
            <div className="flex-1 bg-black p-3 relative flex items-center justify-center overflow-hidden">
              <video
                src={videoUrl}
                className="max-h-full max-w-full object-contain"
                controls
              />

              {/* Bottom toolbar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                {/* Aspect ratio button */}
                <button className="bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white hover:bg-black/80 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                  </svg>
                </button>

                {/* Next button */}
                <button 
                  onClick={() => setStep("edit")}
                  className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Next
                </button>
              </div>

              {/* Aspect ratio overlay popup */}
              <div className="absolute bottom-14 left-3 bg-black/80 rounded-xl p-3 flex gap-4">
                {["1:1", "9:16", "4:5"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setCropAspect(r)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                      cropAspect === r ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`border-2 border-white ${
                        r === "1:1" ? "w-6 h-6" : r === "4:5" ? "w-5 h-6" : "w-5 h-8"
                      } rounded-sm`}
                    />
                    <span className="text-white text-[10px] font-medium">{r}</span>
                  </button>
                ))}
              </div>

              {/* Duration badge */}
              <div className="absolute top-3 right-3 bg-black/60 rounded-full px-3 py-1">
                <span className="text-white text-sm">{duration}s / 60s</span>
              </div>
            </div>
          </div>
        )}

        {/* EDIT — Cover Selection */}
        {step === "edit" && (
          <div className="flex w-full h-full">
            {/* Video preview */}
            <div className="flex-1 bg-black p-3 flex items-center justify-center overflow-hidden">
              <video
                src={videoUrl}
                className="max-h-full max-w-full object-contain"
                muted
                loop
                playsInline
              />
            </div>

            {/* Right panel - Cover selection */}
            <div className="w-[340px] border-l border-gray-800 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-800 flex-shrink-0">
                {["Cover", "Effects", "Audio"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition ${
                      editTab === tab ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Cover frames grid */}
              {editTab === "Cover" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <p className="text-gray-400 text-xs mb-3">Select a cover for your reel</p>
                  <div className="grid grid-cols-3 gap-2">
                    {coverFrames.map((frame, index) => (
                      <button
                        key={index}
                        onClick={() => handleCoverSelect(index)}
                        className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition ${
                          selectedCoverIdx === index ? "border-[#0095f6]" : "border-transparent hover:border-gray-600"
                        }`}
                      >
                        <img src={frame} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                        {selectedCoverIdx === index && (
                          <div className="absolute inset-0 bg-[#0095f6]/30 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {coverFrames.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="text-gray-400 animate-spin" />
                      <span className="text-gray-400 text-sm ml-2">Generating covers...</span>
                    </div>
                  )}
                </div>
              )}

              {editTab === "Effects" && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Effects coming soon</p>
                </div>
              )}

              {editTab === "Audio" && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Audio coming soon</p>
                </div>
              )}

              {/* Next button */}
              <div className="p-3 border-t border-gray-800">
                <button 
                  onClick={() => setStep("share")}
                  className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-4 py-3 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE */}
        {step === "share" && (
          <div className="flex w-full h-full">
            {/* Preview */}
            <div className="flex-1 bg-black p-3 flex items-center justify-center overflow-hidden">
              <div className="relative aspect-[9/16] max-h-full">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <video src={videoUrl} className="w-full h-full object-cover rounded-lg" muted loop playsInline />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                  <div className="flex items-center gap-2">
                    {userInfo?.profileImage && (
                      <img src={userInfo.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <span className="text-white text-sm font-medium">{userInfo?.username || 'user'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share form */}
            <div className="w-[380px] border-l border-gray-800 flex flex-col overflow-hidden">
              {/* User info */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                {userInfo?.profileImage && (
                  <img src={userInfo.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                )}
                <span className="text-white font-medium">{userInfo?.username || 'user'}</span>
              </div>

              {/* Caption */}
              <div className="flex-1 overflow-y-auto p-4">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm"
                  rows={4}
                  maxLength={2200}
                />
                <div className="text-right text-gray-500 text-xs">{caption.length}/2200</div>

                {/* Hashtags preview */}
                {caption.match(/#[a-zA-Z0-9_]+/g) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {caption.match(/#[a-zA-Z0-9_]+/g).map((tag, i) => (
                      <span key={i} className="text-[#0095f6] text-xs"> {tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced settings toggle */}
              <div className="px-4 py-2 border-t border-gray-800">
                <button 
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="text-gray-400 text-sm flex items-center gap-2"
                >
                  Advanced settings
                  {advancedOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>
              </div>

              {/* Advanced settings */}
              {advancedOpen && (
                <div className="px-4 py-3 border-t border-gray-800 space-y-3">
                  {/* Visibility */}
                  <div>
                    <label className="text-gray-400 text-xs block mb-2">Who can see this reel?</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVisibility("public")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          visibility === "public" 
                            ? "border-[#0095f6] text-[#0095f6]" 
                            : "border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <Globe size={14} /> Public
                      </button>
                      <button
                        onClick={() => setVisibility("followers_only")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          visibility === "followers_only" 
                            ? "border-[#0095f6] text-[#0095f6]" 
                            : "border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <Users size={14} /> Followers
                      </button>
                      <button
                        onClick={() => setVisibility("private")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          visibility === "private" 
                            ? "border-[#0095f6] text-[#0095f6]" 
                            : "border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <Lock size={14} /> Private
                      </button>
                    </div>
                  </div>

                  {/* Interactions */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs block">Interactions</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#0095f6] focus:ring-[#0095f6]"
                      />
                      <span className="text-white text-sm">Allow comments</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowDuets}
                        onChange={(e) => setAllowDuets(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#0095f6] focus:ring-[#0095f6]"
                      />
                      <span className="text-white text-sm">Allow duets</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowStitches}
                        onChange={(e) => setAllowStitches(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#0095f6] focus:ring-[#0095f6]"
                      />
                      <span className="text-white text-sm">Allow stitches</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload progress overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <Loader2 size={48} className="text-white animate-spin mb-4" />
          <p className="text-white text-lg mb-2">Sharing your reel...</p>
          <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-[#0095f6] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}


