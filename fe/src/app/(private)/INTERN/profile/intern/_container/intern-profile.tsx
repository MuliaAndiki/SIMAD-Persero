"use client";

import { InternProfileSection } from "@/components/page/profile/InternProfileSection";
import { useApi } from "@/hooks/useService/useApi";
import type { PickMergeInternship } from "@/types/api/internship.types";
import { useEffect, useState } from "react";

/**
 * Container halaman profil magang (GET /institutions; GET /internships/my; POST /internships/profile).
 *
 * Institusi di-fetch terlebih dahulu lalu di-map ke dropdown pencarian;
 * userId diambil dari sesi login dan ditambahkan ke payload saat submit.
 */
export default function InternProfileContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const institutions = api.institution.query.list({ page: 1, limit: 100 });
  const myProfile = api.internship.query.myProfile();
  const createProfile = api.internship.mutate.createProfile();
  const userId = me.data?.id;
  const [institutionId, setInstitutionId] = useState<string>("");

  const [formApplication, setFormApplication] = useState<PickMergeInternship>({
    address: "",
    bio: "",
    birthDate: "",
    birthPlace: "",
    emergencyContact: "",
    gender: "",
    id: "",
    institutionId: "",
    majorId: "",
    name: "",
    phone: "",
    studentNumber: "",
    userId: "",
  });

  useEffect(() => {
    const profile = myProfile.data;
    if (!profile) return;

    setFormApplication((prev) => ({
      ...prev,
      id: profile.id ?? prev.id,
      name: profile.major?.name ?? prev.name,
      address: profile.address ?? prev.address,
      bio: profile.bio ?? prev.bio,
      birthDate: profile.birthDate?.slice(0, 10) ?? prev.birthDate,
      birthPlace: profile.birthPlace ?? prev.birthPlace,
      emergencyContact: profile.emergencyContact ?? prev.emergencyContact,
      gender: profile.gender ?? prev.gender,
      institutionId: profile.institutionId ?? prev.institutionId,
      majorId: profile.majorId ?? prev.majorId,
      phone: profile.phone ?? prev.phone,
      studentNumber: profile.studentNumber ?? prev.studentNumber,
      userId: profile.userId ?? prev.userId,
    }));
    setInstitutionId(profile.institutionId ?? "");
  }, [myProfile.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    createProfile.mutate({
      ...formApplication,
      institutionId,
      userId: formApplication.userId || userId,
    });
  };

  return (
    <InternProfileSection
      state={{
        isPending: me.isPending || institutions.isPending,
        isError: Boolean(me.isError || institutions.isError),
        errorMessage: institutions.error?.message ?? me.error?.message,
        institutions: institutions.data ?? [],
        formApplication,
        setFormApplication,
        institutionId,
        setInstitutionId,
        isSubmitting: createProfile.isPending,
      }}
      service={{ handleSubmit }}
    />
  );
}
