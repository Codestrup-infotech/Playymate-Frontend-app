const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api-dev.playymate.com/api/v1";

/* ======================================================
   HANDLE RESPONSE (Supports success OR status format)
====================================================== */

async function handleResponse(response) {
  const data = await response.json();

  const isSuccess =
    data.success === true ||
    data.status === "success";

  if (!response.ok || !isSuccess) {
    console.error("API ERROR RESPONSE:", data);
    throw new Error(
      data?.message ||
      data?.error ||
      "API request failed"
    );
  }

  return data.data || data;
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

/* ======================================================
   START SESSION
   POST /questionnaire/session/start
====================================================== */

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

/* ======================================================
   GET CATEGORY INTRO
   GET /questionnaire/categories/:categoryKey/intro
====================================================== */

export async function getCategoryIntro(categoryKey) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/categories/${categoryKey}/intro`
  );

  return await handleResponse(res);
}

/* ======================================================
   GET CATEGORY ITEMS
   GET /questionnaire/categories/:categoryKey/items
====================================================== */

export async function getCategoryItems(
  categoryKey,
  sessionId
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/categories/${categoryKey}/items?session_id=${sessionId}`
  );

  return await handleResponse(res);
}

/* ======================================================
   SAVE SELECTION (VERY IMPORTANT FOR ITERATIVE MODE)
   POST /questionnaire/selection
====================================================== */

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
export async function saveSelection(
  token,
  sessionId,
  categoryKey,
  itemKey
) {
  const res = await fetch(
    `${BASE_URL}/questionnaire/selection`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
        category_key: categoryKey,
        selected_item_keys: [itemKey], // ✅ EXACT MATCH
      }),
    }
  );

  return await handleResponse(res);
}
/* ======================================================
   GET ITEM QUESTIONS
   GET /questionnaire/items/:itemKey/questions
====================================================== */

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

/* ======================================================
   SUBMIT ANSWER
   POST /questionnaire/answer
====================================================== */

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

/* ======================================================
   COMPLETE CATEGORY (Optional - Future)
====================================================== */

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

/* ======================================================
   COMPLETE QUESTIONNAIRE (Optional - Future)
====================================================== */

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