import type { GTFSFeed, ValidationResult, Severity } from "../types/gtfs";

// Parse GTFS date string YYYYMMDD into a JS Date
function parseGTFSDate(s: string): Date {
  return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
}

// Parse HH:MM:SS time string into total seconds (GTFS allows hours > 24)
function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

export function runAllValidations(feed: GTFSFeed): ValidationResult[] {
  return [
    checkFeedExpiry(feed),
    checkTripsWithNoStopTimes(feed),
    checkStopsWithNoTrips(feed),
    checkOutOfSequenceStopTimes(feed),
    checkMissingShapes(feed),
    checkRoutesWithNoTrips(feed),
  ];
}

// Check 1: Feed expiry
// goes through all calendar.txt entries and checks if any have end_date in the past or within 30 days. Critical if already expired, warning if expiring soon.
function checkFeedExpiry(feed: GTFSFeed): ValidationResult {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const expired: string[] = [];
  const expiringSoon: string[] = [];

  for (const cal of feed.calendar) {
    const endDate = parseGTFSDate(cal.end_date);
    const label = `service_id=${cal.service_id} (ends ${cal.end_date})`;
    if (endDate < today) expired.push(label);
    else if (endDate < in30Days) expiringSoon.push(label);
  }

  if (expired.length > 0) {
    return {
      id: "feed-expiry",
      name: "Feed expiry",
      description: "Service calendar entries that have already expired.",
      severity: "critical",
      affectedCount: expired.length,
      affectedItems: expired,
      details: `${expired.length} expired, ${expiringSoon.length} expiring within 30 days.`,
    };
  }

  if (expiringSoon.length > 0) {
    return {
      id: "feed-expiry",
      name: "Feed expiry",
      description: "Service calendar entries expiring within 30 days.",
      severity: "warning",
      affectedCount: expiringSoon.length,
      affectedItems: expiringSoon,
      details: `${expiringSoon.length} service(s) expiring within 30 days.`,
    };
  }

  return {
    id: "feed-expiry",
    name: "Feed expiry",
    description: "All service calendar entries have future end dates.",
    severity: "ok",
    affectedCount: 0,
    affectedItems: [],
  };
}

// Check 2: Trips with no stop times
function checkTripsWithNoStopTimes(feed: GTFSFeed): ValidationResult {
  const tripsWithStops = new Set(feed.stopTimes.map((st) => st.trip_id));
  const orphaned = feed.trips.filter((t) => !tripsWithStops.has(t.trip_id));

  const severity: Severity = orphaned.length > 0 ? "critical" : "ok";
  return {
    id: "trips-no-stop-times",
    name: "Trips with no stop times",
    description:
      "Trips defined in trips.txt with zero entries in stop_times.txt.",
    severity,
    affectedCount: orphaned.length,
    affectedItems: orphaned
      .slice(0, 50)
      .map((t) => `trip_id=${t.trip_id} (route ${t.route_id})`),
    details:
      orphaned.length > 50 ? `Showing 50 of ${orphaned.length}` : undefined,
  };
}

// Check 3: Stops with no trips
function checkStopsWithNoTrips(feed: GTFSFeed): ValidationResult {
  const stopsInUse = new Set(feed.stopTimes.map((st) => st.stop_id));
  const orphaned = feed.stops.filter((s) => !stopsInUse.has(s.stop_id));

  const severity: Severity =
    orphaned.length > 10 ? "warning" : orphaned.length > 0 ? "info" : "ok";
  return {
    id: "stops-no-trips",
    name: "Stops with no trips",
    description: "Stops defined in stops.txt that are not visited by any trip.",
    severity,
    affectedCount: orphaned.length,
    affectedItems: orphaned
      .slice(0, 50)
      .map((s) => `stop_id=${s.stop_id} (${s.stop_name})`),
    details:
      orphaned.length > 50 ? `Showing 50 of ${orphaned.length}` : undefined,
  };
}

// Check 4: Out-of-sequence stop times
function checkOutOfSequenceStopTimes(feed: GTFSFeed): ValidationResult {
  // Group stop times by trip
  // it's creating a map of stop time to trip_id
  const byTrip = new Map<string, typeof feed.stopTimes>();
  for (const st of feed.stopTimes) {
    if (!byTrip.has(st.trip_id)) byTrip.set(st.trip_id, []);
    byTrip.get(st.trip_id)!.push(st);
  }
  //
  const badTrips: string[] = [];
  for (const [tripId, stops] of byTrip) {
    const sorted = [...stops].sort(
      (a, b) => Number(a.stop_sequence) - Number(b.stop_sequence),
    );
    let prev = -1;
    let bad = false;
    for (const s of sorted) {
      const t = timeToSeconds(s.departure_time || s.arrival_time);
      if (t < prev) {
        bad = true;
        break;
      }
      prev = t;
    }
    if (bad) badTrips.push(`trip_id=${tripId}`);
    if (badTrips.length >= 50) break;
  }

  const severity: Severity = badTrips.length > 0 ? "critical" : "ok";
  return {
    id: "out-of-sequence-stop-times",
    name: "Out-of-sequence stop times",
    description: "Trips where stop departure times go backwards.",
    severity,
    affectedCount: badTrips.length,
    affectedItems: badTrips,
  };
}

// Check 5: Missing shapes
function checkMissingShapes(feed: GTFSFeed): ValidationResult {
  const shapeIds = new Set(feed.shapes.map((s) => s.shape_id));
  const tripsWithMissingShapes = feed.trips.filter(
    (t) => t.shape_id && !shapeIds.has(t.shape_id),
  );

  const severity: Severity =
    tripsWithMissingShapes.length > 0 ? "warning" : "ok";
  return {
    id: "missing-shapes",
    name: "Missing shapes",
    description: "Trips referencing a shape_id not found in shapes.txt.",
    severity,
    affectedCount: tripsWithMissingShapes.length,
    affectedItems: tripsWithMissingShapes
      .slice(0, 50)
      .map((t) => `trip_id=${t.trip_id} (shape_id=${t.shape_id})`),
  };
}

// Check 6: Routes with no trips
function checkRoutesWithNoTrips(feed: GTFSFeed): ValidationResult {
  const routesWithTrips = new Set(feed.trips.map((t) => t.route_id));
  const orphaned = feed.routes.filter((r) => !routesWithTrips.has(r.route_id));

  const severity: Severity = orphaned.length > 0 ? "warning" : "ok";
  return {
    id: "routes-no-trips",
    name: "Routes with no trips",
    description: "Routes defined in routes.txt with no corresponding trips.",
    severity,
    affectedCount: orphaned.length,
    affectedItems: orphaned
      .slice(0, 50)
      .map(
        (r) =>
          `route_id=${r.route_id} (${r.route_short_name || r.route_long_name})`,
      ),
  };
}
