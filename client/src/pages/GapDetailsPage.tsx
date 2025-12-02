import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface GapDetailsPageProps {
  params: {
    gapId: string;
  };
}

type Gap = {
  gap_id: string;
  description: string;
  current_state: string;
  target_state: string;
  risk_score: number;
  priority: string;
  recommendations: string[];
  benchmark_source: string;
};

type Comment = {
  id: string;
  author: string;
  text: string;
  created_at: string;
};

function getRiskLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Critical", color: "bg-red-100 text-red-700" };
  if (score >= 6) return { label: "High", color: "bg-orange-100 text-orange-700" };
  if (score >= 4) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Low", color: "bg-emerald-100 text-emerald-700" };
}

export default function GapDetailsPage({ params }: GapDetailsPageProps) {
  const { gapId } = params;
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  // First try to get gap from cached assessment data
  const cachedGap = queryClient.getQueryData<Gap>(["gap-details", gapId]);
  
  // Fallback to API if not in cache
  const { data: apiGap, isLoading: isLoadingApi } = useQuery<Gap>({
    queryKey: ["gap-details", gapId],
    queryFn: async () => {
      const res = await fetch(`/api/assess/gaps/${gapId}`);
      if (!res.ok) throw new Error("Failed to load gap details");
      return res.json();
    },
    enabled: !cachedGap, // Only fetch if not in cache
  });

  // Use cached gap if available, otherwise use API gap
  const gap = cachedGap || apiGap;
  const isLoading = !cachedGap && isLoadingApi;

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["gap-comments", gapId],
    queryFn: async () => {
      const res = await fetch(`/api/assess/gaps/${gapId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      return res.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/assess/gaps/${gapId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["gap-comments", gapId] });
    },
  });

  if (isLoading || !gap) {
    return (
      <div className="h-full w-full p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading gap details…</p>
        </div>
      </div>
    );
  }

  const riskMeta = getRiskLabel(gap.risk_score);

  return (
    <div className="h-full w-full flex flex-col gap-4 p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/gaps">
            <button className="inline-flex items-center gap-1 text-xs text-primary">
              <ArrowLeft className="h-3 w-3" />
              Back to Gaps
            </button>
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">BP Gap Assessment</p>
            <h1 className="text-xl font-semibold">{gap.gap_id}</h1>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-2xl font-bold">
              {gap.risk_score}
              <span className="text-base text-muted-foreground">/10</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${riskMeta.color}`}
            >
              <AlertTriangle className="h-3 w-3" />
              {riskMeta.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Risk Score</p>
        </div>
      </div>

      {/* Main content */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <h2 className="text-sm font-semibold mb-1">Gap Description</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {gap.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Current State</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {gap.current_state}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Target State</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {gap.target_state}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Benchmark Source</h3>
            <p className="text-sm text-muted-foreground">
              {gap.benchmark_source}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {gap.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ol>
        </div>
      </Card>

      {/* Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-2">Comments &amp; Updates</h3>
          <div className="space-y-3 max-h-64 overflow-auto mb-4">
            {(comments ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">
                No comments yet. Be the first to add one.
              </p>
            )}
            {(comments ?? []).map((c) => (
              <div key={c.id} className="border rounded-md px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{c.author}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {c.text}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Add comment or update…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!commentText.trim() || addComment.isPending}
                onClick={() => addComment.mutate(commentText.trim())}
              >
                {addComment.isPending ? "Saving…" : "Add Comment"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Benchmark Source</h3>
          <p className="text-xs text-muted-foreground mb-3">
            This gap is benchmarked against industry leading practices from:
          </p>
          <ul className="text-sm space-y-1">
            {gap.benchmark_source.split(",").map((name) => (
              <li key={name.trim()}>• {name.trim()}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}