// Tiny cron Worker: Pages Functions can't run on a schedule, so this pings
// /api/cron/reminders every hour. Secrets: CRON_SECRET (same value as in Pages).
export default {
  async scheduled(_evt, env) {
    const res = await fetch(`${env.SITE_URL}/api/cron/reminders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });
    console.log("reminders:", res.status, await res.text());
  },
};
