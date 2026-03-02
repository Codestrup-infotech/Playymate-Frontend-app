import { venues } from "../turf/data/venues.js";
import VenueCard from "../turf/components/VenueCard.jsx";

export default function TurfPage() {
  const turfs = venues.filter(v => v.category === "Turfs");

  return turfs.map((venue) => (
    
    <VenueCard key={venue.id} venue={venue} />
  ));
}