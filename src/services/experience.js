import api from "./api";

export const experienceService = {

  // GET questions
  getScreens: () =>
    api.get("/questionnaire/extended-profile/screens"),

  // SAVE answers
  saveAnswers: (data) =>
    api.post("/questionnaire/extended-profile", data),
                                            
};

export default experienceService;