CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "full_name" varchar(150) NOT NULL,
  "email" varchar(150) UNIQUE NOT NULL,
  "password" varchar,
  "avatar_file_id" uuid,
  "email_verified" boolean DEFAULT false,
  "email_verified_at" timestamp,
  "last_login_at" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(100),
  "description" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "user_roles" (
  "user_id" uuid,
  "role_id" uuid,
  "assigned_at" timestamp,
  "assigned_by" uuid,
  PRIMARY KEY ("user_id", "role_id")
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY,
  "code" varchar(100) UNIQUE,
  "name" varchar,
  "description" text,
  "created_at" timestamp
);

CREATE TABLE "role_permissions" (
  "role_id" uuid,
  "permission_id" uuid,
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "refresh_tokens" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "token" text,
  "expires_at" timestamp,
  "revoked_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "education_levels" (
  "id" uuid PRIMARY KEY,
  "code" varchar(20) UNIQUE,
  "name" varchar(100),
  "created_at" timestamp
);

CREATE TABLE "institutions" (
  "id" uuid PRIMARY KEY,
  "education_level_id" uuid,
  "name" varchar(200),
  "short_name" varchar(100),
  "province" varchar(100),
  "city" varchar(100),
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "institution_majors" (
  "id" uuid PRIMARY KEY,
  "institution_id" uuid,
  "name" varchar(150),
  "created_at" timestamp
);

CREATE TABLE "skills" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100),
  "category" varchar(100),
  "created_at" timestamp
);

CREATE TABLE "departments" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE,
  "name" varchar(150),
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "office_locations" (
  "id" uuid PRIMARY KEY,
  "department_id" uuid,
  "name" varchar(150),
  "address" text,
  "latitude" decimal,
  "longitude" decimal,
  "radius_meter" integer,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "attendance_settings" (
  "id" uuid PRIMARY KEY,
  "office_location_id" uuid,
  "check_in_start" time,
  "check_in_end" time,
  "check_out_start" time,
  "check_out_end" time,
  "late_after" time,
  "allow_weekend" boolean DEFAULT false,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "certificate_templates" (
  "id" uuid PRIMARY KEY,
  "name" varchar(150),
  "template_file_id" uuid,
  "is_default" boolean,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "intern_profiles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid UNIQUE NOT NULL,
  "student_number" varchar(100) NOT NULL,
  "institution_id" uuid NOT NULL,
  "major_id" uuid NOT NULL,
  "phone" varchar(30) NOT NULL,
  "emergency_contact" varchar(30),
  "address" text,
  "birth_place" varchar(100),
  "birth_date" date,
  "gender" varchar(20),
  "bio" text,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "intern_profile_skills" (
  "intern_profile_id" uuid,
  "skill_id" uuid,
  "proficiency" varchar(30),
  "created_at" timestamp,
  PRIMARY KEY ("intern_profile_id", "skill_id")
);

CREATE TABLE "internship_applications" (
  "id" uuid PRIMARY KEY,
  "intern_profile_id" uuid NOT NULL,
  "application_number" varchar(100) UNIQUE,
  "introduction_letter_file_id" uuid NOT NULL,
  "requested_start_date" date,
  "requested_end_date" date,
  "motivation" text,
  "status" varchar(50),
  "reviewed_by" uuid,
  "reviewed_at" timestamp,
  "rejection_reason" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "internships" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid UNIQUE,
  "intern_profile_id" uuid,
  "department_id" uuid,
  "office_location_id" uuid,
  "actual_start_date" date,
  "actual_end_date" date,
  "status" varchar(50),
  "onboarding_completed" boolean DEFAULT false,
  "completed_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "supervisor_assignments" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid,
  "supervisor_id" uuid,
  "assigned_by" uuid,
  "assigned_at" timestamp,
  "ended_at" timestamp,
  "is_active" boolean DEFAULT true
);

CREATE TABLE "onboarding_histories" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid,
  "accepted" boolean,
  "accepted_at" timestamp,
  "ip_address" varchar(100),
  "user_agent" text
);

CREATE TABLE "internship_status_histories" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid,
  "old_status" varchar(50),
  "new_status" varchar(50),
  "changed_by" uuid,
  "notes" text,
  "created_at" timestamp
);

CREATE TABLE "attendances" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid NOT NULL,
  "attendance_date" date NOT NULL,
  "check_in_at" timestamp,
  "check_out_at" timestamp,
  "check_in_status" varchar(30),
  "check_out_status" varchar(30),
  "attendance_status" varchar(30),
  "total_work_minutes" integer,
  "notes" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "attendance_logs" (
  "id" uuid PRIMARY KEY,
  "attendance_id" uuid NOT NULL,
  "action" varchar(50),
  "latitude" decimal(10,7),
  "longitude" decimal(10,7),
  "accuracy_meter" decimal(10,2),
  "distance_meter" decimal(10,2),
  "inside_geofence" boolean,
  "device_name" varchar(255),
  "platform" varchar(100),
  "browser" varchar(100),
  "ip_address" varchar(100),
  "user_agent" text,
  "fake_gps_detected" boolean DEFAULT false,
  "photo_file_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "attendance_overrides" (
  "id" uuid PRIMARY KEY,
  "attendance_id" uuid NOT NULL,
  "supervisor_id" uuid NOT NULL,
  "previous_status" varchar(50),
  "new_status" varchar(50),
  "reason" text,
  "created_at" timestamp
);

CREATE TABLE "attendance_devices" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "device_name" varchar(255),
  "browser" varchar(100),
  "platform" varchar(100),
  "fingerprint" varchar(255),
  "first_login_at" timestamp,
  "last_login_at" timestamp,
  "is_trusted" boolean DEFAULT false,
  "created_at" timestamp
);

