"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer, Phone, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { computeJob, validateJob, type JobInput } from "@/lib/calc";
import { inr, quoteNumber } from "@/lib/format";

import {
  DEFAULT_FORM,
  quotationToForm,
  rateToForm,
  type FormState,
  type Quotation,
  type SavedRate,
} from "@/components/estimator/types";
import { EstimatorForm } from "@/components/estimator/estimator-form";
import { SummaryCard } from "@/components/estimator/summary-card";
import { HistoryTab } from "@/components/estimator/history-tab";
import { RatesTab, RateDeleteDialog } from "@/components/estimator/rates-tab";
import {
  PreviewDialog,
} from "@/components/estimator/preview-dialog";
import {
  whatsappUrl,
  type QuotationDoc,
} from "@/components/estimator/quotation-document";

function parseJobInput(form: FormState): JobInput {
  return {
    piecesPerSheet: form.piecesPerSheet.trim() === "" ? NaN : Number(form.piecesPerSheet),
    totalPieces: form.totalPieces.trim() === "" ? NaN : Number(form.totalPieces),
    sides: form.sides,
    sheetCostSingle: form.sheetCostSingle.trim() === "" ? NaN : Number(form.sheetCostSingle),
    sheetCostDouble: form.sheetCostDouble.trim() === "" ? NaN : Number(form.sheetCostDouble),
    cutMode: form.cutMode,
    cutCost: form.cutCost.trim() === "" ? NaN : Number(form.cutCost),
    creaseMode: form.creaseMode,
    creaseCost: form.creaseCost.trim() === "" ? NaN : Number(form.creaseCost),
    lamination: form.lamination,
    lamMode: form.lamMode,
    lamCost: form.lamCost.trim() === "" ? NaN : Number(form.lamCost),
  };
}

function docFromForm(
  form: FormState,
  job: JobInput,
  result: ReturnType<typeof computeJob>
): QuotationDoc {
  return {
    quoteNo: null,
    date: new Date(),
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    productName: form.productName,
    orderDetails: form.orderDetails,
    piecesPerSheet: job.piecesPerSheet,
    totalPieces: job.totalPieces,
    sides: job.sides,
    sheetCostSingle: job.sheetCostSingle,
    sheetCostDouble: job.sheetCostDouble,
    cutMode: job.cutMode,
    cutCost: job.cutCost,
    creaseMode: job.creaseMode,
    creaseCost: job.creaseCost,
    lamination: job.lamination,
    lamMode: job.lamMode,
    lamCost: job.lamCost,
    sheets: result.sheets,
    printingCost: result.printingCost,
    cuttingTotal: result.cuttingTotal,
    creasingTotal: result.creasingTotal,
    laminationTotal: result.laminationTotal,
    grandTotal: result.grandTotal,
  };
}

function docFromQuotation(q: Quotation): QuotationDoc {
  return {
    quoteNo: q.quoteNo,
    date: new Date(q.createdAt),
    customerName: q.customerName,
    customerPhone: q.customerPhone,
    productName: q.productName,
    orderDetails: q.orderDetails,
    piecesPerSheet: q.piecesPerSheet,
    totalPieces: q.totalPieces,
    sides: q.sides,
    sheetCostSingle: q.sheetCostSingle,
    sheetCostDouble: q.sheetCostDouble,
    cutMode: q.cutMode,
    cutCost: q.cutCost,
    creaseMode: q.creaseMode,
    creaseCost: q.creaseCost,
    lamination: q.lamination,
    lamMode: q.lamMode,
    lamCost: q.lamCost,
    sheets: q.sheets,
    printingCost: q.printingCost,
    cuttingTotal: q.cuttingTotal,
    creasingTotal: q.creasingTotal,
    laminationTotal: q.laminationTotal,
    grandTotal: q.grandTotal,
  };
}

