import type { AviationstackFlight, AviationstackSchedule } from "./aviationstack.types.js";
import { NormalizedFlight } from "../../schemas/normalizedTransport.schemas.js";

/**
 * Mapper functions to convert Aviationstack responses to normalized schema.
 * Pure functions for testability and clarity.
 */

export function mapFlightStatusToNormalized(
  flight: AviationstackFlight,
  provider: string,
  rawInclude: boolean = false
): NormalizedFlight {
  // Calculate delay if both scheduled and actual times are available
  let delayMinutes: number | undefined = undefined;
  if (flight.departure.scheduled && flight.departure.actual) {
    const scheduled = new Date(flight.departure.scheduled);
    const actual = new Date(flight.departure.actual);
    delayMinutes = Math.round((actual.getTime() - scheduled.getTime()) / 60000);
  }

  const normalized: NormalizedFlight = {
    provider,
    flightDate: flight.flight_date,
    flightStatus: flight.flight_status,
    airlineName: flight.airline.name,
    airlineIata: flight.airline.iata,
    airlineIcao: flight.airline.icao,
    flightNumber: flight.flight.number,
    flightIata: flight.flight.iata,
    flightIcao: flight.flight.icao,
    departureAirport: flight.departure.airport,
    departureIata: flight.departure.iata,
    departureIcao: flight.departure.icao,
    departureTerminal: flight.departure.terminal,
    departureGate: flight.departure.gate,
    departureScheduled: flight.departure.scheduled,
    departureActual: flight.departure.actual,
    arrivalAirport: flight.arrival.airport,
    arrivalIata: flight.arrival.iata,
    arrivalIcao: flight.arrival.icao,
    arrivalTerminal: flight.arrival.terminal,
    arrivalGate: flight.arrival.gate,
    arrivalScheduled: flight.arrival.scheduled,
    arrivalActual: flight.arrival.actual,
    delayMinutes,
    aircraft: flight.aircraft?.aircraft_iata,
    codeshare: flight.flight.codeshared?.flight_iata,
  };

  if (rawInclude) {
    normalized.raw = {
      flight_status: flight.flight_status,
      departure: {
        timezone: flight.departure.timezone,
        estimated_runway: flight.departure.estimated_runway,
        actual_runway: flight.departure.actual_runway,
      },
      arrival: {
        timezone: flight.arrival.timezone,
        estimated_runway: flight.arrival.estimated_runway,
        actual_runway: flight.arrival.actual_runway,
      },
      live: flight.live,
      aircraft: flight.aircraft,
    };
  }

  return normalized;
}

export function mapScheduleToNormalized(
  schedule: AviationstackSchedule,
  provider: string,
  rawInclude: boolean = false
): NormalizedFlight {
  const normalized: NormalizedFlight = {
    provider,
    flightDate: schedule.flight_date,
    flightStatus: schedule.flight_status,
    airlineName: schedule.airline.name,
    airlineIata: schedule.airline.iata,
    airlineIcao: schedule.airline.icao,
    flightNumber: schedule.flight.number,
    flightIata: schedule.flight.iata,
    flightIcao: schedule.flight.icao,
    departureAirport: schedule.departure.airport,
    departureIata: schedule.departure.iata,
    departureIcao: schedule.departure.icao,
    departureTerminal: schedule.departure.terminal,
    departureGate: schedule.departure.gate,
    departureScheduled: schedule.departure.scheduled,
    arrivalAirport: schedule.arrival.airport,
    arrivalIata: schedule.arrival.iata,
    arrivalIcao: schedule.arrival.icao,
    arrivalTerminal: schedule.arrival.terminal,
    arrivalGate: schedule.arrival.gate,
    arrivalScheduled: schedule.arrival.scheduled,
    aircraft: schedule.aircraft?.aircraft_iata,
  };

  if (rawInclude) {
    normalized.raw = {
      departure_timezone: schedule.departure.timezone,
      arrival_timezone: schedule.arrival.timezone,
      aircraft_name: schedule.aircraft?.aircraft_name,
    };
  }

  return normalized;
}
