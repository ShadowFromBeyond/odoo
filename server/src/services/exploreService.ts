import { mockActivities, mockCities } from "../data/mockExplore.js";

export function searchCities(query = "", tag = "") {
  const q = query.toLowerCase();
  return mockCities.filter((city) => {
    const matchesQuery = city.cityName.toLowerCase().includes(q) || city.country.toLowerCase().includes(q);
    const matchesTag = !tag || city.tags.includes(tag.toLowerCase());
    return matchesQuery && matchesTag;
  });
}

export function searchActivities(query = "", category = "") {
  const q = query.toLowerCase();
  return mockActivities.filter((activity) => {
    const matchesQuery = activity.title.toLowerCase().includes(q) || activity.cityName.toLowerCase().includes(q);
    const matchesCategory = !category || activity.category.toLowerCase() === category.toLowerCase();
    return matchesQuery && matchesCategory;
  });
}
