"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, FileText, LoaderCircle, MessagesSquare } from "lucide-react";
import FinalReport from "@/components/FinalReport";
import { AGENTS, type AgentName, type MeetingLogItem, type MeetingResponse } from "@/lib/agents";

interface MeetingConsoleProps {
  liveLogs: MeetingLogItem[];
  result: MeetingResponse | null;
  isLoading: boolean;
  activeAgent: AgentName | null;
}

export default function MeetingConsole({
  liveLogs,
  result,
  isLoading,
  activeAgent,
}: MeetingConsoleProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "report">("logs");
  const scrollRef = useRef<HTMLDivElement>(null);
  const logs = result?.logs ?? liveLogs;

  useEffect(() => {
    if (activeTab === "logs") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs.length, activeTab]);

  return (
    <aside className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1118]/95 shadow-2xl shadow-black/30 lg:sticky lg:top-6 lg:h-[720px]">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/[0.07] px-5 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg border border-violet-400/15 bg-violet-400/10 text-violet-300">
                <MessagesSquare size={17} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">회의 콘솔</h2>
                <p className="mt-0.5 text-[10px] text-slate-600">실시간 AI 팀 회의</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${isLoading ? "border-violet-400/20 bg-violet-400/10 text-violet-300" : result ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/[0.07] bg-white/[0.03] text-slate-600"}`}>
              {isLoading ? <LoaderCircle className="animate-spin" size={10} /> : result ? <CheckCircle2 size={10} /> : <span className="size-1.5 rounded-full bg-slate-600" />}
              {isLoading ? "회의 중" : result ? "완료" : "대기"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-xl bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${activeTab === "logs" ? "bg-white/[0.07] text-white" : "text-slate-600 hover:text-slate-400"}`}
            >
              회의 기록 {logs.length > 0 && <span className="ml-1 text-violet-300">{logs.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => result && setActiveTab("report")}
              disabled={!result}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${activeTab === "report" ? "bg-white/[0.07] text-white" : "text-slate-600 hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-40"}`}
            >
              최종 보고서
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="meeting-scrollbar min-h-[520px] flex-1 overflow-y-auto overscroll-contain lg:min-h-0">
          {activeTab === "logs" && (
            <div className="space-y-3 p-4">
              {logs.length === 0 && !isLoading && (
                <div className="grid min-h-[420px] place-items-center text-center">
                  <div>
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-700">
                      <Bot size={21} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">아직 회의가 없습니다</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-700">왼쪽에서 오더를 입력하면<br />이곳에 회의 기록이 표시됩니다.</p>
                  </div>
                </div>
              )}

              {logs.length === 0 && isLoading && (
                <div className="grid min-h-[420px] place-items-center text-center">
                  <div>
                    <LoaderCircle className="mx-auto animate-spin text-violet-300" size={24} />
                    <p className="mt-3 text-xs text-slate-500">직원들이 회의실로 이동 중...</p>
                  </div>
                </div>
              )}

              {logs.map((log, index) => {
                const agent = AGENTS[log.agent];
                const isSpeaking = isLoading && activeAgent === log.agent && index === logs.length - 1;
                return (
                  <article key={`${log.agent}-${index}`} className={`animate-rise rounded-2xl border p-4 ${isSpeaking ? "border-violet-400/25 bg-violet-400/[0.07]" : "border-white/[0.06] bg-white/[0.025]"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${agent.color} text-[8px] font-black text-slate-950`}>
                        {agent.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-200">{log.agent}</p>
                          <span className="text-[9px] text-slate-600">{log.status}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-400">{log.message}</p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {isLoading && logs.length > 0 && (
                <div className="flex items-center gap-2 px-2 py-3 text-[10px] text-violet-300">
                  <LoaderCircle className="animate-spin" size={12} />
                  {activeAgent ? `${activeAgent}가 의견을 정리하고 있습니다.` : "다음 발언을 준비하고 있습니다."}
                </div>
              )}
            </div>
          )}

          {activeTab === "report" && result && (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">
                <FileText size={12} /> Final output
              </div>
              <FinalReport report={result.finalReport} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
