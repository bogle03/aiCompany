import { Check, Radio } from "lucide-react";
import { AGENTS, type MeetingLogItem } from "@/lib/agents";

interface AgentCardProps {
  log: MeetingLogItem;
  index: number;
}

export default function AgentCard({ log, index }: AgentCardProps) {
  const agent = AGENTS[log.agent];
  const isComplete = log.status === "검토완료";

  return (
    <article
      className="animate-rise group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#11141c]/90 p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] sm:p-6"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${agent.color} text-xs font-black tracking-wider text-slate-950 shadow-lg ${agent.glow}`}
        >
          {agent.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold tracking-tight text-white">{log.agent}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{agent.role}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                isComplete
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-violet-400/20 bg-violet-400/10 text-violet-300"
              }`}
            >
              {isComplete ? <Check size={11} /> : <Radio className="animate-pulse" size={11} />}
              {log.status}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-300">
            {log.message}
          </p>
        </div>
      </div>
    </article>
  );
}
