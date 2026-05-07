import Papa from "papaparse";
import JSZip from "jszip";
import type { GTFSFeed } from "../types/gtfs";

function parseCSV<T>(text: string): T[] {
  const result = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

export async function parseGTFSZip(file: File): Promise<GTFSFeed> {
  const zip = await JSZip.loadAsync(file);

  const readFile = async (name: string): Promise<string> => {
    const f = zip.file(name);
    if (!f) return "";
    return f.async("string");
  };

  const [
    agencyText,
    routesText,
    tripsText,
    stopTimesText,
    stopsText,
    calendarText,
    calendarDatesText,
    shapesText,
  ] = await Promise.all([
    readFile("agency.txt"),
    readFile("routes.txt"),
    readFile("trips.txt"),
    readFile("stop_times.txt"),
    readFile("stops.txt"),
    readFile("calendar.txt"),
    readFile("calendar_dates.txt"),
    readFile("shapes.txt"),
  ]);

  return {
    agency: agencyText ? parseCSV(agencyText) : [],
    routes: routesText ? parseCSV(routesText) : [],
    trips: tripsText ? parseCSV(tripsText) : [],
    stopTimes: stopTimesText ? parseCSV(stopTimesText) : [],
    stops: stopsText ? parseCSV(stopsText) : [],
    calendar: calendarText ? parseCSV(calendarText) : [],
    calendarDates: calendarDatesText ? parseCSV(calendarDatesText) : [],
    shapes: shapesText ? parseCSV(shapesText) : [],
  };
}
