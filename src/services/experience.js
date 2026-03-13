import api from "./api";

export const experienceService = {

  // GET questions
  getScreens: () =>
    api.get("/questionnaire/extended-profile/screens"),

  // SAVE answers
  saveAnswers: (data) =>
    api.post("/questionnaire/extended-profile", data),

  // SKIP extended profile
  skipAnswers: () =>
    api.post("/questionnaire/extended-profile/skip"),

  // Extended Intro Screen
  getExtendedIntro: () =>
    api.get("/onboarding/screens/extended-intro"),

  // Completion Celebration Screen
  getCompletionCelebration: () =>
    api.get("/onboarding/screens/completion-celebration"),

};

export default experienceService;
