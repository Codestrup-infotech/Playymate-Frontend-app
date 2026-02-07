export default function StepWelcome({ goPhone, goGoogle, goFacebook }) {
const outerAvatars = [
  "/loginAvatars/avatars1.jpg",
  "/loginAvatars/avatars6.jpg",
  "/loginAvatars/avatars8.png",
  "/loginAvatars/avatars4.jpg",
  "/loginAvatars/avatars5.jpg",
  "/loginAvatars/avatars7.png",
];

const innerAvatars = [
  "/loginAvatars/avatars1.jpg",
  "/loginAvatars/avatars2.jpg",
];

    return (

        <>

            <div className=" lg:px-32 lg:py-12 px-4">
                <div className=" lg:flex flex flex-col lg:flex-row justify-center  lg:space-x-32 space-y-20 lg:space-y-0 border-[0.5px] border-dashed border-gray-700 rounded-3xl py-10">

<div className="flex flex-col justify-center items-center"> 
                   <img src="/loginAvatars/logo.png" alt="" className="w-72  mb-4  " />
                      
                             <div className=" bg-black flex items-center justify-center">
      <div className="relative w-[400px] h-[400px] flex items-center justify-center  ">
        
        {/* OUTER DASHED RING - 6 Avatars */}
        <div className="absolute w-[350px] h-[350px] border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
          {outerAvatars.map((src, i) => (
            <div
              key={`outer-${i}`}
              className="absolute w-14 h-14 rounded-full p-[2px] animate-orbit-outer"
              style={{ "--angle": `${i * 60}deg` }}
            >
              <div className="w-full h-full rounded-full overflow-hidden ">
                <img src={src} alt="" className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>

        {/* INNER DARK RING - bg-[#262626] */}
        <div className="absolute w-52 h-52 bg-[#262626] rounded-full flex items-center justify-center">
          {/* INNER AVATARS - Positioned half-in, half-out */}
          {innerAvatars.map((src, i) => (
            <div
              key={`inner-${i}`}
              className="absolute w-12 h-12 rounded-full p-[1px] animate-orbit-inner z-20"
              style={{ "--angle": `${i * 180 + 90}deg` }} 
            >
              <div className="w-full h-full rounded-full overflow-hidden ">
                <img src={src} alt="" className="w-full h-full" />
              </div>
            </div>
          ))}

          {/* CENTER WHITE CORE */}
          <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center z-10 shadow-lg">
            <div className=" rounded-full overflow-hidden">
              <img
                src="/loginAvatars/avatars6.jpg"
                alt="Center"
                className="w-24 h-24 justify-center  items-center"
              />
            </div>
          </div>
        </div>

      </div>
    </div> </div>
                     

                

                    <div className="pt-20" >
                        <div className="flex  flex-col justify-center  items-center mb-5">
                            <h2 className="text-3xl font-Playfair Display font-bold Display mb-2">
                                Find Your People,
                            </h2>
                            <p className="text-3xl  font-bold  font-Playfair Display mb-5 ">
                                Play your


                                <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                    Vibe </span>
                            </p> </div>

                        {/* BUTTONS */}
                        <button
                            onClick={goPhone}
                            className="btn-main flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                        >
                            <img src="/loginAvatars/mobile.png" className="w-6 h-6" alt="mobile" />
                            <span className="font-normal">Continue with Phone</span>
                        </button>

                        <button
                            onClick={goGoogle}
                            className="btn-outline flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                        >
                            <img src="/loginAvatars/google.png" className="w-6 h-6" alt="google" />
                            <span className="font-normal">Continue with Google</span>
                        </button>

                        <button
                            onClick={goFacebook}
                            className="btn-outline flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                        >
                            <img src="/loginAvatars/facebook.png" className="w-6 h-6" alt="facebook" />
                            <span className="font-normal">Continue with Facebook</span>
                        </button>


                        {/* FOOTER */}
                        <p className="text-sm text-gray-400 mt-6 font-Poppins justify-center  text-center ">
                            Already Have an Account?{" "}
                            <span className="text-orange-400 cursor-pointer">
                                Sign in
                            </span>
                        </p>
                    </div>
                </div>

            </div>

        </>


    );
}