CREATE TABLE "attendance_violations" (
  "id" uuid PRIMARY KEY,
  "attendance_id" uuid NOT NULL,
  "violation_type" varchar(50),
  "severity" varchar(20),
  "description" text,
  "resolved" boolean DEFAULT false,
  "resolved_by" uuid,
  "resolved_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "attendance_reminders" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid NOT NULL,
  "reminder_type" varchar(30),
  "scheduled_at" timestamp,
  "sent_at" timestamp,
  "status" varchar(30),
  "created_at" timestamp
);

CREATE TABLE "files" (
  "id" uuid PRIMARY KEY,
  "original_name" varchar(255),
  "file_name" varchar(255),
  "mime_type" varchar(100),
  "extension" varchar(20),
  "size" bigint,
  "storage_provider" varchar(50),
  "public_id" varchar(255),
  "url" text,
  "uploaded_by" uuid,
  "created_at" timestamp
);

CREATE TABLE "certificates" (
  "id" uuid PRIMARY KEY,
  "internship_id" uuid UNIQUE,
  "template_id" uuid,
  "certificate_number" varchar(100) UNIQUE,
  "file_id" uuid,
  "generated_by" uuid,
  "generated_at" timestamp,
  "verification_token" varchar(255),
  "created_at" timestamp
);

CREATE TABLE "notification_types" (
  "id" uuid PRIMARY KEY,
  "code" varchar(100) UNIQUE,
  "name" varchar(150),
  "created_at" timestamp
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "type_id" uuid,
  "title" varchar(255),
  "message" text,
  "is_broadcast" boolean DEFAULT false,
  "sender_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "notification_reads" (
  "notification_id" uuid,
  "user_id" uuid,
  "read_at" timestamp,
  PRIMARY KEY ("notification_id", "user_id")
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "module" varchar(100),
  "action" varchar(100),
  "table_name" varchar(100),
  "record_id" uuid,
  "old_data" json,
  "new_data" json,
  "ip_address" varchar(100),
  "user_agent" text,
  "created_at" timestamp
);

CREATE TABLE "activity_logs" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "activity" varchar(255),
  "description" text,
  "ip_address" varchar(100),
  "created_at" timestamp
);

ALTER TABLE "users" ADD FOREIGN KEY ("avatar_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_roles" ADD FOREIGN KEY ("assigned_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "institutions" ADD FOREIGN KEY ("education_level_id") REFERENCES "education_levels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "institution_majors" ADD FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "office_locations" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_settings" ADD FOREIGN KEY ("office_location_id") REFERENCES "office_locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificate_templates" ADD FOREIGN KEY ("template_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "intern_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "intern_profiles" ADD FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "intern_profiles" ADD FOREIGN KEY ("major_id") REFERENCES "institution_majors" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "intern_profile_skills" ADD FOREIGN KEY ("intern_profile_id") REFERENCES "intern_profiles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "intern_profile_skills" ADD FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internship_applications" ADD FOREIGN KEY ("intern_profile_id") REFERENCES "intern_profiles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internship_applications" ADD FOREIGN KEY ("introduction_letter_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internship_applications" ADD FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internships" ADD FOREIGN KEY ("application_id") REFERENCES "internship_applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internships" ADD FOREIGN KEY ("intern_profile_id") REFERENCES "intern_profiles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internships" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internships" ADD FOREIGN KEY ("office_location_id") REFERENCES "office_locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "supervisor_assignments" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "supervisor_assignments" ADD FOREIGN KEY ("supervisor_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "supervisor_assignments" ADD FOREIGN KEY ("assigned_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "onboarding_histories" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internship_status_histories" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "internship_status_histories" ADD FOREIGN KEY ("changed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendances" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_logs" ADD FOREIGN KEY ("attendance_id") REFERENCES "attendances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_logs" ADD FOREIGN KEY ("photo_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_overrides" ADD FOREIGN KEY ("attendance_id") REFERENCES "attendances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_overrides" ADD FOREIGN KEY ("supervisor_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_devices" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_violations" ADD FOREIGN KEY ("attendance_id") REFERENCES "attendances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_violations" ADD FOREIGN KEY ("resolved_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_reminders" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "files" ADD FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificates" ADD FOREIGN KEY ("internship_id") REFERENCES "internships" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificates" ADD FOREIGN KEY ("template_id") REFERENCES "certificate_templates" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificates" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificates" ADD FOREIGN KEY ("generated_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("type_id") REFERENCES "notification_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_reads" ADD FOREIGN KEY ("notification_id") REFERENCES "notifications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_reads" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "activity_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
