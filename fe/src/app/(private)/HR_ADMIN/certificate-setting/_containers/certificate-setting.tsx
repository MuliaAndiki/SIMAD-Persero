"use client";

import { CertificateSettingSection } from "@/components/page/hr_admin/CertificateSettingSection";
import { toast } from "sonner";
import { useState } from "react";

export default function CertificateSettingContainer() {
  const [isPending, setIsPending] = useState(false);

  const handleSaveSettings = async (data: {
    signerName: string;
    signerRole: string;
    signatureFile?: File;
  }) => {
    try {
      setIsPending(true);
      toast.loading("Menyimpan pengaturan sertifikat...", {
        id: "save-cert-setting",
      });

      // Simulate API call since there's no backend endpoint yet
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Saved data:", data);

      toast.success("Pengaturan sertifikat berhasil disimpan", {
        id: "save-cert-setting",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Gagal menyimpan pengaturan", { id: "save-cert-setting" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <CertificateSettingSection
      state={{
        isPending,
        // using mock initial data, later fetch from API
        signerName: "Budi Santoso, S.T., M.T.",
        signerRole: "Manager SDM",
      }}
      service={{
        onSaveSettings: handleSaveSettings,
      }}
    />
  );
}
