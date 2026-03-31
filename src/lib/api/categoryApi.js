const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  console.log('[startQuestionnaireSession] Starting new session...');
  const res = await fetch(
    `${API_BASE_URL}/questionnaire/session/start`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_type: "preference",  // Required by backend
      }),
    }
  );

  // Log response status
  console.log('[startQuestionnaireSession] Response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log('[startQuestionnaireSession] Error response:', errorText);
  }

  return await handleResponse(res);
}

/* ======================================================
   GET SESSION (Get existing session to resume)
   GET /questionnaire/session/status
   Backend automatically finds the user's active session using token
====================================================== */

export async function getQuestionnaireSession(token, sessionId = null) {
  try {
    console.log('📡 Calling /session/status to find existing session...');
    
    // Build URL with session_id if provided
    let url = `${API_BASE_URL}/questionnaire/session/status`;
    if (sessionId) {
      url += `?session_id=${sessionId}`;
    }
    
    // Call WITHOUT session_id - backend auto-finds session using user ID from token!
    const res = await fetch(url, {
      headers: authHeaders(token),
    });
    
    console.log('📥 Session status response status:', res.status);
    
    // Log the error response for debugging
    if (!res.ok) {
      const errorText = await res.text();
      console.log('❌ Session status error response:', errorText);
      
      // Parse error to check if can start new session
      try {
        const errorData = JSON.parse(errorText);
        // If backend says can start new session, return null to trigger new session creation
        if (errorData.can_start_new_session === true) {
          console.log('📝 Backend says can start new session');
          return null;
        }
      } catch (e) {
        // Not JSON
      }
      
      console.log('❌ Session status request failed, status:', res.status);
      return null;
    }
    
    const data = await res.json();
    console.log('📥 Session status response data:', data);
    
    // If session is found and is valid
    if (data.success && data.data) {
      console.log('✅ Existing session found!');
      console.log('   Current category:', data.data.current_category_key);
      console.log('   Completed categories:', data.data.completed_categories);
      return data.data;
    }
    
    console.log('❌ No active session found');
    return null;
    
  } catch (err) {
    console.log('❌ Error getting session status:', err.message);
    return null;
  }
}

/* ======================================================
   GET CATEGORY INTRO
   GET /questionnaire/categories/:categoryKey/intro
====================================================== */

export async function getCategoryIntro(categoryKey) {
  const res = await fetch(
    `${API_BASE_URL}/questionnaire/categories/${categoryKey}/intro`
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
    `${API_BASE_URL}/questionnaire/categories/${categoryKey}/items?session_id=${sessionId}`
  );

  return await handleResponse(res);
}


// export async function getCategoryCompletion(token, categoryKey, sessionId) {
//   const res = await fetch(
//     `${API_BASE_URL}/questionnaire/categories/${categoryKey}/completion?session_id=${sessionId}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return await handleResponse(res);
// }

export async function getCategoryCompletion(token, categoryKey, sessionId) {

  console.log("Calling completion API with:");
  console.log("token:", token);
  console.log("categoryKey:", categoryKey);
  console.log("sessionId:", sessionId);

  const url = `${API_BASE_URL}/questionnaire/categories/${categoryKey}/completion?session_id=${sessionId}`;

  console.log("Completion API URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Completion API response status:", res.status);

  const data = await res.json();

  console.log("Completion API response data:", data);

  return data;
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
//     `${API_BASE_URL}/questionnaire/selection`,
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
    `${API_BASE_URL}/questionnaire/selection`,
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
    `${API_BASE_URL}/questionnaire/items/${itemKey}/questions?session_id=${sessionId}`,
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
    `${API_BASE_URL}/questionnaire/answer`,
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
    `${API_BASE_URL}/questionnaire/category/complete`,
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
    `${API_BASE_URL}/questionnaire/complete`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
      }),
    }
  );

  // Check if response is ok
  if (!res.ok) {
    const errorText = await res.text();
    console.error('completeQuestionnaire API error:', res.status, errorText);
    throw new Error(`API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  console.log('completeQuestionnaire response:', data);
  return data;
}

