"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, MapPin, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"
import { checkEligibility, discoverTeams } from "@/lib/api/teamApi"
import { Shield, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function CreateTeamPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const inputBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-300"

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category_type: "",
    category_value: "",
    location: "",
    visibility: "public",
    description: "",
  })

  // Eligibility and categories from API
  const [eligibility, setEligibility] = useState({
    can_create_team: false,
    eligible_categories: [],
    primary_sport: null,
    kyc_status: null,
    max_teams_allowed: 0,
    teams_created_count: 0,
    loading: true,
    error: null,
  })

  // Google Places Autocomplete state
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const autocompleteServiceRef = useRef(null)
  const inputRef = useRef(null)

  const placesServiceRef = useRef(null)
const mapRef = useRef(null)
  

  // Fetch eligibility and load persisted data on mount
  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const response = await checkEligibility()
        setEligibility({
          can_create_team: response.can_create_team ?? false,
          eligible_categories: response.eligible_categories || [],
          primary_sport: response.primary_sport || null,
          kyc_status: response.kyc_status || null,
          max_teams_allowed: response.max_teams_allowed || 0,
          teams_created_count: response.teams_created_count || 0,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching eligibility:", error)
        setEligibility(prev => ({
          ...prev,
          loading: false,
          error: "Failed to check eligibility",
        }))
      }
    }

    // Load persisted form data from sessionStorage
    const loadPersistedData = () => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("createTeamData")
        if (stored) {
          const parsed = JSON.parse(stored)
          setFormData(prev => ({
            ...prev,
            name: parsed.name || "",
            category_type: parsed.category_type || "",
            category_value: parsed.category_value || "",
            location: parsed.location || "",
            visibility: parsed.visibility || "public",
            description: parsed.description || "",
          }))
        }
      }
    }

    fetchEligibility()
    loadPersistedData()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle location input with Google Places Autocomplete
  const handleLocationChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, location: value }))
    
    // Clear suggestions if input is empty
    if (value.trim() === "") {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    // Search for places using Google Places API
    // if (isScriptLoaded && autocompleteServiceRef.current) {
    //   setIsSearching(true)
    //   autocompleteServiceRef.current.getPlacePredictions(
    //     {
    //       // input: value,
    //       // componentRestrictions: { country: "in" }, // Restrict to India (adjust as needed)
    //       // types: ["(cities)", "establishment"], // Search for cities and places
    //        input: value,
    // componentRestrictions: { country: "in" },
    // types: ["geocode", "establishment"],
          
    //     },
    //     (predictions, status) => {
    //       setIsSearching(false)
    //       if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
    //         setSuggestions(predictions.slice(0, 5)) // Limit to 5 suggestions
    //         setShowSuggestions(true)
    //       } else {
    //         setSuggestions([])
    //         setShowSuggestions(false)
    //       }
    //     }
    //   )
    // }
    if (isScriptLoaded && autocompleteServiceRef.current) {
  setIsSearching(true)

  // 👇 detect "near" / "sports" search
  const lowerValue = value.toLowerCase()

  if (
    lowerValue.includes("near") ||
    lowerValue.includes("nearest") ||
    lowerValue.includes("sport")
  ) {
    searchNearbySports(value) // 👈 make sure this function is added
    setIsSearching(false)
    return
  }

  // 👇 normal autocomplete
  autocompleteServiceRef.current.getPlacePredictions(
    {
      input: value,
      componentRestrictions: { country: "in" },
      types: ["geocode", "establishment"],
    },
    (predictions, status) => {
      setIsSearching(false)

      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        predictions
      ) {
        setSuggestions(predictions.slice(0, 5))
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }
  )
}
  }



const searchNearbySports = (query) => {
  if (!placesServiceRef.current || !navigator.geolocation) return

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }

   let keyword = query.toLowerCase()

if (keyword.includes("sport")) {
  keyword = "sports ground OR stadium OR playground OR turf"
} 
else if (keyword.includes("game")) {
  keyword = "gaming cafe OR game zone OR play arena OR arcade"
} 
else if (keyword.includes("water")) {
  keyword = "water park OR swimming pool OR water resort"
} 
else if (keyword.includes("kart") || keyword.includes("go kart")) {
  keyword = "go karting OR karting track"
} 
else if (keyword.includes("dog") || keyword.includes("pet")) {
  keyword = "dog park OR pet cafe OR pet playground"
} 
else if (keyword.includes("nostalgia") || keyword.includes("retro")) {
  keyword = "retro cafe OR vintage cafe OR themed cafe"
} 
else if (keyword.includes("cook") || keyword.includes("cooking")) {
  keyword = "cooking class OR culinary studio OR baking class"
} 
else if (keyword.includes("adventure")) {
  keyword = "adventure park OR trampoline park OR activity center"
} 
else if (keyword.includes("movie") || keyword.includes("cinema")) {
  keyword = "movie theater OR cinema hall"
} 
else {
  keyword = query
}

