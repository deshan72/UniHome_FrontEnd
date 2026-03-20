export const SLIIT_COORDINATES = {
  lat: 6.9147,
  lng: 79.9729,
  name: "SLIIT Malabe Campus",
  address: "New Kandy Rd, Malabe 10115",
};

export const ACCOMMODATION_TYPES = [
  "Apartment", "Room", "Annex", "Shared", "House"
];

export const ROOM_TYPES = ["Single", "Double", "Shared", "Studio"];

export const AMENITY_OPTIONS = [
  "WiFi", "AC", "Hot Water", "Furnished", "Parking", "CCTV",
  "Gym", "Pool", "Generator", "Laundry", "Kitchen Access",
  "Study Area", "Cleaning Service", "Garden", "Separate Entrance",
  "Attached Bathroom", "Cupboard", "TV", "Fridge", "Washing Machine",
];

export const GENDER_OPTIONS = ["Any", "Male", "Female"];

export const MINIMUM_PERIODS = ["1 Month", "3 Months", "6 Months", "1 Year"];

export const NEARBY_AREAS = [
  "Malabe", "Kaduwela", "Battaramulla", "Athurugiriya",
  "Nugegoda", "Rajagiriya", "Thalawathugoda", "Pannipitiya",
  "Kottawa", "Homagama",
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "distance", label: "Nearest to SLIIT" },
];

export const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Active: "bg-green-100 text-green-700",
  Accepted: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Completed: "bg-purple-100 text-purple-700",
  Inactive: "bg-gray-100 text-gray-600",
};