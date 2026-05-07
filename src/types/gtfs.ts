export interface GTFSFeed {
  agency: AgencyRow[]
  routes: RouteRow[]
  trips: TripRow[]
  stopTimes: StopTimeRow[]
  stops: StopRow[]
  calendar: CalendarRow[]
  calendarDates: CalendarDateRow[]
  shapes: ShapeRow[]
}

export interface AgencyRow {
  agency_id: string
  agency_name: string
  agency_url: string
  agency_timezone: string
}

export interface RouteRow {
  route_id: string
  agency_id: string
  route_short_name: string
  route_long_name: string
  route_type: string
  route_color?: string
  route_text_color?: string
}

export interface TripRow {
  route_id: string
  service_id: string
  trip_id: string
  trip_headsign?: string
  shape_id?: string
  direction_id?: string
}

export interface StopTimeRow {
  trip_id: string
  arrival_time: string
  departure_time: string
  stop_id: string
  stop_sequence: string
}

export interface StopRow {
  stop_id: string
  stop_name: string
  stop_lat: string
  stop_lon: string
}

export interface CalendarRow {
  service_id: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  start_date: string
  end_date: string
}

export interface CalendarDateRow {
  service_id: string
  date: string
  exception_type: string
}

export interface ShapeRow {
  shape_id: string
  shape_pt_lat: string
  shape_pt_lon: string
  shape_pt_sequence: string
}

export type Severity = 'ok' | 'warning' | 'critical' | 'info'

export interface ValidationResult {
  id: string
  name: string
  description: string
  severity: Severity
  affectedCount: number
  affectedItems: string[]
  details?: string
}