placesServiceRef.current.nearbySearch(
  {
    location,
    radius: 5000,
    keyword: keyword,
  },
  (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const formatted = results.map((place) => ({
        description: place.name + ", " + place.vicinity,
        structured_formatting: {
          main_text: place.name,
          secondary_text: place.vicinity,
        },
      }))

      setSuggestions(formatted)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }
)
  })
}

  // Handle selecting a location from suggestions
  const handleSelectLocation = (place) => {
    setFormData(prev => ({ ...prev, location: place.description }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Handle "Enter manually" option
  const handleEnterManually = () => {
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Load Google Maps Places script
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      setIsScriptLoaded(true)
     autocompleteServiceRef.current = new google.maps.places.AutocompleteService()

mapRef.current = document.createElement("div")
placesServiceRef.current = new google.maps.places.PlacesService(mapRef.current)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsScriptLoaded(true)
    autocompleteServiceRef.current = new google.maps.places.AutocompleteService()

mapRef.current = document.createElement("div")
placesServiceRef.current = new google.maps.places.PlacesService(mapRef.current)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all mandatory fields
    const errors = []
    if (!formData.name.trim()) {
      errors.push("Team Name")
    }
    if (!formData.category_type) {
      errors.push("Category Type")
    }
    if (!formData.category_value) {
      errors.push("Sport Value")
    }
    if (!formData.location.trim()) {
      errors.push("Location")
    }
    
    if (errors.length > 0) {
      // Show alert for missing fields
      alert(`Please fill in the following fields: ${errors.join(", ")}`)
      return
    }
    
    // Store form data in sessionStorage for next steps
    if (typeof window !== "undefined") {
      sessionStorage.setItem("createTeamData", JSON.stringify(formData))
    }
    router.push("/teams/create-team/rules-roles")
  }

  const eligibleCategories = eligibility.eligible_categories || []

  // Get unique category types from API
  const categoryTypes = [...new Set(eligibleCategories.map(cat => cat.category_type))]

  // Filter category values based on selected category type
  const categoryValues = formData.category_type 
    ? eligibleCategories.filter(cat => cat.category_type === formData.category_type)
    : []

  // Check if selected category is a secondary sport that can only join
  const selectedCategory = eligibleCategories.find(
    cat => cat.category_value === formData.category_value
  )
  const showSecondarySportWarning = selectedCategory?.category_type === "sports" && 
    selectedCategory?.can_create === false && 
    selectedCategory?.reason === "secondary_sport_can_only_join"

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div
      className={`min-h-screen ${pageBg} ${textColor} px-5 py-6 pb-10 font-Poppins`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <Link href="/teams" className={textColor}>
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Create Team</h1>
      </motion.div>

      {/* STEP BAR */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
            className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 rounded-full bg-gray-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 rounded-full bg-gray-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 rounded-full bg-gray-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-pink-500 font-medium">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-gray-400">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </motion.div>

      {/* ELIGIBILITY CHECK */}
      {eligibility.loading ? (
        <motion.div variants={itemVariants} className="text-center py-8">Loading...</motion.div>
      ) : eligibility.error ? (
        <motion.div variants={itemVariants} className="text-center py-8 text-red-500">{eligibility.error}</motion.div>
      ) : !eligibility.can_create_team ? (
        /* KYC NOT VERIFIED - Show Modal */
        eligibility.kyc_status !== "verified" ? (
          <motion.div variants={itemVariants} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-2xl p-6 max-w-sm w-full text-center`}>
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">KYC Verification Required</h2>
              <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Please complete your KYC verification to create a team.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/teams"
                  className={`flex-1 px-4 py-2 rounded-full border ${isDark ? 'border-zinc-700' : 'border-gray-300'}`}
                >
                  Back
                </Link>
                <button
                  onClick={() => router.push('/home/settings/kyc')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
                >
                  Complete KYC
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* KYC VERIFIED BUT LIMIT REACHED */
          <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Team Limit Reached</h3>
            <p className="text-sm text-gray-600">
              You have reached your team limit ({eligibility.teams_created_count}/{eligibility.max_teams_allowed}). Upgrade your plan to create more teams.
            </p>
          </motion.div>
        )
      ) : (
        /* FORM */
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TEAM NAME */}
          <motion.div variants={itemVariants}>
            <label className="text-xs tracking-widest text-gray-500 uppercase">Team Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              required
              maxLength={80}
              className={`w-full mt-2 ${inputBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm`}
            />
          </motion.div>

          {/* CATEGORY TYPE - First selector */}
          <motion.div variants={itemVariants}>
            <label className="text-xs tracking-widest text-gray-500 uppercase">Category Type</label>
            {categoryTypes.length > 0 ? (
              <select
                name="category_type"
                value={formData.category_type}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category_type: e.target.value,
                    category_value: "" // Reset category value when type changes
                  }))
                }}
                required
                className={`w-full mt-2 ${inputBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} focus:outline-none focus:border-pink-500 shadow-sm`}
              >
                <option value="">Select category type</option>
                {categoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No eligible categories found</p>
            )}
          </motion.div>

          {/* CATEGORY VALUE - Second selector (Sport Value) */}
          {formData.category_type && (
            <motion.div variants={itemVariants}>
              <label className="text-xs tracking-widest text-gray-500 uppercase">Sport Value</label>
              {categoryValues.length > 0 ? (
                <select
                  name="category_value"
                  value={formData.category_value}
                  onChange={handleChange}
                  required
                  className={`w-full mt-2 ${inputBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} focus:outline-none focus:border-pink-500 shadow-sm`}
                >
                  <option value="">Select {formData.category_type}</option>
                  {categoryValues.map((cat) => (
                    <option key={cat.category_value} value={cat.category_value}>
                      {cat.category_value}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No {formData.category_type} available</p>
              )}
            </motion.div>
          )}

          {/* Secondary Sport Warning */}
          {showSecondarySportWarning && (
            <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-amber-800">Secondary Sport</h4>
                <p className="text-sm text-amber-700">
                  {selectedCategory?.reason.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </motion.div>
          )}

          {/* LOCATION */}
          <motion.div variants={itemVariants} ref={inputRef}>
            <label className="text-xs tracking-widest text-gray-500 uppercase">Location</label>
            <div className="relative mt-2">
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search for a place, sport ground, or enter manually"
                  className={`w-full ${inputBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute z-50 w-full mt-1 ${inputBg} border ${borderColor} rounded-2xl shadow-lg max-h-60 overflow-y-auto`}>
                  {suggestions.map((place, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectLocation(place)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${index !== suggestions.length - 1 ? `border-b ${borderColor}` : ''}`}
                    >
                      <MapPin size={18} className="text-pink-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-medium ${textColor}`}>
                          {place.structured_formatting?.main_text || place.description}
                        </p>
                        {place.structured_formatting?.secondary_text && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {place.structured_formatting.secondary_text}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                  {/* Enter Manually Option */}
                  <button
                    type="button"
                    onClick={handleEnterManually}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors rounded-b-2xl`}
                  >
                    <span className="text-sm font-medium">Enter location manually</span>
                  </button>
                </div>
              )}

              {/* Show "Enter manually" option when no suggestions but user has typed */}
              {showSuggestions && suggestions.length === 0 && formData.location.trim() !== "" && (
                <div className={`absolute z-50 w-full mt-1 ${inputBg} border ${borderColor} rounded-2xl shadow-lg`}>
                  <button
                    type="button"
                    onClick={handleEnterManually}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors rounded-2xl`}
                  >
                    <span className="text-sm font-medium">Enter location manually</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* TEAM VISIBILITY */}
          <motion.div variants={itemVariants} className={`${inputBg} border ${borderColor} rounded-2xl p-5 flex items-center justify-between shadow-sm`}>
            <div>
              <h3 className={`font-semibold text-lg ${formData.visibility === "private" ? textColor : "text-black "}`}>
                {formData.visibility === "private" ? "Private Team" : "Public Team"}
              </h3>
              <p className="text-sm text-gray-500">
                {formData.visibility === "private" ? "Only invited members can join" : "All members can join"}
              </p>
            </div>

            {/* Toggle UI */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="visibility"
                checked={formData.visibility === "private"}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.checked ? "private" : "public" }))}
                className="sr-only peer"
              />
              <div className={`w-14 h-7 rounded-full flex items-center p-1 transition-all duration-300 ${formData.visibility === "private" ? "bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]" : "bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${formData.visibility === "private" ? "translate-x-0" : "ml-auto"}`}></div>
              </div>
            </label>
          </motion.div>

          {/* DESCRIPTION */}
          <motion.div variants={itemVariants}>
            <label className="text-xs tracking-widest text-gray-500 uppercase">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell players about your team..."
              rows={4}
              className={`w-full mt-2 ${inputBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none shadow-sm`}
            />
          </motion.div>

          {/* CONTINUE BUTTON */}
          <motion.div 
            className=" bottom-4 inset-x-4 flex justify-center"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
            >
              Continue
            </motion.button>
          </motion.div>
        </form>
      )}
    </motion.div>
  )
}
