"use client";

import { createContext, useContext, useState, useCallback } from "react";

const FeedRefreshContext = createContext(null);

export function FeedRefreshProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    // Increment the trigger to signal a refresh
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <FeedRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </FeedRefreshContext.Provider>
  );
}

export function useFeedRefresh() {
  const context = useContext(FeedRefreshContext);
  if (!context) {
    throw new Error("useFeedRefresh must be used within a FeedRefreshProvider");
  }
  return context;
}