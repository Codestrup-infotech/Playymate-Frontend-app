// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "http://localhost:5000/api/v1";

// /* -------------------------------------------------------
//    Helper: Handle API Response
// ------------------------------------------------------- */

// async function handleResponse(response) {
//   const data = await response.json();

//   if (!response.ok || data.status !== "success") {
//     throw new Error(
//       data?.message || "API request failed"
//     );
//   }

//   return data.data;
// }

// function authHeaders(token) {
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// }

// /* -------------------------------------------------------
//    6.4 Get Categories
// ------------------------------------------------------- */

// export async function getCategories(
//   categoryType = "preference"
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/categories?category_type=${categoryType}`
//   );

//   const data = await handleResponse(res);
//   return data.categories || [];
// }

// /* -------------------------------------------------------
//    6.5 Get Category Intro
// ------------------------------------------------------- */

// export async function getCategoryIntro(categoryKey) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/categories/${categoryKey}/intro`
//   );

//   const data = await handleResponse(res);
//   return data.intro;
// }

// /* -------------------------------------------------------
//    6.6 Get Category Items
// ------------------------------------------------------- */

// export async function getCategoryItems(
//   categoryKey,
//   sessionId = null
// ) {
//   const query = sessionId
//     ? `?session_id=${sessionId}`
//     : "";

//   const res = await fetch(
//     `${BASE_URL}/questionnaire/categories/${categoryKey}/items${query}`
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.7 Start Questionnaire Session
// ------------------------------------------------------- */

// export async function startQuestionnaireSession(
//   token,
//   loopMode = false
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/session/start`,
//     {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify({
//         loop_mode: loopMode,
//       }),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.8 Get Session Status
// ------------------------------------------------------- */

// export async function getSessionStatus(
//   token,
//   sessionId
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/session/status?session_id=${sessionId}`,
//     {
//       headers: authHeaders(token),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.9 Save Selection
// ------------------------------------------------------- */

// export async function saveSelection(
//   token,
//   sessionId,
//   categoryKey,
//   selectedItems
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/selection`,
//     {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify({
//         session_id: sessionId,
//         category_key: categoryKey,
//         selected_items: selectedItems,
//       }),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.10 Get Item Questions
// ------------------------------------------------------- */

// export async function getItemQuestions(
//   token,
//   itemKey,
//   sessionId
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/items/${itemKey}/questions?session_id=${sessionId}`,
//     {
//       headers: authHeaders(token),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.11 Submit Answer
// ------------------------------------------------------- */

// export async function submitAnswer(
//   token,
//   payload
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/answer`,
//     {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify(payload),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.12 Complete Category (Coin Reward)
// ------------------------------------------------------- */

// export async function completeCategory(
//   token,
//   sessionId,
//   categoryKey
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/category/complete`,
//     {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify({
//         session_id: sessionId,
//         category_key: categoryKey,
//       }),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.13 Complete Questionnaire
// ------------------------------------------------------- */

// export async function completeQuestionnaire(
//   token,
//   sessionId
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/complete`,
//     {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify({
//         session_id: sessionId,
//       }),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.14 Get Reward Status
// ------------------------------------------------------- */

// export async function getRewardStatus(token) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/reward-status`,
//     {
//       headers: authHeaders(token),
//     }
//   );

//   return await handleResponse(res);
// }

// /* -------------------------------------------------------
//    6.15 Get Onboarding Ledger
// ------------------------------------------------------- */

// export async function getOnboardingLedger(
//   token,
//   page = 1,
//   limit = 20
// ) {
//   const res = await fetch(
//     `${BASE_URL}/questionnaire/wallet/gold-coins/onboarding-ledger?page=${page}&limit=${limit}`,
//     {
//       headers: authHeaders(token),
//     }
//   );

//   return await handleResponse(res);
// }

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

/* -------------------------------------------------------
   Helper: Handle API Response
------------------------------------------------------- */

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(
      data?.message || "API request failed"
    );
  }

  return data.data;
}

function authHeaders(token) {
  if (!token) {
    throw new Error("Authentication token missing");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* =======================================================
   7.4 Get Questionnaire Categories
   GET /questionnaire/categories
   Auth: No
======================================================= */

export async function getCategories(
  categoryType = "preference"
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/categories?category_type=${categoryType}`
  );

  const data = await handleResponse(res);
  return data.categories || [];
}

/* =======================================================
   7.5 Get Category Intro
   GET /questionnaire/categories/:categoryKey/intro
   Auth: No
======================================================= */

export async function getCategoryIntro(
  categoryKey
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/categories/${categoryKey}/intro`
  );

  const data = await handleResponse(res);
  return data.intro;
}

/* =======================================================
   7.6 Get Category Items
   GET /questionnaire/categories/:categoryKey/items
   Auth: No
======================================================= */

export async function getCategoryItems(
  categoryKey,
  sessionId = null
) {
  const query = sessionId
    ? `?session_id=${sessionId}`
    : "";

  const res = await fetch(
    `${BASE_URL}/questionnaire/categories/${categoryKey}/items${query}`
  );

  return await handleResponse(res);
}

/* =======================================================
   7.7 Start Questionnaire Session
   POST /questionnaire/session/start
   Auth: Yes
======================================================= */

export async function startQuestionnaireSession(
  token,
  loopMode = false
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/session/start`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        loop_mode: loopMode,
      }),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.8 Get Session Status
   GET /questionnaire/session/status
   Auth: Yes
======================================================= */

export async function getSessionStatus(
  token,
  sessionId
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/session/status?session_id=${sessionId}`,
    {
      headers: authHeaders(token),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.9 Save Selection
   POST /questionnaire/selection
   Auth: Yes
======================================================= */

export async function saveSelection(
  token,
  sessionId,
  categoryKey,
  selectedItems
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/selection`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
        category_key: categoryKey,
        selected_items: selectedItems,
      }),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.10 Get Item Questions
   GET /questionnaire/items/:itemKey/questions
   Auth: Yes
======================================================= */

export async function getItemQuestions(
  token,
  itemKey,
  sessionId
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/items/${itemKey}/questions?session_id=${sessionId}`,
    {
      headers: authHeaders(token),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.11 Submit Answer
   POST /questionnaire/answer
   Auth: Yes
======================================================= */

export async function submitAnswer(
  token,
  payload
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/answer`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.12 Complete Category
   POST /questionnaire/category/complete
   Auth: Yes
======================================================= */

export async function completeCategory(
  token,
  sessionId,
  categoryKey
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/category/complete`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
        category_key: categoryKey,
      }),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.13 Complete Questionnaire
   POST /questionnaire/complete
   Auth: Yes
======================================================= */

export async function completeQuestionnaire(
  token,
  sessionId
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/complete`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
      }),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.14 Get Reward Status
   GET /questionnaire/reward-status
   Auth: Yes
======================================================= */

export async function getRewardStatus(
  token
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/reward-status`,
    {
      headers: authHeaders(token),
    }
  );

  return await handleResponse(res);
}

/* =======================================================
   7.15 Get Onboarding Ledger
   GET /questionnaire/wallet/gold-coins/onboarding-ledger
   Auth: Yes
======================================================= */

export async function getOnboardingLedger(
  token,
  page = 1,
  limit = 20
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/wallet/gold-coins/onboarding-ledger?page=${page}&limit=${limit}`,
    {
      headers: authHeaders(token),
    }
  );

  return await handleResponse(res);
}