import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, differenceInDays, format, parseISO, startOfDay } from "date-fns";
import { BarChart3, Bell, BriefcaseBusiness, CalendarDays, CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Opportunity = Tables<"opportunities">;
type OpportunityType = "Job" | "Internship" | "Scholarship" | "Competition";
type OpportunityStatus = "Applied" | "Interview" | "Accepted" | "Rejected" | "No Response Yet";

const TYPES: OpportunityType[] = ["Job", "Internship", "Scholarship", "Competition"];
const STATUSES: OpportunityStatus[] = ["Applied", "Interview", "Accepted", "Rejected", "No Response Yet"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit — Opportunity Tracker" },
      { name: "description", content: "Track applications, deadlines, and responses in one calm workspace." },
      { property: "og:title", content: "Orbit — Opportunity Tracker" },
      { property: "og:description", content: "Track applications, deadlines, and responses in one calm workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrbitPage,
});

async function fetchOpportunities() {
  const { data, error } = await supabase.from("opportunities").select("*").order("deadline", { ascending: true });
  if (error) throw error;
  return data;
}

function daysLabel(deadline: string) {
  const days = differenceInCalendarDays(parseISO(deadline), startOfDay(new Date()));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function daysSinceStatusChange(opportunity: Opportunity) {
  const reference = opportunity.updated_at ?? opportunity.created_at;
  return differenceInDays(startOfDay(new Date()), startOfDay(parseISO(reference)));
}

function isImminent(opportunity: Opportunity) {
  const days = differenceInCalendarDays(parseISO(opportunity.deadline), startOfDay(new Date()));
  const actionable = opportunity.status === "Applied" || opportunity.status === "Interview";
  return actionable && (days === 0 || days === -1);
}

function calendarUrl(opportunity: Opportunity) {
  const start = format(parseISO(opportunity.deadline), "yyyyMMdd");
  const end = format(parseISO(opportunity.deadline), "yyyyMMdd", ) ;
  return void 0;
}

function OrbitPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState<Opportunity | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  const { data: opportunities = [], isLoading, isError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["opportunities"] });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OpportunityStatus }) => {
      const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: () => toast.error("Couldn’t update that status."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleting(null);
      refresh();
      toast.success("Opportunity removed.");
    },
    onError: () => toast.error("Couldn’t remove that opportunity."),
  });

  const stats = useMemo(() => {
    const responses = opportunities.filter((item) => item.responded_at);
    const waitingDays = responses.map((item) =>
      Math.max(0, differenceInDays(parseISO(item.responded_at ?? item.updated_at), parseISO(item.created_at))),
    );
    return {
      total: opportunities.length,
      pending: opportunities.filter((item) => item.status === "Applied" || item.status === "No Response Yet").length,
      rate: opportunities.length ? Math.round((responses.length / opportunities.length) * 100) : 0,
      average: waitingDays.length ? Math.round(waitingDays.reduce((sum, value) => sum + value, 0) / waitingDays.length) : 0,
    };
  }, [opportunities]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="font-display text-3xl leading-none">Orbit</p>
            <p className="mt-1 text-xs text-muted-foreground">Track anything and Everything</p>
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setStatsOpen(!statsOpen)} aria-label="Toggle statistics">
            <BarChart3 className="size-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <section className="py-8 sm:py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-accent-foreground">In your orbit</p>
              <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">What are you<br className="sm:hidden" /> waiting on?</h1>
            </div>
            <Button className="hidden h-11 sm:inline-flex" onClick={openCreate}><Plus /> Add opportunity</Button>
          </div>
        </section>

        {statsOpen && <StatsPanel stats={stats} />}

        <section aria-labelledby="opportunities-heading">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 id="opportunities-heading" className="text-sm font-semibold">Upcoming</h2>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{opportunities.length} total</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Gathering your opportunities…</div>
          ) : isError ? (
            <div className="border border-border bg-card p-6 text-center">
              <p className="font-display text-2xl">Orbit is out of reach.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try again in a moment.</p>
              <Button variant="outline" className="mt-5 h-11" onClick={() => refresh()}>Try again</Button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="border border-dashed border-border px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-accent-foreground"><BriefcaseBusiness className="size-5" /></div>
              <h3 className="mt-5 font-display text-2xl">Your next possibility starts here.</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add the first thing you’re waiting to hear back about. Orbit will keep the timing in view.</p>
              <Button className="mt-6 h-11" onClick={openCreate}><Plus /> Add your first opportunity</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opportunity) => (
                <OpportunityRow
                  key={opportunity.id}
                  opportunity={opportunity}
                  onEdit={() => { setEditing(opportunity); setFormOpen(true); }}
                  onDelete={() => setDeleting(opportunity)}
                  onStatus={(status) => statusMutation.mutate({ id: opportunity.id, status })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Button className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full p-0 shadow-sm sm:hidden" onClick={openCreate} aria-label="Add opportunity">
        <Plus className="size-6" />
      </Button>

      <OpportunityForm open={formOpen} opportunity={editing} onOpenChange={setFormOpen} onSaved={() => { setFormOpen(false); refresh(); }} />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-md border-border shadow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">Remove this opportunity?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleting?.title} from your orbit.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11">Keep it</AlertDialogCancel>
            <AlertDialogAction className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && deleteMutation.mutate(deleting.id)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function StatsPanel({ stats }: { stats: { total: number; pending: number; rate: number; average: number } }) {
  const items = [
    ["Total applied", stats.total],
    ["Still pending", stats.pending],
    ["Response rate", `${stats.rate}%`],
    ["Avg. wait", `${stats.average}d`],
  ];
  return (
    <section className="mb-8 grid grid-cols-2 border-y border-border sm:grid-cols-4" aria-label="Application statistics">
      {items.map(([label, value], index) => (
        <div key={label} className={`py-5 ${index % 2 === 0 ? "border-r border-border" : ""} ${index < 2 ? "border-b border-border sm:border-b-0" : ""} sm:border-r sm:last:border-r-0 sm:px-5 first:sm:pl-0`}>
          <p className="font-mono text-2xl tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </section>
  );
}

function OpportunityRow({ opportunity, onEdit, onDelete, onStatus }: { opportunity: Opportunity; onEdit: () => void; onDelete: () => void; onStatus: (status: OpportunityStatus) => void }) {
  const days = differenceInCalendarDays(parseISO(opportunity.deadline), startOfDay(new Date()));
  const urgent = days >= 0 && days <= 3;
  return (
    <article className={`border border-border bg-card p-4 sm:p-5 ${urgent ? "border-l-[3px] border-l-urgent" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full status-${opportunity.status.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{opportunity.title}</h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{opportunity.organization} · {opportunity.opportunity_type}</p>
            </div>
            <div className="flex shrink-0">
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={onEdit} aria-label={`Edit ${opportunity.title}`}><Pencil /></Button>
              <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label={`Delete ${opportunity.title}`}><Trash2 /></Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>{format(parseISO(opportunity.deadline), "MMM d, yyyy")}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-mono tabular-nums ${urgent ? "text-urgent-foreground" : ""}`}>{daysLabel(opportunity.deadline)}</span>
            </div>
            <Select value={opportunity.status} onValueChange={(value) => onStatus(value as OpportunityStatus)}>
              <SelectTrigger className="h-11 w-full border-0 px-0 shadow-none sm:w-[150px] sm:justify-end sm:gap-2" aria-label={`Status for ${opportunity.title}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {opportunity.note && <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{opportunity.note}</p>}
        </div>
      </div>
    </article>
  );
}

function OpportunityForm({ open, opportunity, onOpenChange, onSaved }: { open: boolean; opportunity: Opportunity | null; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? "").trim(),
      organization: String(data.get("organization") ?? "").trim(),
      opportunity_type: String(data.get("type") ?? "Job"),
      deadline: String(data.get("deadline") ?? ""),
      status: String(data.get("status") ?? "Applied"),
      note: String(data.get("note") ?? "").trim() || null,
    };
    const result = opportunity
      ? await supabase.from("opportunities").update(payload).eq("id", opportunity.id)
      : await supabase.from("opportunities").insert(payload);
    setSaving(false);
    if (result.error) {
      toast.error("Couldn’t save that opportunity.");
      return;
    }
    toast.success(opportunity ? "Opportunity updated." : "Opportunity added.");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] w-full overflow-y-auto border-border p-5 shadow-sm sm:max-w-xl sm:rounded-md sm:p-7">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-display text-3xl font-normal">{opportunity ? "Edit opportunity" : "Add to your orbit"}</DialogTitle>
          <DialogDescription>Keep the details simple. You can change them anytime.</DialogDescription>
        </DialogHeader>
        <form key={opportunity?.id ?? "new"} onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="title">Opportunity title</Label><Input id="title" name="title" required maxLength={160} defaultValue={opportunity?.title} placeholder="Product design internship" className="h-12" /></div>
          <div className="space-y-2"><Label htmlFor="organization">Organization</Label><Input id="organization" name="organization" required maxLength={160} defaultValue={opportunity?.organization} placeholder="Organization name" className="h-12" /></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="type">Type</Label><Select name="type" defaultValue={opportunity?.opportunity_type ?? "Job"}><SelectTrigger id="type" className="h-12 text-base"><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="deadline">Deadline or response date</Label><Input id="deadline" name="deadline" type="date" required defaultValue={opportunity?.deadline} className="h-12" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select name="status" defaultValue={opportunity?.status ?? "Applied"}><SelectTrigger id="status" className="h-12 text-base"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="note">Note</Label><span className="text-xs text-muted-foreground">Optional</span></div><Textarea id="note" name="note" maxLength={2000} defaultValue={opportunity?.note ?? ""} placeholder="Interview details, contact name, or a reminder…" className="min-h-24 resize-none text-base" /></div>
          <DialogFooter className="gap-2 pt-1 sm:flex-row">
            <Button type="button" variant="outline" className="h-12 sm:flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="h-12 sm:flex-1" disabled={saving}>{saving ? "Saving…" : opportunity ? "Save changes" : "Add opportunity"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}