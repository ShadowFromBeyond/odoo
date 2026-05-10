export function getAnalytics() {
  return {
    totals: { users: 1280, tripsCreated: 3462, publicTrips: 842, avgBudget: 1840 },
    popularCities: [
      { name: "Kyoto", trips: 312 },
      { name: "Lisbon", trips: 284 },
      { name: "Barcelona", trips: 251 },
      { name: "Bali", trips: 238 }
    ],
    engagement: [
      { month: "Jan", trips: 170, notes: 440 },
      { month: "Feb", trips: 220, notes: 510 },
      { month: "Mar", trips: 310, notes: 780 },
      { month: "Apr", trips: 380, notes: 920 },
      { month: "May", trips: 460, notes: 1120 }
    ],
    budgetMix: [
      { label: "Hotels", value: 34 },
      { label: "Transport", value: 26 },
      { label: "Activities", value: 20 },
      { label: "Meals", value: 15 },
      { label: "Misc", value: 5 }
    ]
  };
}
