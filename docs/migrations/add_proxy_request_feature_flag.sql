-- Migration: Add proxy_request_creation feature flag
-- Description: Allows specific users to create requests on behalf of other Account Managers

-- Insert the feature flag
INSERT INTO public.feature_flags (name, description, is_enabled, scope, payload)
VALUES (
  'proxy_request_creation',
  'Allows users to create requests on behalf of other Account Managers',
  true,
  'global',
  '{}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Example: Assign to specific user (uncomment and replace <user-uuid> with actual UUID)
-- INSERT INTO public.feature_flag_targets (flag_name, target_type, target_id, is_enabled)
-- VALUES ('proxy_request_creation', 'user', '<user-uuid>', true)
-- ON CONFLICT (flag_name, target_type, target_id) DO UPDATE
-- SET is_enabled = EXCLUDED.is_enabled;

-- To assign the feature to a user, use:
-- INSERT INTO public.feature_flag_targets (flag_name, target_type, target_id, is_enabled)
-- SELECT 'proxy_request_creation', 'user', id, true
-- FROM auth.users
-- WHERE email = 'user@example.com';
