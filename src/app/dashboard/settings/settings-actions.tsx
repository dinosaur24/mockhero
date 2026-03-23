"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function SettingsActions() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/dashboard/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/sign-in");
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
        Delete Account
      </Button>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </>
        }
      >
        <p>
          This will permanently delete your account, API keys, and all usage
          data. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
