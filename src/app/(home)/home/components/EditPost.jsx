"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

export default function PostMenuModal() {

  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    console.log("Delete Post");
    setShowMenu(false);
  };

  const handleEdit = () => {
    console.log("Edit Post");
    setShowMenu(false);
  };

  const handleHideLikes = () => {
    console.log("Hide like count");
    setShowMenu(false);
  };

  const handleTurnOffComments = () => {
    console.log("Turn off commenting");
    setShowMenu(false);
  };

  return (
    <>

      {/* THREE DOT BUTTON */}

      <button
        onClick={() => setShowMenu(true)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <MoreHorizontal size={22} />
      </button>


      {/* MENU MODAL */}

      {showMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowMenu(false)}
        >

          <div
            className="bg-white w-[360px] rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* DELETE */}

            <button
              onClick={handleDelete}
              className="w-full py-4 text-red-500 font-semibold border-b hover:bg-gray-100"
            >
              Delete
            </button>


            {/* EDIT */}

            <button
              onClick={handleEdit}
              className="w-full py-4 border-b hover:bg-gray-100"
            >
              Edit
            </button>


            {/* HIDE LIKE COUNT */}

            <button
              onClick={handleHideLikes}
              className="w-full py-4 border-b hover:bg-gray-100"
            >
              Hide like count to others
            </button>


            {/* TURN OFF COMMENTS */}

            <button
              onClick={handleTurnOffComments}
              className="w-full py-4 border-b hover:bg-gray-100"
            >
              Turn off commenting
            </button>


            {/* CANCEL */}

            <button
              onClick={() => setShowMenu(false)}
              className="w-full py-4 text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </>
  );
}