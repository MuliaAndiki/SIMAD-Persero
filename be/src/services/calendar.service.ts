import { env } from "@/config/env.config";
import axios from "axios";

export type CalendarDayStatus = "WORKING_DAY" | "WEEKEND" | "HOLIDAY";

export interface CalendarDay {
  date: string;
  status: CalendarDayStatus;
  title: string | null;
}

class CalendarService {
  /**
   * Fetches Indonesian holidays from Google Calendar API.
   * Returns a dictionary mapping from "YYYY-MM-DD" to the holiday summary.
   */
  public async getHolidays(
    timeMin: Date,
    timeMax: Date,
  ): Promise<Record<string, string>> {
    try {
      // Convert time to ISO string
      const minStr = timeMin.toISOString();
      const maxStr = timeMax.toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/id.indonesian%23holiday%40group.v.calendar.google.com/events`;
      const response = await axios.get(url, {
        params: {
          key: env.GOOGLE_CALENDER_API,
          timeMin: minStr,
          timeMax: maxStr,
        },
      });

      const items = response.data.items || [];
      const holidayMap: Record<string, string> = {};

      for (const item of items) {
        if (item.start && item.start.date) {
          holidayMap[item.start.date] = item.summary || "Holiday";
        }
      }

      return holidayMap;
    } catch (error) {
      console.error("Failed to fetch Google Calendar holidays", error);
      return {};
    }
  }

  /**
   * Retrieves calendar days along with their status (WORKING_DAY, WEEKEND, HOLIDAY)
   * for a given date range.
   */
  public async getCalendarDays(
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarDay[]> {
    const holidays = await this.getHolidays(startDate, endDate);
    const days: CalendarDay[] = [];

    // Clone start date to avoid modifying original reference.
    const current = new Date(startDate.getTime());

    while (current <= endDate) {
      const dateStr = current.toISOString().slice(0, 10);
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holidayTitle = holidays[dateStr];

      let status: CalendarDayStatus = "WORKING_DAY";
      let title: string | null = null;

      if (holidayTitle) {
        status = "HOLIDAY";
        title = holidayTitle;
      } else if (isWeekend) {
        status = "WEEKEND";
        title = dayOfWeek === 0 ? "Minggu" : "Sabtu";
      }

      days.push({
        date: dateStr,
        status,
        title,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  /**
   * Evaluates a single date string (YYYY-MM-DD) status
   * It fetches the holiday API for that specific day or month
   */
  public async getDayStatus(dateStr: string): Promise<CalendarDay> {
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    // fetch holidays covering this day
    const dStart = new Date(d.getTime());
    dStart.setDate(d.getDate() - 2); // safety buffer
    const dEnd = new Date(d.getTime());
    dEnd.setDate(d.getDate() + 2);

    const holidays = await this.getHolidays(dStart, dEnd);
    const dayOfWeek = d.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayTitle = holidays[dateStr];

    if (holidayTitle) {
      return { date: dateStr, status: "HOLIDAY", title: holidayTitle };
    }
    if (isWeekend) {
      return {
        date: dateStr,
        status: "WEEKEND",
        title: dayOfWeek === 0 ? "Minggu" : "Sabtu",
      };
    }
    return { date: dateStr, status: "WORKING_DAY", title: null };
  }
}

export default new CalendarService();
