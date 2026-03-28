// "use client";

// import { useState } from "react";
// import { MoreHorizontal, Flag, User } from "lucide-react";
// import Report from "./Report";
// import { useRouter } from "next/navigation";

// export default function ThreeDotButton({ targetId, targetType = "post", userId }) {
//   const [openMenu, setOpenMenu] = useState(false);
//   const [openReport, setOpenReport] = useState(false);
//   const router = useRouter();

//   return (
//     <>
//       {/* THREE DOT BUTTON */}
//       <button
//         onClick={() => setOpenMenu(true)}
//         className="p-2 rounded-full hover:bg-gray-200"
//       >
//         <MoreHorizontal size={20} />
//       </button>

//       {/* FIRST POPUP */}
//       {openMenu && (
//         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
//           <div className="w-full max-w-sm bg-white rounded-2xl p-3 animate-slideUp">
            
//             {/* REPORT */}
//             <button
//               onClick={() => {
//                 setOpenMenu(false);
//                 setOpenReport(true);
//               }}
//               className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-gray-100 rounded-lg"
//             >
//               <Flag size={18} />
//               Report
//             </button>

//             {/* ABOUT ACCOUNT */}
//             <button
//               onClick={() => {
//                 setOpenMenu(false);
//                 // Navigate to user profile - same as clicking on username in post
//                 if (userId) {
//                   router.push(`/home/profile/${userId}`);
//                 }
//               }}
//               className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
//             >
//               <User size={18} />
//               About this account
//             </button>

//             {/* CANCEL */}
//             <button
//               onClick={() => setOpenMenu(false)}
//               className="w-full mt-2 px-4 py-3 text-center text-gray-500 hover:bg-gray-100 rounded-lg"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* SECOND POPUP (REPORT FLOW) */}
//       <Report
//         isOpen={openReport}
//         onClose={() => setOpenReport(false)}
//         targetId={targetId}
//         targetType={targetType}
//       />
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import Report from "./Report";
import { useRouter } from "next/navigation";

export default function ThreeDotButton({
  targetId,
  targetType = "post",
  userId,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  const router = useRouter();

  return (
    <>
      {/* THREE DOT BUTTON */}
      <button
        onClick={() => setOpenMenu(true)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <MoreHorizontal size={20} />
      </button>

      {/* CENTER MODAL POPUP */}
      {openMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpenMenu(false)} // outside click close
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            {/* REPORT */}
            <button
              onClick={() => {
                setOpenMenu(false);
                setOpenReport(true);
              }}
              className="w-full py-4 text-red-500 font-semibold border-b hover:bg-gray-50"
            >
              Report
            </button>

            {/* ABOUT ACCOUNT */}
            <button
              onClick={() => {
                setOpenMenu(false);
                if (userId) {
                  router.push(`/home/profile/${userId}`);
                }
              }}
              className="w-full py-4 border-b hover:bg-gray-50"
            >
              About this account
            </button>

            {/* CANCEL */}
            <button
              onClick={() => setOpenMenu(false)}
              className="w-full py-4 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* REPORT POPUP */}
      <Report
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        targetId={targetId}
        targetType={targetType}
      />
    </>
  );
}