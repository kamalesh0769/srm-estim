"use client";

import { createPortal } from "react-dom";
import { Download, MessageCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuotationDocument, whatsappUrl, type QuotationDoc } from "./quotation-document";

export function PreviewDialog({
  open,
  onOpenChange,
  data,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: QuotationDoc | null;
  title: string;
}) {
  if (!data) return null;

  const share = () => {
    window.open(whatsappUrl(data), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[780px]">
          <DialogHeader className="sticky top-0 z-10 flex-row items-center justify-between gap-2 border-b bg-white/95 px-5 py-3 backdrop-blur">
            <div className="min-w-0">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="text-xs">
                Check the details before sharing with your customer.
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" onClick={() => window.print()}>
                <Download className="size-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={share}
                className="bg-[#25D366] text-white hover:bg-[#1fb857]"
              >
                <MessageCircle className="size-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                aria-label="Close preview"
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="bg-neutral-100 p-3 sm:p-5">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Screen copy — the printable copy is portaled to <body> below */}
              <QuotationDocument data={data} printable={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print copy: rendered as a direct child of <body> so that @media print
          rules can show it alone, free of dialog transforms and clipping. */}
      {open &&
        createPortal(
          <div className="print-portal">
            <QuotationDocument data={data} printable />
          </div>,
          document.body
        )}
    </>
  );
}
