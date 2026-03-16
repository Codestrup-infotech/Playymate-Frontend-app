"use client";

import { GraduationCap, MapPin, User, Calendar, Briefcase } from "lucide-react";

function capitalize(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function InterestPill({ label }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-700/40">
      {capitalize(label)}
    </span>
  );
}

export default function Activity({ profile, isDark }) {
  const { activity_intent, profile_details = {}, interests = {} } = profile;
  
  const roleSpecific = profile_details?.role_specific || {};
  const commonFields = profile_details?.common_fields || {};

  // Flatten interests
  const flattenInterests = (ints) => {
    if (!ints) return [];
    if (Array.isArray(ints)) return ints;
    const all = [];
    Object.keys(ints).forEach((key) => {
      if (Array.isArray(ints[key])) {
        all.push(...ints[key]);
      }
    });
    return all;
  };

  // Dynamically get interest categories from API response
  const getInterestCategories = (ints) => {
    if (!ints) return [];
    const categories = [];
    Object.keys(ints).forEach((key) => {
      if (Array.isArray(ints[key]) && ints[key].length > 0) {
        // Capitalize the category name for display
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        categories.push({ label, items: ints[key] });
      }
    });
    return categories;
  };

  // categorised interests for display - dynamically from API
  const interestCategories = getInterestCategories(interests);

  const allInterests = flattenInterests(interests);

  return (
    <div className="space-y-4">
      {/* Activity & Role */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          <Briefcase size={16} className="text-purple-400" /> Activity & Role
        </h3>

        {activity_intent?.type && (
          <div className="mb-3">
            <p className="text-xs text-gray-800 mb-1">Activity Intent</p>
            <span className="text-sm font-medium text-[#F47022] capitalize">
              {capitalize(activity_intent.type)}
            </span>
            {activity_intent.details && (
              <p className="text-md text-blue-950 mt-0.5">{activity_intent.details}</p>
            )}
          </div>
        )}

        {/* role specific fields */}
        {Object.keys(roleSpecific).length > 0 && (
          <div className="space-y-2 mt-3">
            {roleSpecific.college_name && (
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">College</p>
                  <p className="text-sm text-gray-600">{roleSpecific.college_name}</p>
                </div>
              </div>
            )}
            {roleSpecific.course && (
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Course</p>
                  <p className="text-sm text-gray-200">{roleSpecific.course}</p>
                </div>
              </div>
            )}
            {roleSpecific.year_of_study && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Year of Study</p>
                  <p className="text-sm text-gray-200">{capitalize(roleSpecific.year_of_study)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* common fields */}
        {(commonFields.current_city || commonFields.hometown || commonFields.qualification) && (
          <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
            {commonFields.current_city && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#9A37DB] ">Current City</p>
                  <p className="text-sm text-gray-500 capitalize">{commonFields.current_city}</p>
                </div>
              </div>
            )}
            {commonFields.hometown && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#9A37DB]">Hometown</p>
                  <p className="text-sm text-gray-500 capitalize">{commonFields.hometown}</p>
                </div>
              </div>
            )}
            {commonFields.qualification && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#9A37DB]">Qualification</p>
                  <p className="text-sm text-gray-500">{commonFields.qualification}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interests */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
          🎯 Interests
        </h3>

        {interestCategories.length > 0 ? (
          <div className="space-y-4">
            {interestCategories.map((cat) => (
              <div key={cat.label}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => (
                    <InterestPill key={item} label={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : allInterests.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {allInterests.map((item) => (
              <InterestPill key={item} label={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No interests added yet</p>
        )}
      </div>
    </div>
  );
}
