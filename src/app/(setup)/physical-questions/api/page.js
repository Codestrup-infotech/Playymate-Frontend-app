import axios from "axios";

const API_URL =
  "https://api-dev.playymate.com/api/v1/questionnaire/categories/sports/items";

export async function fetchSportsItems() {
  const res = await axios.get(API_URL);
  return res.data.data; 
  // returns: { category_title, max_selection, items[] }
}
