"use client";

import { useState, type CSSProperties } from "react";
import { Armchair, Coffee, DoorOpen, Monitor, RotateCcw, Users } from "lucide-react";
import { AGENTS, AGENT_NAMES, type AgentName } from "@/lib/agents";

export type OfficeStage = "idle" | "meeting" | "complete";

interface OfficeSceneProps {
  stage: OfficeStage;
  activeAgent?: AgentName | null;
  className?: string;
}

interface Position {
  left: string;
  top: string;
}

const DESK_POSITIONS: Record<AgentName, Position> = {
  "PM AI": { left: "17%", top: "24%" },
  "마케터 AI": { left: "17%", top: "70%" },
  "디자이너 AI": { left: "83%", top: "24%" },
  "개발자 AI": { left: "83%", top: "70%" },
  "분석가 AI": { left: "50%", top: "84%" },
};

const MEETING_POSITIONS: Record<AgentName, Position> = {
  "PM AI": { left: "50%", top: "31%" },
  "마케터 AI": { left: "37%", top: "43%" },
  "디자이너 AI": { left: "63%", top: "43%" },
  "개발자 AI": { left: "40%", top: "64%" },
  "분석가 AI": { left: "60%", top: "64%" },
};

function Desk({ className }: { className: string }) {
  return (
    <div className={`absolute flex h-[18%] w-[22%] items-center justify-center rounded-lg border border-white/[0.08] bg-[#171b24] shadow-lg ${className}`}>
      <div className="absolute inset-x-[10%] top-[18%] h-[5px] rounded-full bg-white/[0.04]" />
      <Monitor className="text-slate-600" size={18} />
      <div className="absolute -bottom-2 h-3 w-[42%] rounded-b-lg border-x border-b border-white/[0.06] bg-[#10131a]" />
    </div>
  );
}

export default function OfficeScene({ stage, activeAgent, className = "mx-auto mt-12 max-w-5xl sm:mt-16" }: OfficeSceneProps) {
  const [previewMeeting, setPreviewMeeting] = useState(false);
  const effectiveStage = stage === "idle" && previewMeeting ? "meeting" : stage;
  const isGathered = effectiveStage !== "idle";

  return (
    <section aria-labelledby="office-title" className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
            <Users size={17} />
          </div>
          <div>
            <h2 id="office-title" className="font-semibold text-white">가상 오피스</h2>
            <p className="text-xs text-slate-500">
              {effectiveStage === "idle" && "각자의 자리에서 업무 중"}
              {effectiveStage === "meeting" && "회의실로 이동해 논의 중"}
              {effectiveStage === "complete" && "회의 완료 · 보고서 작성 완료"}
            </p>
          </div>
        </div>
        {stage === "idle" && (
          <button
            type="button"
            onClick={() => setPreviewMeeting((current) => !current)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white"
          >
            {previewMeeting ? <RotateCcw size={14} /> : <Users size={14} />}
            {previewMeeting ? "자리로 복귀" : "회의실 소집 테스트"}
          </button>
        )}
      </div>

      <div className="office-floor relative aspect-[16/10] min-h-[330px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1118] shadow-2xl shadow-black/30 sm:min-h-0">
        <div className="absolute inset-3 rounded-2xl border border-white/[0.045] sm:inset-5" />
        <div className="absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-b-xl border-x border-b border-cyan-400/10 bg-cyan-400/[0.05]">
          <div className="mx-auto mt-1 h-1 w-10 rounded-full bg-cyan-300/30 shadow-[0_0_12px_rgba(103,232,249,.35)]" />
        </div>

        <Desk className="left-[5%] top-[11%]" />
        <Desk className="bottom-[11%] left-[5%]" />
        <Desk className="right-[5%] top-[11%]" />
        <Desk className="bottom-[11%] right-[5%]" />
        <Desk className="bottom-[2%] left-1/2 -translate-x-1/2" />

        <div className={`absolute left-1/2 top-1/2 h-[38%] w-[31%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border transition duration-700 ${isGathered ? "border-violet-400/25 bg-violet-400/[0.07] shadow-[0_0_50px_rgba(124,58,237,.10)]" : "border-white/[0.06] bg-[#151923]"}`}>
          <div className="absolute inset-[13%] rounded-[45%] border border-white/[0.05]" />
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.24em] text-slate-700 sm:text-[10px]">
            Meeting room
          </p>
        </div>

        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:bottom-5 sm:left-6">
          <DoorOpen size={12} /> Entrance
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-black/10 px-2 py-1.5 text-[9px] text-slate-600 sm:right-6 sm:top-6">
          <Coffee size={12} /> Lounge
        </div>
        <Armchair className="absolute bottom-[26%] left-[28%] text-slate-800" size={19} />
        <Armchair className="absolute bottom-[26%] right-[28%] text-slate-800" size={19} />

        {AGENT_NAMES.map((name, index) => {
          const agent = AGENTS[name];
          const isSpeaking = effectiveStage === "meeting" && activeAgent === name;
          const position = isGathered ? MEETING_POSITIONS[name] : DESK_POSITIONS[name];
          const style = {
            left: position.left,
            top: position.top,
            transitionDelay: `${index * 110}ms`,
          } as CSSProperties;

          return (
            <div
              key={name}
              className="office-unit absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={style}
              title={name}
            >
              {isSpeaking && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-violet-300/20 bg-violet-300 px-2 py-1 text-[8px] font-bold text-violet-950 shadow-lg">
                  발언 중
                </span>
              )}
              <div className={`unit-body relative grid size-9 place-items-center rounded-xl bg-gradient-to-br ${agent.color} text-[9px] font-black text-slate-950 shadow-lg ${agent.glow} sm:size-11 sm:text-[10px] ${isSpeaking ? "ring-4 ring-violet-300/30 brightness-110" : ""}`}>
                {agent.initials}
                <span className={`absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[#0d1118] ${effectiveStage === "complete" ? "bg-emerald-400" : isSpeaking ? "animate-pulse bg-violet-200" : effectiveStage === "meeting" ? "bg-amber-300" : "bg-cyan-300"}`} />
              </div>
              <div className="mt-1.5 -translate-x-[18%] whitespace-nowrap rounded-md border border-white/[0.06] bg-[#090c12]/90 px-1.5 py-0.5 text-center text-[8px] font-medium text-slate-400 shadow-lg sm:text-[9px]">
                {name}
              </div>
            </div>
          );
        })}

        {effectiveStage === "meeting" && (
          <div className="absolute left-1/2 top-[12%] -translate-x-1/2 rounded-full border border-violet-400/15 bg-violet-400/10 px-3 py-1 text-[9px] font-medium text-violet-300 sm:text-[10px]">
            LIVE · AI 회의 진행 중
          </div>
        )}
      </div>
    </section>
  );
}
