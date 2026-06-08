/* ============================================================
   geo.data.js — mock place-search dataset for the type-ahead.
   Stands in for a geocoding API. Each entry resolves to a
   confirmed place with coordinates + IANA timezone.
   ============================================================ */
(function () {
  window.GEO_PLACES = [
    { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Varanasi', region: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata', utc: '+05:30' },
    { city: 'Kathmandu', region: 'Bagmati', country: 'Nepal', lat: 27.7172, lon: 85.3240, tz: 'Asia/Kathmandu', utc: '+05:45' },
    { city: 'Colombo', region: 'Western', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo', utc: '+05:30' },
    { city: 'London', region: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', utc: '+00:00' },
    { city: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', utc: '-05:00' },
    { city: 'San Francisco', region: 'California', country: 'United States', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles', utc: '-08:00' },
    { city: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto', utc: '-05:00' },
    { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai', utc: '+04:00' },
    { city: 'Singapore', region: '', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', utc: '+08:00' },
    { city: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', utc: '+11:00' }
  ];

  /* "18.94° N, 72.83° E" */
  window.GEO_FMT = function (lat, lon) {
    var ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? 'E' : 'W';
    return Math.abs(lat).toFixed(4) + '\u00b0 ' + ns + ', ' + Math.abs(lon).toFixed(4) + '\u00b0 ' + ew;
  };
  window.GEO_LABEL = function (p) {
    return [p.city, p.region, p.country].filter(Boolean).join(', ');
  };
})();
