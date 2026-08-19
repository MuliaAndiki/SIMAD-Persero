import type { AppContext } from "@/contex";
import { HttpResponse } from "@/http";
import internshipService from "@/services/internship.service";

class CronController {
  public async autoStartInternships(c: AppContext) {
    const result = await internshipService.autoStartDueInternships();

    return HttpResponse(c).ok(
      result,
      undefined,
      `Success auto-start scheduled job. Processed: ${result.processed}, Started: ${result.started}`,
    );
  }
}

export default new CronController();
