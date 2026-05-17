-- Enable pg_cron extension (available on Supabase Pro — on free tier, use Supabase Dashboard cron)
-- These are the cron expressions to set in the Supabase Dashboard under Edge Functions > Schedules

-- notify-reminders: every 5 minutes
-- cron: */5 * * * *
-- Function URL: /functions/v1/notify-reminders

-- weekly-review-trigger: every Sunday at 20:00 EET (17:00 UTC)
-- cron: 0 17 * * 0
-- Function URL: /functions/v1/weekly-review-trigger

-- NOTE: On Supabase free tier, schedule these via Dashboard > Edge Functions > [function] > Schedule
-- On paid plan, you can enable pg_cron:
-- select cron.schedule('notify-reminders', '*/5 * * * *', $$ select net.http_post('https://drdavvuaajkoisveeuwn.supabase.co/functions/v1/notify-reminders', '{}', '{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb) $$);
-- select cron.schedule('weekly-review-trigger', '0 17 * * 0', $$ select net.http_post('https://drdavvuaajkoisveeuwn.supabase.co/functions/v1/weekly-review-trigger', '{}', '{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb) $$);
