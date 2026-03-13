import api from "./api";

export const experienceService = {

  // GET extended intro screen
  getExtendedIntro: () =>
    api.get("/onboarding/screens/extended-intro"),

  // GET questions
  getScreens: () =>
    api.get("/questionnaire/extended-profile/screens"),

  // SAVE answers
  saveAnswers: (data) =>
    api.post("/questionnaire/extended-profile", data),

  // SKIP extended profile
  skipAnswers: () =>
    api.post("/questionnaire/extended-profile/skip"),
                                            
};

export default experienceService;