export default function Home() {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [rates, setRates] = useState<SavedRate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preview dialog
  const [previewData, setPreviewData] = useState<QuotationDoc | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // Rate preset dialog
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);

  // Rate delete dialog
  const [pendingRateDelete, setPendingRateDelete] = useState<SavedRate | null>(null);

  const jobInput = useMemo(() => parseJobInput(form), [form]);
  const result = useMemo(
    () =>
      computeJob({
        piecesPerSheet: Number.isNaN(jobInput.piecesPerSheet) ? 0 : jobInput.piecesPerSheet,
        totalPieces: Number.isNaN(jobInput.totalPieces) ? 0 : jobInput.totalPieces,
        sides: jobInput.sides,
        sheetCostSingle: Number.isNaN(jobInput.sheetCostSingle) ? 0 : jobInput.sheetCostSingle,
        sheetCostDouble: Number.isNaN(jobInput.sheetCostDouble) ? 0 : jobInput.sheetCostDouble,
        cutMode: jobInput.cutMode,
        cutCost: Number.isNaN(jobInput.cutCost) ? 0 : jobInput.cutCost,
        creaseMode: jobInput.creaseMode,
        creaseCost: Number.isNaN(jobInput.creaseCost) ? 0 : jobInput.creaseCost,
        lamination: jobInput.lamination,
        lamMode: jobInput.lamMode,
        lamCost: Number.isNaN(jobInput.lamCost) ? 0 : jobInput.lamCost,
      }),
    [jobInput]
  );
  const errors = useMemo(() => validateJob(jobInput), [jobInput]);

  const loadAll = useCallback(async () => {
    try {
      const [qRes, rRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/rates"),
      ]);
      const [qData, rData] = await Promise.all([qRes.json(), rRes.json()]);
      if (qRes.ok) setQuotations(qData);
      if (rRes.ok) setRates(rData);
    } catch {
      toast.error("Could not load saved data. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditing(null);
  };

  const goNew = () => {
    setTab("new");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (errors.length > 0) return;
    setSaving(true);
    try {
      const payload = { ...form, piecesPerSheet: Number(form.piecesPerSheet) };
      const res = await fetch(
        editing ? `/api/quotations/${editing.id}` : "/api/quotations",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save the quotation.");
        return;
      }
      const saved: Quotation = data;
      await loadAll();
      if (editing) {
        toast.success(`Quotation ${quoteNumber(saved.quoteNo)} updated.`);
        resetForm();
      } else {
        toast.success(`Quotation ${quoteNumber(saved.quoteNo)} saved.`);
        setForm(DEFAULT_FORM);
        // Open the saved quotation so it can be printed or shared right away
        setPreviewTitle(`Quotation ${quoteNumber(saved.quoteNo)}`);
        setPreviewData(docFromQuotation(saved));
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Draft preview ──
  const handlePreview = () => {
    if (result.sheets <= 0) return;
    setPreviewTitle(editing ? `Editing ${quoteNumber(editing.quoteNo)}` : "Draft estimate preview");
    setPreviewData(docFromForm(form, jobInput, result));
  };

  // ── Quick WhatsApp share from form ──
  const handleShare = () => {
    if (result.sheets <= 0) return;
    if (errors.length > 0) {
      toast.error("Complete the estimate before sharing.");
      return;
    }
    window.open(whatsappUrl(docFromForm(form, jobInput, result)), "_blank", "noopener,noreferrer");
  };

  // ── Rate presets ──
  const openPresetDialog = () => {
    setPresetName(form.productName || "");
    setPresetOpen(true);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error("Give this rate preset a name.");
      return;
    }
    if (Number.isNaN(Number(form.piecesPerSheet)) || Number(form.piecesPerSheet) < 1) {
      toast.error("Pieces per sheet must be at least 1 to save rates.");
      return;
    }
    setSavingPreset(true);
    try {
      const res = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name: presetName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save the rate preset.");
        return;
      }
      await loadAll();
      setPresetOpen(false);
      toast.success(`Rates “${presetName.trim()}” saved.`);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSavingPreset(false);
    }
  };

  const handleApplyRate = (r: SavedRate) => {
    setForm((f) => ({ ...rateToForm(r), customerName: f.customerName, customerPhone: f.customerPhone }));
    setEditing(null);
    goNew();
    toast.success(`Rates “${r.name}” applied to the form.`);
  };

  const handleDeleteRate = async () => {
    if (!pendingRateDelete) return;
    try {
      const res = await fetch(`/api/rates/${pendingRateDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete the rate preset.");
        return;
      }
      await loadAll();
      toast.success("Rate preset deleted.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setPendingRateDelete(null);
    }
  };

  // ── History actions ──
  const handleEdit = (q: Quotation) => {
    setForm(quotationToForm(q));
    setEditing(q);
    goNew();
  };

  const handleDuplicate = (q: Quotation) => {
    setForm(quotationToForm(q));
    setEditing(null);
    goNew();
    toast.info("Copy loaded — press “Save quotation” to store it as a new estimate.");
  };

  const handleDeleteQuotation = async (q: Quotation) => {
    try {
      const res = await fetch(`/api/quotations/${q.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete the quotation.");
        return;
      }
      await loadAll();
      if (editing?.id === q.id) resetForm();
      toast.success(`Quotation ${quoteNumber(q.quoteNo)} deleted.`);
    } catch {
      toast.error("Network error — please try again.");
    }
  };

  const totalValue = quotations.reduce((s, q) => s + q.grandTotal, 0);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Printer className="size-5" />
            </div>
            <div>
              <h1 className="text-lg leading-tight font-black tracking-tight">
                SRM ART PRINTS
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                PRINTING COST ESTIMATOR · INTERNAL TOOL
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <Phone className="size-3" /> +91 98417 09111
            </span>
            <a
              href="https://srmartprints.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Globe className="size-3" /> srmartprints.in
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 h-auto w-full justify-start gap-1 rounded-xl bg-muted/70 p-1 sm:w-auto">
            <TabsTrigger value="new" className="px-4 py-2">
              New estimate
            </TabsTrigger>
            <TabsTrigger value="history" className="px-4 py-2">
              History
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs font-bold text-primary">
                {quotations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rates" className="px-4 py-2">
              Saved rates
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs font-bold text-primary">
                {rates.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* NEW ESTIMATE */}
          <TabsContent value="new" className="mt-0">
            <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <div>
                <EstimatorForm form={form} onChange={patch} />
              </div>
              <div>
                <SummaryCard
                  jobInput={jobInput}
                  result={result}
                  errors={errors}
                  editingQuotation={editing}
                  saving={saving}
                  onSave={handleSave}
                  onPreview={handlePreview}
                  onShare={handleShare}
                  onSavePreset={openPresetDialog}
                  onReset={resetForm}
                  onCancelEdit={resetForm}
                />
              </div>
            </div>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-0">
            <HistoryTab
              quotations={quotations}
              loading={loadingData}
              onView={(q) => {
                setPreviewTitle(`Quotation ${quoteNumber(q.quoteNo)}`);
                setPreviewData(docFromQuotation(q));
              }}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteQuotation}
            />
          </TabsContent>

          {/* SAVED RATES */}
          <TabsContent value="rates" className="mt-0">
            <RatesTab
              rates={rates}
              loading={loadingData}
              onApply={handleApplyRate}
              onDelete={(r) => setPendingRateDelete(r)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            SRM ART PRINTS · Internal estimation tool —{" "}
            {loadingData ? "loading…" : `${quotations.length} quotations · ${inr(totalValue)} quoted`}
          </p>
          <a
            href="https://srmartprints.in"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            srmartprints.in
          </a>
        </div>
      </footer>

      {/* ── Preview dialog ── */}
      <PreviewDialog
        open={!!previewData}
        onOpenChange={(o) => {
          if (!o) setPreviewData(null);
        }}
        data={previewData}
        title={previewTitle}
      />

      {/* ── Save rates dialog ── */}
      <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save these rates</DialogTitle>
            <DialogDescription>
              Stores pieces per sheet, printing rates and processing charges so you can reuse
              them quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="presetName" className="text-sm font-medium">
              Preset name
            </label>
            <Input
              id="presetName"
              placeholder="e.g. Visiting cards standard"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={savingPreset}>
              {savingPreset && <Loader2 className="size-4 animate-spin" />}
              Save preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete rate dialog ── */}
      <RateDeleteDialog
        pendingDelete={pendingRateDelete}
        onOpenChange={(o) => {
          if (!o) setPendingRateDelete(null);
        }}
        onConfirm={handleDeleteRate}
      />
    </div>
  );
}
