"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, ArrowUp, Bot, Building2, LoaderCircle } from "lucide-react";
import AgentSettingsPanel from "@/components/AgentSettingsPanel";
import MeetingConsole from "@/components/MeetingConsole";
import OfficeScene from "@/components/OfficeScene";
import {
  AGENT_NAMES,
  DEFAULT_AGENT_SETTINGS,
  isHighCostModel,
  type AgentName,
  type AgentSettingsMap,
  type MeetingLogItem,
  type MeetingResponse,
} from "@/lib/agents";
import { MAX_ORDER_CHARS, MAX_PROVIDER_CALLS } from "@/lib/meeting-limits";
import type { OrchestratorEvent } from "@/lib/providers/types";

const SUGGESTIONS = [
  "신규 생산성 앱의 4주 출시 계획을 세워줘",
  "우리 브랜드의 여름 캠페인을 기획해줘",
  "B2B SaaS 랜딩페이지 개선안을 만들어줘",
];

export default function Home() {
  const [order, setOrder] = useState("");
  const [result, setResult] = useState<MeetingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveLogs, setLiveLogs] = useState<MeetingLogItem[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [agentSettings, setAgentSettings] = useState<AgentSettingsMap>(() =>
    Object.fromEntries(
      AGENT_NAMES.map((name) => [name, { ...DEFAULT_AGENT_SETTINGS[name] }]),
    ) as AgentSettingsMap,
  );

  async function submitOrder(event?: FormEvent) {
    event?.preventDefault();
    const trimmedOrder = order.trim();

    if (!trimmedOrder) {
      setError("회의를 시작할 오더를 입력해 주세요.");
      return;
    }

    const highCostAgents = AGENT_NAMES.filter((name) =>
      isHighCostModel(agentSettings[name].provider, agentSettings[name].model),
    );
    if (
      highCostAgents.length > 0 &&
      !window.confirm(
        `${highCostAgents.join(", ")}에 고비용 모델이 선택되어 있습니다. 이 회의는 최대 ${MAX_PROVIDER_CALLS}회의 AI 호출을 사용합니다. 계속할까요?`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setLiveLogs([]);
    setActiveAgent(null);

    try {
      const response = await fetch("/api/meeting/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: trimmedOrder, agentSettings }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "회의 요청에 실패했습니다.");
      }
      if (!response.body) throw new Error("회의 스트림을 시작하지 못했습니다.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const collectedLogs: MeetingLogItem[] = [];
      let finalReport = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const streamEvent = JSON.parse(line) as
            | OrchestratorEvent
            | { type: "error"; message: string };
          if (streamEvent.type === "error") throw new Error(streamEvent.message);
          if (streamEvent.type === "speaking") setActiveAgent(streamEvent.agent);
          if (streamEvent.type === "log") {
            collectedLogs.push(streamEvent.log);
            setLiveLogs([...collectedLogs]);
          }
          if (streamEvent.type === "final") finalReport = streamEvent.finalReport;
          if (streamEvent.type === "done") setActiveAgent(null);
        }
        if (done) break;
      }

      if (!finalReport || collectedLogs.length === 0) {
        throw new Error("회의 결과가 완성되지 않았습니다.");
      }
      setResult({ logs: collectedLogs, finalReport });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
      setActiveAgent(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090e] text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,0.18),transparent_42%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="relative z-10 border-b border-white/[0.06] bg-[#080a10]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 text-slate-950 shadow-lg shadow-violet-500/20">
              <Building2 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-semibold leading-none tracking-tight text-white">AI Company</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.19em] text-slate-600">Virtual Office</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="hidden sm:inline">5 agents online</span>
            <span className="sm:hidden">Online</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <AgentSettingsPanel settings={agentSettings} onChange={setAgentSettings} />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="min-w-0">
            <OfficeScene
              className="min-w-0"
              stage={isLoading ? "meeting" : result ? "complete" : "idle"}
              activeAgent={activeAgent}
            />

            <section className="mt-6">
              <form onSubmit={submitOrder}>
                <div className={`rounded-3xl border bg-[#10131b]/90 p-2 shadow-2xl shadow-black/30 backdrop-blur transition ${error ? "border-rose-400/35" : "border-white/[0.09] focus-within:border-violet-400/40"}`}>
                  <textarea
                    aria-label="사장님의 오더"
                    value={order}
                    onChange={(event) => {
                      setOrder(event.target.value);
                      if (error) setError("");
                    }}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submitOrder();
                    }}
                    maxLength={MAX_ORDER_CHARS}
                    rows={3}
                    disabled={isLoading}
                    placeholder="예: 20대 직장인을 위한 AI 일정 관리 앱의 4주 출시 전략을 만들어줘."
                    className="block w-full resize-none bg-transparent px-4 py-3 text-[14px] leading-6 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-2 pb-1 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Bot size={14} />
                      <span>{order.length.toLocaleString()} / {MAX_ORDER_CHARS.toLocaleString()}</span>
                      <span className="hidden sm:inline">· Ctrl/⌘ + Enter</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !order.trim()}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      {isLoading ? (
                        <><LoaderCircle className="animate-spin" size={16} /> 회의 중</>
                      ) : (
                        <>회의 시작 <ArrowUp size={16} strokeWidth={2.5} /></>
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div role="alert" className="mt-3 flex items-center gap-2 px-2 text-sm text-rose-300">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
              </form>

              {!result && !isLoading && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setOrder(suggestion);
                        setError("");
                      }}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-500 transition hover:border-violet-400/25 hover:text-slate-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <MeetingConsole
            key={isLoading ? "meeting" : result ? "complete" : "idle"}
            liveLogs={liveLogs}
            result={result}
            isLoading={isLoading}
            activeAgent={activeAgent}
          />
        </div>
      </div>
    </main>
  );
}
