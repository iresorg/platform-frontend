"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// A plain <a href> can't carry a token held in memory, so this fetches
// authenticated (via `fetchBlob`, which should call apiRequest or
// equivalent) and saves the result as a blob URL (guide 2.3, A12/P9).
export function FileDownload({
  filename,
  fetchBlob,
  label = "Download",
}: {
  filename: string;
  fetchBlob: () => Promise<Blob>;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  async function download() {
    setPending(true);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't download the file.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void download()}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
      {pending ? "Downloading..." : label}
    </Button>
  );
}
