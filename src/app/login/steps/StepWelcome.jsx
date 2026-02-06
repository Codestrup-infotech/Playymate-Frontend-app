export default function StepWelcome({ goPhone, goGoogle, goFacebook }) {

    const avatars = [
      
        "/loginAvatars/avatars1.jpg",
        "/loginAvatars/avatars2.jpg",
        "/loginAvatars/avatars3.jpg",
        "/loginAvatars/avatars4.jpg",
        "/loginAvatars/avatars5.jpg",
        "/loginAvatars/avatars6.jpg",
    ];


    return (

        <>

            <div className=" lg:px-32 lg:py-12 px-4">
                <div className=" lg:flex flex flex-col lg:flex-row justify-center  lg:space-x-32 space-y-20 lg:space-y-0 border-[0.5px] border-dashed border-gray-700 rounded-3xl lg:px-20 py-20">

                    <div className="flex flex-col space-y-10  ">
                        <img src="/loginAvatars/logo.png" alt="" className="mb-8 w-72  " />

                        {/* AVATAR RING */}
                        {/* <div className="relative flex justify-center ">


                         
                            <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center z-10">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                    <img src="/loginAvatars/centerAvatar.jpg" alt="avatar" className="object-cover" />
                                </div>
                            </div>

                          
                            <div className="absolute inset-0 flex items-center justify-center mb-">

                               
                                <div className="w-44 h-44 border-2 border-dashed border-gray-600 rounded-full animate-spin-slow" />

                                {avatars.map((a, i) => (
                                    <div
                                        key={i}
                                        className="absolute animate-spin-slow-reverse w-9 h-9 rounded-full p-[2px] bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg"
                                        style={{
                                            transform: `rotate(${i * 60}deg) translate(88px) rotate(-${i * 60}deg)`
                                        }}
                                    >
                                        <div className="relative w-full h-full rounded-full overflow-hidden bg-black">

                                            <img src="/loginAvatars/avatarsRing.png" alt="ring" className="absolute inset-0 w-full h-full" />
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div> */}

 <div className="relative flex justify-center mb-14">


                            {/* CENTER AVATAR */}
                            <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center z-10">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                   <img src="/loginAvatars/avatars3.jpg" alt="avatar" className="object-cover" />
                                </div>
                            </div>

                            {/* ORBIT */}
                            <div className="absolute inset-0 flex items-center justify-center mb-">

                                {/* DASHED RING */}
                                <div className="w-44 h-44 border-2 border-dashed border-gray-600 rounded-full " />

                                {avatars.map((a, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-9 h-9 rounded-full p-[2px]
                                            bg-gradient-to-r from-pink-500 to-orange-400
                                                shadow-lg animate-orbit-cycle"
                                        style={{
                                            "--angle": `${i * 60}deg`,
                                        }}
                                    >
                                        <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                                            <img src={a} alt="avatar" className="object-cover w-full h-full" />

                                        </div>
                                    </div>
                                ))}


                            </div>
                            
                        </div>

                    </div>

                    <div >
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











