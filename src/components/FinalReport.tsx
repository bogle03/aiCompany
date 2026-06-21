import { CheckCircle2, ClipboardCheck } from "lucide-react";

interface FinalReportProps {
  report: string;
}

function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith("### ")) {
    return <h4 key={index}>{line.slice(4)}</h4>;
  }
  if (line.startsWith("## ")) {
    return <h3 key={index}>{line.slice(3)}</h3>;
  }
  if (line.startsWith("# ")) {
    return <h2 key={index}>{line.slice(2)}</h2>;
  }
  if (/^[-*] /.test(line)) {
    return (
      <div key={index} className="report-list-item">
        <CheckCircle2 size={15} />
        <span>{line.slice(2)}</span>
      </div>
    );
  }
  if (/^\d+\. /.test(line)) {
    const match = line.match(/^(\d+)\. (.*)$/);
    return (
      <div key={index} className="report-list-item numbered">
        <span className="number">{match?.[1]}</span>
        <span>{match?.[2]}</span>
      </div>
    );
  }
  if (!line.trim()) return <div key={index} className="h-2" />;
  return <p key={index}>{line.replace(/\*\*/g, "")}</p>;
}

export default function FinalReport({ report }: FinalReportProps) {
  return (
    <section
      aria-labelledby="final-report-title"
      className="animate-rise relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] via-[#11141c] to-cyan-500/[0.05] p-6 shadow-2xl shadow-violet-950/20 sm:p-8"
    >
      <div className="absolute -right-20 -top-20 size-52 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-7 flex items-center gap-4 border-b border-white/[0.07] pb-6">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-slate-950 shadow-lg shadow-violet-500/20">
            <ClipboardCheck size={22} strokeWidth={2.4} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300">
              Executive summary
            </span>
            <h2 id="final-report-title" className="mt-1 text-xl font-semibold text-white">
              최종 보고서
            </h2>
          </div>
        </div>
        <div className="report-content">
          {report.split("\n").map(renderMarkdownLine)}
        </div>
      </div>
    </section>
  );
}
