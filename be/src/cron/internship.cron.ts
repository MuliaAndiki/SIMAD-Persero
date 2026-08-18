import { cron } from "@elysiajs/cron";
import Elysia from "elysia";
import internshipService from "@/services/internship.service";

/**
 * Scheduled jobs for the Internship module.
 *
 * `internship-auto-start` — runs daily at 00:05 Asia/Jakarta (WIB) and
 * automatically transitions internships whose determined start date
 * (actualStartDate) has arrived from ONBOARDING_COMPLETED to ACTIVE.
 * See docs/05-state-machine.md §9 and InternshipService.autoStartDueInternships.
 */
export const internshipCron = new Elysia().use(
  cron({
    name: "internship-auto-start",
    pattern: "5 0 * * *",
    timezone: "Asia/Jakarta",
    run: async () => {
      try {
        const result = await internshipService.autoStartDueInternships();
        if (result.started > 0) {
          console.log(
            `[internship-cron] Auto-started ${result.started}/${result.processed} internship(s) (start date reached)`,
          );
        } else if (result.processed > 0) {
          console.warn(
            `[internship-cron] ${result.processed} internship(s) due but none started`,
          );
        }
      } catch (error) {
        console.error("[internship-cron] Auto-start run failed:", error);
      }
    },
  }),
);
