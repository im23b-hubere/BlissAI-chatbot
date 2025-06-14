"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function PasswordChangeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({ old: "", neu: "", neu2: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.old || !form.neu || !form.neu2) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.neu !== form.neu2) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: form.old, newPassword: form.neu }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error changing password.");
      } else {
        setSuccess("Password changed successfully!");
        setTimeout(() => {
          onOpenChange(false);
        }, 1200);
      }
    } catch (err) {
      setError("Error changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="old"
            type="password"
            placeholder="Current password"
            value={form.old}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            name="neu"
            type="password"
            placeholder="New password"
            value={form.neu}
            onChange={handleChange}
            disabled={loading}
            required
            minLength={8}
          />
          <Input
            name="neu2"
            type="password"
            placeholder="Repeat new password"
            value={form.neu2}
            onChange={handleChange}
            disabled={loading}
            required
            minLength={8}
          />
          {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">{error}</div>}
          {success && <div className="bg-success/10 text-success text-sm p-2 rounded-md">{success}</div>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
                  Changing...
                </span>
              ) : (
                "Change password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 