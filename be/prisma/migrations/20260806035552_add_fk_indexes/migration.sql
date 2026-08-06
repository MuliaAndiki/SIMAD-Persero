-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "attendance_devices_user_id_idx" ON "attendance_devices"("user_id");

-- CreateIndex
CREATE INDEX "attendance_logs_attendance_id_idx" ON "attendance_logs"("attendance_id");

-- CreateIndex
CREATE INDEX "attendance_logs_photo_file_id_idx" ON "attendance_logs"("photo_file_id");

-- CreateIndex
CREATE INDEX "attendance_overrides_attendance_id_idx" ON "attendance_overrides"("attendance_id");

-- CreateIndex
CREATE INDEX "attendance_overrides_supervisor_id_idx" ON "attendance_overrides"("supervisor_id");

-- CreateIndex
CREATE INDEX "attendance_reminders_internship_id_idx" ON "attendance_reminders"("internship_id");

-- CreateIndex
CREATE INDEX "attendance_settings_office_location_id_idx" ON "attendance_settings"("office_location_id");

-- CreateIndex
CREATE INDEX "attendance_violations_attendance_id_idx" ON "attendance_violations"("attendance_id");

-- CreateIndex
CREATE INDEX "attendance_violations_resolved_by_idx" ON "attendance_violations"("resolved_by");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "certificate_templates_template_file_id_idx" ON "certificate_templates"("template_file_id");

-- CreateIndex
CREATE INDEX "certificates_template_id_idx" ON "certificates"("template_id");

-- CreateIndex
CREATE INDEX "certificates_file_id_idx" ON "certificates"("file_id");

-- CreateIndex
CREATE INDEX "certificates_generated_by_idx" ON "certificates"("generated_by");

-- CreateIndex
CREATE INDEX "files_uploaded_by_idx" ON "files"("uploaded_by");

-- CreateIndex
CREATE INDEX "institution_majors_institution_id_idx" ON "institution_majors"("institution_id");

-- CreateIndex
CREATE INDEX "institutions_education_level_id_idx" ON "institutions"("education_level_id");

-- CreateIndex
CREATE INDEX "intern_profile_skills_skill_id_idx" ON "intern_profile_skills"("skill_id");

-- CreateIndex
CREATE INDEX "intern_profiles_institution_id_idx" ON "intern_profiles"("institution_id");

-- CreateIndex
CREATE INDEX "intern_profiles_major_id_idx" ON "intern_profiles"("major_id");

-- CreateIndex
CREATE INDEX "internship_applications_intern_profile_id_idx" ON "internship_applications"("intern_profile_id");

-- CreateIndex
CREATE INDEX "internship_applications_introduction_letter_file_id_idx" ON "internship_applications"("introduction_letter_file_id");

-- CreateIndex
CREATE INDEX "internship_applications_reviewed_by_idx" ON "internship_applications"("reviewed_by");

-- CreateIndex
CREATE INDEX "internship_status_histories_internship_id_idx" ON "internship_status_histories"("internship_id");

-- CreateIndex
CREATE INDEX "internship_status_histories_changed_by_idx" ON "internship_status_histories"("changed_by");

-- CreateIndex
CREATE INDEX "internships_intern_profile_id_idx" ON "internships"("intern_profile_id");

-- CreateIndex
CREATE INDEX "internships_department_id_idx" ON "internships"("department_id");

-- CreateIndex
CREATE INDEX "internships_office_location_id_idx" ON "internships"("office_location_id");

-- CreateIndex
CREATE INDEX "notification_reads_user_id_idx" ON "notification_reads"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_id_idx" ON "notifications"("type_id");

-- CreateIndex
CREATE INDEX "notifications_sender_id_idx" ON "notifications"("sender_id");

-- CreateIndex
CREATE INDEX "office_locations_department_id_idx" ON "office_locations"("department_id");

-- CreateIndex
CREATE INDEX "onboarding_histories_internship_id_idx" ON "onboarding_histories"("internship_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "supervisor_assignments_internship_id_idx" ON "supervisor_assignments"("internship_id");

-- CreateIndex
CREATE INDEX "supervisor_assignments_supervisor_id_idx" ON "supervisor_assignments"("supervisor_id");

-- CreateIndex
CREATE INDEX "supervisor_assignments_assigned_by_idx" ON "supervisor_assignments"("assigned_by");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_assigned_by_idx" ON "user_roles"("assigned_by");

-- CreateIndex
CREATE INDEX "users_avatar_file_id_idx" ON "users"("avatar_file_id");
