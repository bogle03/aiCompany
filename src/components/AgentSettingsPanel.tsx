"use client";

import { useState } from "react";
import { Bot, Check, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  AGENTS,
  AGENT_NAMES,
  DEFAULT_AGENT_SETTINGS,
  PROVIDER_MODELS,
  type AgentName,
  type AgentProvider,
  type AgentResponseStyle,
  type AgentSettingsMap,
} from "@/lib/agents";

interface AgentSettingsPanelProps {
  settings: AgentSettingsMap;
  onChange: (settings: AgentSettingsMap) => void;
}

const RESPONSE_STYLES: AgentResponseStyle[] = ["균형형", "창의형", "실행형", "비판형"];

export default function AgentSettingsPanel({ settings, onChange }: AgentSettingsPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("PM AI");
  const selected = AGENTS[selectedAgent];
  const selectedSetting = settings[selectedAgent];

  function updateSelected(patch: Partial<(typeof settings)[AgentName]>) {
    onChange({
      ...settings,
      [selectedAgent]: { ...selectedSetting, ...patch },
    });
  }

  function resetSettings() {
    onChange(
      Object.fromEntries(
        AGENT_NAMES.map((name) => [name, { ...DEFAULT_AGENT_SETTINGS[name] }]),
      ) as AgentSettingsMap,
    );
  }

  function selectProvider(provider: AgentProvider) {
    updateSelected({
      provider,
      model: PROVIDER_MODELS[provider][0].id,
    });
  }

  return (
    <section aria-labelledby="agent-settings-title" className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-violet-400/15 bg-violet-400/10 text-violet-300">
            <SlidersHorizontal size={17} />
          </div>
          <div>
            <h1 id="agent-settings-title" className="font-semibold text-white">AI 직원 설정</h1>
            <p className="text-xs text-slate-500">직원을 선택해 업무 방식과 답변 성향을 지정하세요.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetSettings}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-2 text-[11px] text-slate-500 transition hover:border-white/[0.14] hover:text-slate-300"
        >
          <RotateCcw size={12} /> 초기화
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1118]/90 shadow-2xl shadow-black/20">
        <div className="grid grid-cols-2 border-b border-white/[0.07] sm:grid-cols-5">
          {AGENT_NAMES.map((name) => {
            const agent = AGENTS[name];
            const isSelected = selectedAgent === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedAgent(name)}
                className={`relative flex min-h-20 items-center gap-3 border-b border-r border-white/[0.06] px-3 text-left transition last:border-r-0 sm:min-h-24 sm:flex-col sm:justify-center sm:gap-2 sm:border-b-0 ${isSelected ? "bg-white/[0.055]" : "bg-transparent hover:bg-white/[0.025]"}`}
              >
                {isSelected && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-violet-400 sm:inset-x-5" />}
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${agent.color} text-[9px] font-black text-slate-950 shadow-lg ${agent.glow}`}>
                  {agent.initials}
                </span>
                <span className="min-w-0 sm:text-center">
                  <span className={`block truncate text-xs font-medium ${isSelected ? "text-white" : "text-slate-400"}`}>{name}</span>
                  <span className="mt-0.5 block truncate text-[9px] text-slate-600">{agent.role}</span>
                </span>
                <span className={`absolute right-2 top-2 size-1.5 rounded-full ${settings[name].provider === "openai" ? "bg-emerald-400" : "bg-blue-400"}`} />
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">AI 제공자</span>
                <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2 py-0.5 text-[9px] text-amber-300">API 연결 전</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectProvider("openai")}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedSetting.provider === "openai" ? "border-emerald-400/30 bg-emerald-400/[0.08]" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><Bot size={16} /></span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-200">OpenAI</span>
                    <span className="text-[9px] text-slate-600">GPT 모델</span>
                  </span>
                  {selectedSetting.provider === "openai" && <Check className="ml-auto text-emerald-300" size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => selectProvider("gemini")}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedSetting.provider === "gemini" ? "border-blue-400/30 bg-blue-400/[0.08]" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-blue-400/10 text-blue-300"><Sparkles size={16} /></span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-200">Gemini</span>
                    <span className="text-[9px] text-slate-600">Google 모델</span>
                  </span>
                  {selectedSetting.provider === "gemini" && <Check className="ml-auto text-blue-300" size={14} />}
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-400">모델</span>
              <select
                value={selectedSetting.model}
                onChange={(event) => updateSelected({ model: event.target.value })}
                className="block h-11 w-full rounded-xl border border-white/[0.08] bg-[#11151e] px-3 text-xs text-slate-200 outline-none transition focus:border-violet-400/35"
              >
                {PROVIDER_MODELS[selectedSetting.provider].map((model) => (
                  <option key={model.id} value={model.id}>{model.label} · {model.description}</option>
                ))}
              </select>
            </label>

            <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
              {selectedAgent} 업무 지시
              <span className="font-normal text-slate-600">{selectedSetting.instruction.length}/500</span>
            </span>
            <textarea
              value={selectedSetting.instruction}
              onChange={(event) => updateSelected({ instruction: event.target.value })}
              maxLength={500}
              rows={3}
              placeholder={`${selected.role}에게 맡길 업무 기준을 입력하세요.`}
              className="block w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-violet-400/35"
            />
            </label>
          </div>

          <fieldset className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
            <legend className="mb-2 text-xs font-medium text-slate-400">응답 스타일</legend>
            <div className="grid grid-cols-2 gap-2">
              {RESPONSE_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateSelected({ responseStyle: style })}
                  className={`rounded-xl border px-3 py-3 text-xs font-medium transition ${selectedSetting.responseStyle === style ? "border-violet-400/30 bg-violet-400/12 text-violet-200" : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-slate-300"}`}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <p className="text-[10px] leading-5 text-slate-600">
                선택값은 이 브라우저의 로컬 상태에만 저장됩니다. 멀티 모델 API가 연결되면 직원별 요청 경로로 사용됩니다.
              </p>
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
