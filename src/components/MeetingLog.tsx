import { MessagesSquare } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import type { MeetingLogItem } from "@/lib/agents";

interface MeetingLogProps {
  logs: MeetingLogItem[];
}

export default function MeetingLog({ logs }: MeetingLogProps) {
  return (
    <section aria-labelledby="meeting-log-title">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-violet-400/15 bg-violet-400/10 text-violet-300">
            <MessagesSquare size={17} />
          </div>
          <div>
            <h2 id="meeting-log-title" className="font-semibold text-white">
              회의 기록
            </h2>
            <p className="text-xs text-slate-500">AI 팀의 실시간 논의 결과</p>
          </div>
        </div>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-xs text-slate-500">
          {logs.length} messages
        </span>
      </div>
      <div className="space-y-3">
        {logs.map((log, index) => (
          <AgentCard key={`${log.agent}-${index}`} log={log} index={index} />
        ))}
      </div>
    </section>
  );
}
