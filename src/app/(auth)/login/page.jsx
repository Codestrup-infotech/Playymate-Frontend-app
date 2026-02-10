// "use client";

// import { useState } from "react";
// import StepWelcome from "./steps/StepWelcome";
// import StepPhone from "./steps/StepPhone";
// import StepGoogle from "./steps/StepGoogle";
// import StepFacebook from "./steps/StepFacebook";

// export default function LoginPage() {
//   const [step, setStep] = useState("welcome"); // welcome | phone | google | facebook

//   const go = (nextStep) => setStep(nextStep);

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center">
//       {step === "welcome" && <StepWelcome go={go} />}
//       {step === "phone" && <StepPhone go={go} />}
//       {step === "google" && <StepGoogle go={go} />}
//       {step === "facebook" && <StepFacebook go={go} />}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import StepWelcome from "./steps/StepWelcome";
import StepPhone from "./steps/StepPhone";
import StepGoogle from "./steps/StepGoogle";
import StepFacebook from "./steps/StepFacebook";

export default function LoginPage() {
  const [mode, setMode] = useState("welcome"); // welcome | phone | google | facebook

  return (
    <div className="min-h-screen bg-black text-white">
      {mode === "welcome" && (
        <StepWelcome
          goPhone={() => setMode("phone")}
          goGoogle={() => setMode("google")}
          goFacebook={() => setMode("facebook")}
        />
      )}

      {mode === "phone" && (
        <StepPhone onBackToWelcome={() => setMode("welcome")} />
      )}

      {mode === "google" && (
        <StepGoogle onBackToWelcome={() => setMode("welcome")} />
      )}

      {mode === "facebook" && (
        <StepFacebook onBackToWelcome={() => setMode("welcome")} />
      )}
    </div>
  );
}

