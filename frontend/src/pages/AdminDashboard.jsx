import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppLayout from "../components/Layout/AppLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { CareersIcon, ProfileIcon, RoadmapIcon, SettingsIcon } from "../components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";

const TABS = ["Overview", "Users", "Analyses", "Model Performance", "Data Pipeline"];

function OverviewIcon(props) {
  return <CareersIcon {...props} />;
}

function UsersIcon(props) {
  return <ProfileIcon {...props} />;
}

function AnalysesIcon(props) {
  return <RoadmapIcon {...props} />;
}

function ModelIcon(props) {
  return <SettingsIcon {...props} />;
}

function PipelineIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 12h3M14 12h3" strokeLinecap="round" />
    </svg>
  );
}

const TAB_ICONS = {
  Overview: OverviewIcon,
  Users: UsersIcon,
  Analyses: AnalysesIcon,
  "Model Performance": ModelIcon,
  "Data Pipeline": PipelineIcon,
};
const PIE_COLORS = ["#534AB7", "#1D9E75", "#FF8C00", "#a0a0b8"];

const ACCURACY_TREND = [
  { version: "v1", accuracy: 87 },
  { version: "v2", accuracy: 86 },
  { version: "v3", accuracy: 86.49 },
];

function f1Color(f1) {
  if (f1 > 0.88) return "text-klenz-teal";
  if (f1 >= 0.83) return "text-yellow-400";
  return "text-red-400";
}

function pipelineF1Color(f1) {
  if (f1 >= 0.9) return "text-green-400";
  if (f1 >= 0.85) return "text-klenz-teal";
  if (f1 >= 0.8) return "text-yellow-400";
  return "text-red-400";
}

const PER_CLASS_METRICS = [
  { career: "Backend Development", precision: 0.86, recall: 0.81, f1: 0.83 },
  { career: "Frontend Development", precision: 0.84, recall: 0.89, f1: 0.87 },
  { career: "AI/ML Development", precision: 0.88, recall: 0.88, f1: 0.88 },
  { career: "UI/UX Design", precision: 0.84, recall: 0.9, f1: 0.87 },
  { career: "DevOps/Cloud", precision: 0.82, recall: 0.88, f1: 0.85 },
  { career: "Data Engineering", precision: 0.9, recall: 0.92, f1: 0.91 },
  { career: "Cybersecurity", precision: 0.87, recall: 0.9, f1: 0.89 },
  { career: "Mobile Development", precision: 0.92, recall: 0.8, f1: 0.86 },
  { career: "Product/Project Management", precision: 0.86, recall: 0.82, f1: 0.84 },
];

const CLASS_DISTRIBUTION = [
  { name: "Backend Dev", fullName: "Backend Development", count: 800, note: "capped + augmented" },
  { name: "Cybersecurity", count: 600 },
  { name: "UI/UX Design", count: 600 },
  { name: "AI/ML Dev", fullName: "AI/ML Development", count: 600 },
  { name: "DevOps/Cloud", count: 600 },
  { name: "Mobile Dev", fullName: "Mobile Development", count: 600 },
  { name: "Data Eng", fullName: "Data Engineering", count: 600 },
  { name: "Product/PM", fullName: "Product/Project Management", count: 600 },
  { name: "Frontend Dev", fullName: "Frontend Development", count: 541 },
];

const TRAINING_EPOCHS = [
  { epoch: 1, trainLoss: 1.114, valLoss: 0.888, accuracy: 75.6, f1: 75.7 },
  { epoch: 2, trainLoss: 0.563, valLoss: 0.643, accuracy: 81.4, f1: 81.4 },
  { epoch: 3, trainLoss: 0.524, valLoss: 0.664, accuracy: 81.9, f1: 81.8 },
  { epoch: 4, trainLoss: 0.344, valLoss: 0.606, accuracy: 83.0, f1: 82.9 },
  { epoch: 5, trainLoss: 0.26, valLoss: 0.594, accuracy: 83.4, f1: 83.3 },
  { epoch: 6, trainLoss: 0.222, valLoss: 0.589, accuracy: 84.3, f1: 84.2, best: true },
];

const LIME_SUPPORTING = [
  { word: "node", weight: 0.45 },
  { word: "postgresql", weight: 0.31 },
  { word: "api", weight: 0.24 },
  { word: "express", weight: 0.18 },
];

const LIME_CONTRADICTING = [
  { word: "react", weight: -0.12 },
  { word: "figma", weight: -0.04 },
];

const PIPELINE_STEPS = [
  { id: "collect", step: 1, emoji: "📥", short: "Collect", title: "Raw Data Sources", metric: "8,000" },
  { id: "filter", step: 2, emoji: "🧹", short: "Filter", title: "Quality Filtering", metric: "4,017" },
  { id: "label", step: 3, emoji: "🏷️", short: "Label", title: "Career Class Refinement", metric: "9 classes" },
  { id: "balance", step: 4, emoji: "⚖️", short: "Balance", title: "Balanced Training Set", metric: "5,541" },
  { id: "train", step: 5, emoji: "🤖", short: "Train", title: "DistilBERT Fine-tuning", metric: "86.49%" },
];

const FLOW_MILESTONES = [
  { label: "Raw", value: "8,000", pct: 100 },
  { label: "Filtered", value: "4,017", pct: 50 },
  { label: "Relabeled", value: "9 classes", pct: 50 },
  { label: "Balanced", value: "5,541", pct: 69 },
  { label: "Model", value: "86.49%", pct: 86, accent: true },
];

function LimeBar({ word, weight, positive }) {
  const absWeight = Math.abs(weight);
  const maxWeight = 0.45;
  const widthPct = Math.round((absWeight / maxWeight) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 text-klenz-muted font-mono text-xs shrink-0">{word}</span>
      <div className="flex-1 h-2.5 bg-klenz-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${positive ? "bg-klenz-teal" : "bg-red-400/80"}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className={`w-14 text-right font-mono text-xs shrink-0 ${positive ? "text-klenz-teal" : "text-red-400"}`}>
        {weight > 0 ? "+" : ""}
        {weight.toFixed(2)}
      </span>
    </div>
  );
}

function PipelineStat({ value, label }) {
  return (
    <div className="panel-elevated p-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-klenz-muted mt-1">{label}</p>
    </div>
  );
}

function PipelineTimelineStep({ step, emoji, title, description, isLast, children }) {
  return (
    <div className="relative flex gap-5 md:gap-8">
      <div className="flex flex-col items-center shrink-0">
        <div className="relative z-10 w-11 h-11 rounded-full bg-[#534AB7] text-white flex items-center justify-center text-lg shadow-[0_0_20px_rgba(83,74,183,0.35)]">
          {emoji}
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[2rem] mt-2 bg-gradient-to-b from-[#534AB7]/60 to-[#534AB7]/10" />
        )}
      </div>
      <div className={`flex-1 min-w-0 pb-10 ${isLast ? "pb-0" : ""}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#534AB7]">
            Step {step}
          </span>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-klenz-muted mb-5">{description}</p>
        <div className="panel-elevated p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}

function DataPipelineTab() {
  const [activeStep, setActiveStep] = useState("collect");
  const stepRefs = useRef({});

  const scrollToStep = (id) => {
    setActiveStep(id);
    stepRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-white">Training Data Pipeline</h2>
        <p className="text-klenz-muted text-sm mt-1">
          How KarrerLenz&apos;s career classifier was built
        </p>
      </div>

      {/* Flow summary */}
      <div className="panel p-5 md:p-6">
        <p className="text-xs uppercase tracking-wider text-klenz-muted mb-4">End-to-end flow</p>
        <div className="hidden md:flex items-end justify-between gap-2">
          {FLOW_MILESTONES.map((m, i) => (
            <Fragment key={m.label}>
              <div className="flex-1 text-center min-w-0">
                <p className={`text-lg font-semibold ${m.accent ? "text-klenz-teal" : "text-white"}`}>
                  {m.value}
                </p>
                <p className="text-xs text-klenz-muted mt-0.5">{m.label}</p>
                <div className="mt-3 h-1.5 rounded-full bg-klenz-elevated overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.accent ? "bg-klenz-teal" : "bg-[#534AB7]"}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
              {i < FLOW_MILESTONES.length - 1 && (
                <span className="text-klenz-muted pb-6 shrink-0" aria-hidden="true">
                  →
                </span>
              )}
            </Fragment>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {FLOW_MILESTONES.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-klenz-muted">{m.label}</span>
              <span className={`text-sm font-semibold ${m.accent ? "text-klenz-teal" : "text-white"}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step navigator */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-klenz-black/90 backdrop-blur-md border-b border-klenz-border">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PIPELINE_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToStep(s.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-button text-xs font-medium transition-all duration-200 border ${
                activeStep === s.id
                  ? "bg-[#534AB7]/20 border-[#534AB7]/50 text-white"
                  : "bg-klenz-elevated/50 border-klenz-border text-klenz-muted hover:text-white hover:border-white/15"
              }`}
            >
              <span aria-hidden="true">{s.emoji}</span>
              <span className="hidden sm:inline">{s.short}</span>
              <span className="text-[10px] text-klenz-muted hidden lg:inline">· {s.metric}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        <div
          id="pipeline-collect"
          ref={(el) => {
            stepRefs.current.collect = el;
          }}
          className="scroll-mt-28"
        >
          <PipelineTimelineStep
            step={1}
            emoji="📥"
            title="Raw Data Sources"
            description="Combined three real-world datasets covering CVs, resumes and GitHub README files"
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              <PipelineStat value="8,000" label="Raw samples" />
              <PipelineStat value="2" label="Data sources" />
              <PipelineStat value="8" label="Career classes" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  name: "CV/Resume Dataset",
                  detail: "4,000 labeled resumes",
                  tag: "OpenAI GPT-4.1",
                },
                {
                  name: "GitHub README Dataset",
                  detail: "4,000 README files",
                  tag: "OpenAI GPT-4.1",
                },
                {
                  name: "Backend/Frontend CVs",
                  detail: "300 specialized samples",
                  tag: "Manual curation",
                },
              ].map((src) => (
                <div
                  key={src.name}
                  className="rounded-panel border border-klenz-border bg-klenz-black/40 p-4"
                >
                  <p className="text-sm font-medium text-white">{src.name}</p>
                  <p className="text-xs text-klenz-muted mt-1">{src.detail}</p>
                  <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded-chip bg-[#534AB7]/15 text-[#a89cf0] border border-[#534AB7]/30">
                    {src.tag}
                  </span>
                </div>
              ))}
            </div>
          </PipelineTimelineStep>
        </div>

        <div
          id="pipeline-filter"
          ref={(el) => {
            stepRefs.current.filter = el;
          }}
          className="scroll-mt-28"
        >
          <PipelineTimelineStep
            step={2}
            emoji="🧹"
            title="Quality Filtering"
            description="Filtered low-confidence samples to ensure clean training signal"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-panel border border-klenz-border p-4">
                <p className="text-xs uppercase tracking-wider text-klenz-muted mb-2">Before</p>
                <p className="text-3xl font-semibold text-white">8,000</p>
                <p className="text-sm text-klenz-muted mt-1">unfiltered samples</p>
              </div>
              <div className="rounded-panel border border-klenz-teal/30 bg-klenz-teal/5 p-4">
                <p className="text-xs uppercase tracking-wider text-klenz-teal mb-2">After</p>
                <p className="text-3xl font-semibold text-klenz-teal">4,017</p>
                <p className="text-sm text-klenz-muted mt-1">confidence ≥ 35%</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-klenz-teal">Kept — 4,017 (50%)</span>
                <span className="text-red-400">Dropped — 3,983 (49.8%)</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-klenz-teal w-1/2" />
                <div className="bg-red-400/80 w-1/2" />
              </div>
            </div>
            <div className="rounded-panel border border-[#534AB7]/20 bg-[#534AB7]/5 p-4 text-sm text-klenz-muted leading-relaxed">
              Each sample had probability scores across all 9 classes. We kept only samples where
              the primary class scored ≥35%, ensuring clear career signals for training.
            </div>
          </PipelineTimelineStep>
        </div>

        <div
          id="pipeline-label"
          ref={(el) => {
            stepRefs.current.label = el;
          }}
          className="scroll-mt-28"
        >
          <PipelineTimelineStep
            step={3}
            emoji="🏷️"
            title="Career Class Refinement"
            description="Split ambiguous Software Engineering class into distinct Backend and Frontend categories"
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-6">
              <div className="flex-1 rounded-panel border border-klenz-border p-4">
                <p className="text-xs uppercase tracking-wider text-klenz-muted mb-3">Before — 8 classes</p>
                <p className="text-sm font-medium text-white">Software Engineering</p>
                <p className="text-xs text-klenz-muted mt-1">Ambiguous — mixed backend &amp; frontend signals</p>
              </div>
              <div className="flex items-center justify-center text-2xl text-[#534AB7] shrink-0 lg:px-2">
                →
              </div>
              <div className="flex-1 space-y-3">
                <div className="rounded-panel border border-klenz-teal/30 bg-klenz-teal/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-klenz-teal mb-1">After — 9 classes</p>
                  <p className="text-sm font-medium text-white">Backend Development</p>
                  <p className="text-xs text-klenz-muted">Server, APIs, databases</p>
                </div>
                <div className="rounded-panel border border-klenz-teal/30 bg-klenz-teal/5 p-4">
                  <p className="text-sm font-medium text-white">Frontend Development</p>
                  <p className="text-xs text-klenz-muted">React, CSS, UI components</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "→ Backend Dev", value: "776", pct: "72%", color: "text-klenz-teal" },
                { label: "→ Frontend Dev", value: "165", pct: "15%", color: "text-klenz-teal" },
                { label: "→ Dropped", value: "137", pct: "13%", color: "text-red-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-panel border border-klenz-border p-3 text-center">
                  <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-klenz-muted mt-1">{stat.label}</p>
                  <p className={`text-xs font-medium mt-0.5 ${stat.color}`}>{stat.pct}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-klenz-muted mt-4 text-center">Total SE samples relabeled: 1,078</p>
          </PipelineTimelineStep>
        </div>

        <div
          id="pipeline-balance"
          ref={(el) => {
            stepRefs.current.balance = el;
          }}
          className="scroll-mt-28"
        >
          <PipelineTimelineStep
            step={4}
            emoji="⚖️"
            title="Balanced Training Set"
            description="Capped dominant classes and upsampled minority classes for fair training"
            isLast={false}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical" data={CLASS_DISTRIBUTION} margin={{ left: 8, right: 16, top: 4 }}>
                <XAxis type="number" tick={{ fill: "#a0a0b8", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={88}
                  tick={{ fill: "#a0a0b8", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                  formatter={(value, _name, props) => [
                    `${value}${props.payload.note ? ` (${props.payload.note})` : ""}`,
                    props.payload.fullName || props.payload.name,
                  ]}
                />
                <Bar dataKey="count" fill="#534AB7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4">
              <span className="badge-teal text-sm px-4 py-2">Total: 5,541 samples</span>
            </div>
          </PipelineTimelineStep>
        </div>

        <div
          id="pipeline-train"
          ref={(el) => {
            stepRefs.current.train = el;
          }}
          className="scroll-mt-28"
        >
          <PipelineTimelineStep
            step={5}
            emoji="🤖"
            title="DistilBERT Fine-tuning"
            description="Fine-tuned distilbert-base-uncased on Google Colab T4 GPU"
            isLast
          >
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-klenz-muted mb-3">Training config</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Base Model", "distilbert-base-uncased"],
                    ["Parameters", "66,960,393"],
                    ["Trainable params", "66,960,393"],
                    ["Training samples", "4,432 (80%)"],
                    ["Validation", "554 (10%)"],
                    ["Test", "555 (10%)"],
                    ["Epochs", "6"],
                    ["Batch size", "16"],
                    ["Learning rate", "2e-5"],
                    ["Optimizer", "AdamW"],
                    ["Hardware", "Google Colab T4 GPU"],
                    ["Training time", "~8 minutes"],
                  ].map(([label, value]) => (
                    <Fragment key={label}>
                      <dt className="text-klenz-muted">{label}</dt>
                      <dd>{value}</dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-klenz-muted mb-3">
                  Accuracy &amp; F1 by epoch
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={TRAINING_EPOCHS}>
                    <XAxis dataKey="epoch" tick={{ fill: "#a0a0b8", fontSize: 11 }} />
                    <YAxis domain={[70, 90]} tick={{ fill: "#a0a0b8", fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                      formatter={(value) => [`${value}%`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Accuracy"
                      stroke="#534AB7"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="f1"
                      name="F1"
                      stroke="#1D9E75"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="pb-2 pr-4">Epoch</th>
                    <th className="pb-2 pr-4">Train Loss</th>
                    <th className="pb-2 pr-4">Val Loss</th>
                    <th className="pb-2 pr-4">Accuracy</th>
                    <th className="pb-2">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAINING_EPOCHS.map((row) => (
                    <tr
                      key={row.epoch}
                      className={`border-b border-klenz-border/50 ${row.best ? "bg-klenz-teal/5" : ""}`}
                    >
                      <td className="py-2.5 pr-4">
                        {row.epoch}
                        {row.best && (
                          <span className="ml-2 text-xs text-klenz-teal font-medium">best</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">{row.trainLoss}</td>
                      <td className="py-2.5 pr-4">{row.valLoss}</td>
                      <td className={`py-2.5 pr-4 ${row.best ? "text-klenz-teal font-medium" : ""}`}>
                        {row.accuracy}%
                      </td>
                      <td className={`py-2.5 ${row.best ? "text-klenz-teal font-medium" : ""}`}>
                        {row.f1}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PipelineTimelineStep>
        </div>
      </div>

      {/* Model Card */}
      <div className="panel p-6 md:p-8 border border-[#534AB7]/40 ring-1 ring-[#534AB7]/20">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-chip bg-[#534AB7]/15 text-[#a89cf0] border border-[#534AB7]/30 mb-2">
              Model Card
            </span>
            <h2 className="text-lg font-semibold text-white">KarrerLenz Career Classifier v3</h2>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-klenz-teal">86.49%</p>
              <p className="text-xs text-klenz-muted">Test accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#534AB7]">0.87</p>
              <p className="text-xs text-klenz-muted">Macro F1</p>
            </div>
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-8 pb-6 border-b border-klenz-border">
          {[
            ["Architecture", "DistilBERT (distilbert-base-uncased)"],
            ["Task", "Multi-class Text Classification"],
            ["Classes", "9 career paths"],
            ["Published", "HuggingFace Hub"],
            ["Model ID", "Ange-Constance/karrelenz-career-classifier"],
            ["License", "MIT"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-klenz-muted text-xs">{label}</dt>
              <dd className="mt-0.5 break-all">{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="text-sm font-semibold mb-4">Per-Class Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-klenz-muted border-b border-klenz-border">
                <th className="pb-2 pr-4">Career</th>
                <th className="pb-2 pr-4">Precision</th>
                <th className="pb-2 pr-4">Recall</th>
                <th className="pb-2">F1</th>
              </tr>
            </thead>
            <tbody>
              {PER_CLASS_METRICS.map((row) => (
                <tr key={row.career} className="border-b border-klenz-border/50 hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4">{row.career}</td>
                  <td className="py-2.5 pr-4">{row.precision}</td>
                  <td className="py-2.5 pr-4">{row.recall}</td>
                  <td className={`py-2.5 font-medium ${pipelineF1Color(row.f1)}`}>{row.f1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability */}
      <div className="panel p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white mb-1">Model Explainability</h2>
        <p className="text-sm text-klenz-muted mb-6">
          KarrerLenz uses LIME (Local Interpretable Model-agnostic Explanations) to show users why
          the model made each prediction.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { n: 1, title: "Perturb input", desc: "Create variations of the CV text" },
            { n: 2, title: "Measure impact", desc: "See how each word affects prediction" },
            { n: 3, title: "Rank features", desc: "Show top supporting and contradicting words" },
          ].map((item) => (
            <div key={item.n} className="panel-elevated p-4">
              <span className="inline-flex w-7 h-7 rounded-full bg-[#534AB7]/20 text-[#534AB7] text-xs font-bold items-center justify-center mb-3">
                {item.n}
              </span>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-klenz-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="panel-elevated p-5 md:p-6">
          <p className="text-sm text-klenz-muted mb-5">
            Example output — predicted class:{" "}
            <span className="text-klenz-teal font-medium">Backend Development</span>
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-klenz-teal mb-3">
                Supporting
              </p>
              <div className="space-y-3">
                {LIME_SUPPORTING.map((item) => (
                  <LimeBar key={item.word} word={item.word} weight={item.weight} positive />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
                Contradicting
              </p>
              <div className="space-y-3">
                {LIME_CONTRADICTING.map((item) => (
                  <LimeBar key={item.word} word={item.word} weight={item.weight} positive={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-klenz-muted mt-6 italic">
          Ribeiro et al. (2016) — &apos;Why Should I Trust You?&apos;: Explaining the Predictions of
          Any Classifier
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPagination, setUsersPagination] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [careerFilter, setCareerFilter] = useState("");
  const [analysesPagination, setAnalysesPagination] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    const result = await adminAPI.getMetrics();
    setMetrics(result.data);
  }, []);

  const loadUsers = useCallback(async () => {
    const result = await adminAPI.getUsers(usersPage, usersSearch);
    setUsers(result.data?.users || []);
    setUsersPagination(result.data?.pagination);
  }, [usersPage, usersSearch]);

  const loadAnalyses = useCallback(async () => {
    const result = await adminAPI.getAnalyses(analysesPage, careerFilter);
    setAnalyses(result.data?.analyses || []);
    setAnalysesPagination(result.data?.pagination);
  }, [analysesPage, careerFilter]);

  useEffect(() => {
    if (!user?.is_admin) return;
    setLoading(true);
    loadMetrics()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, loadMetrics]);

  useEffect(() => {
    if (tab === "Users") loadUsers().catch(() => {});
  }, [tab, loadUsers]);

  useEffect(() => {
    if (tab === "Analyses") loadAnalyses().catch(() => {});
  }, [tab, loadAnalyses]);

  const sidebarNavItems = useMemo(
    () =>
      TABS.map((label) => ({
        label,
        Icon: TAB_ICONS[label],
        active: tab === label,
        onClick: () => setTab(label),
      })),
    [tab]
  );

  const layoutProps = {
    adminMode: true,
    sidebarNavItems,
  };

  if (!user?.is_admin) {
    return <Navigate to="/upload" replace />;
  }

  if (loading && !metrics) {
    return (
      <AppLayout {...layoutProps}>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const careerChartData = metrics
    ? Object.entries(metrics.career_distribution || {}).map(([name, value]) => ({
        name: name.length > 18 ? `${name.slice(0, 16)}…` : name,
        fullName: name,
        value,
      }))
    : [];

  const sourceData = metrics
    ? [
        { name: "CV Only", value: metrics.analyses?.input_sources?.cv_only || 0 },
        { name: "GitHub Only", value: metrics.analyses?.input_sources?.github_only || 0 },
        { name: "Combined", value: metrics.analyses?.input_sources?.combined || 0 },
      ]
    : [];

  return (
    <AppLayout {...layoutProps}>
      <div className="w-full page-enter">
        <h1 className="page-title mb-2">Admin Dashboard</h1>
        <p className="page-subtitle mb-8">Platform metrics and user management</p>

        {tab === "Overview" && metrics && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: metrics.users?.total },
                { label: "Total Analyses", value: metrics.analyses?.total },
                { label: "Avg Confidence", value: `${metrics.analyses?.avg_confidence || 0}%` },
                { label: "Active This Week", value: metrics.users?.active_last_7_days },
              ].map((stat) => (
                <div key={stat.label} className="panel p-5">
                  <p className="text-xs text-klenz-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="panel p-6">
                <h2 className="text-sm font-semibold mb-4">Career Distribution</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={careerChartData}>
                    <XAxis dataKey="name" tick={{ fill: "#a0a0b8", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#a0a0b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                    />
                    <Bar dataKey="value" fill="#534AB7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="panel p-6">
                <h2 className="text-sm font-semibold mb-4">Input Sources</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel p-6 overflow-x-auto">
              <h2 className="text-sm font-semibold mb-4">Recent Signups</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2">Analyses</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.recent_users || []).map((u) => (
                    <tr key={u.id} className="border-b border-klenz-border/50">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4 text-klenz-muted">{u.email}</td>
                      <td className="py-2 pr-4 text-klenz-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">{u.analyses_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel p-6 overflow-x-auto">
              <h2 className="text-sm font-semibold mb-4">Recent Analyses</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Career</th>
                    <th className="pb-2 pr-4">Confidence</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Sources</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.recent_analyses || []).map((a) => (
                    <tr key={a.id} className="border-b border-klenz-border/50">
                      <td className="py-2 pr-4 text-klenz-muted">{a.user_email}</td>
                      <td className="py-2 pr-4">{a.predicted_career}</td>
                      <td className="py-2 pr-4">{a.confidence_pct}%</td>
                      <td className="py-2 pr-4 text-klenz-muted">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        {(a.input_sources || []).join(", ") || "cv"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Users" && (
          <div className="space-y-4">
            <input
              type="search"
              placeholder="Search by email or name..."
              value={usersSearch}
              onChange={(e) => {
                setUsersSearch(e.target.value);
                setUsersPage(1);
              }}
              className="input-dark max-w-md"
            />
            <div className="panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4"># Analyses</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-klenz-border/50">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4 text-klenz-muted">{u.email}</td>
                      <td className="p-4">{u.is_admin ? "Yes" : "No"}</td>
                      <td className="p-4 text-klenz-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">{u.analyses_count}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          className="text-klenz-teal text-xs hover:underline"
                          onClick={async () => {
                            const result = await adminAPI.getUser(u.id);
                            setSelectedUser(result.data);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usersPagination && (
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  disabled={usersPage <= 1}
                  onClick={() => setUsersPage((p) => p - 1)}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-klenz-muted self-center">
                  Page {usersPage} of {usersPagination.pages || 1}
                </span>
                <button
                  type="button"
                  disabled={usersPage >= (usersPagination.pages || 1)}
                  onClick={() => setUsersPage((p) => p + 1)}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "Analyses" && (
          <div className="space-y-4">
            <select
              value={careerFilter}
              onChange={(e) => {
                setCareerFilter(e.target.value);
                setAnalysesPage(1);
              }}
              className="input-dark max-w-xs"
            >
              <option value="">All careers</option>
              {Object.keys(metrics?.career_distribution || {}).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="p-4">User</th>
                    <th className="p-4">Career</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Sources</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <Fragment key={a.id}>
                      <tr
                        className="border-b border-klenz-border/50 cursor-pointer hover:bg-klenz-elevated/50"
                        onClick={() =>
                          setExpandedAnalysis(expandedAnalysis === a.id ? null : a.id)
                        }
                      >
                        <td className="p-4 text-klenz-muted">{a.user_email}</td>
                        <td className="p-4">{a.predicted_career}</td>
                        <td className="p-4">{a.confidence_pct}%</td>
                        <td className="p-4">{(a.input_sources || []).join(", ") || "cv"}</td>
                        <td className="p-4 text-klenz-muted">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                      {expandedAnalysis === a.id && a.narrative && (
                        <tr>
                          <td colSpan={5} className="p-4 text-klenz-muted text-sm bg-klenz-elevated/30">
                            {a.narrative}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {analysesPagination && (
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  disabled={analysesPage <= 1}
                  onClick={() => setAnalysesPage((p) => p - 1)}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-klenz-muted self-center">
                  Page {analysesPage} of {analysesPagination.pages || 1}
                </span>
                <button
                  type="button"
                  disabled={analysesPage >= (analysesPagination.pages || 1)}
                  onClick={() => setAnalysesPage((p) => p + 1)}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "Model Performance" && metrics && (
          <div className="space-y-6">
            <div className="panel p-6">
              <h2 className="text-lg font-semibold mb-2">DistilBERT v3</h2>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-klenz-muted">Model</dt>
                  <dd>DistilBERT v3</dd>
                </div>
                <div>
                  <dt className="text-klenz-muted">HuggingFace</dt>
                  <dd className="break-all">Ange-Constance/karrelenz-career-classifier</dd>
                </div>
                <div>
                  <dt className="text-klenz-muted">Overall Accuracy</dt>
                  <dd>{metrics.model_performance?.overall_accuracy}%</dd>
                </div>
                <div>
                  <dt className="text-klenz-muted">Training Date</dt>
                  <dd>June 2025</dd>
                </div>
              </dl>
            </div>

            <div className="panel p-6 overflow-x-auto">
              <h2 className="text-sm font-semibold mb-4">Per-Class Metrics</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-klenz-muted border-b border-klenz-border">
                    <th className="pb-2 pr-4">Career</th>
                    <th className="pb-2 pr-4">Precision</th>
                    <th className="pb-2 pr-4">Recall</th>
                    <th className="pb-2 pr-4">F1 Score</th>
                    <th className="pb-2">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.model_performance?.classes || {}).map(
                    ([career, stats]) => (
                      <tr key={career} className="border-b border-klenz-border/50">
                        <td className="py-2 pr-4">{career}</td>
                        <td className="py-2 pr-4">{stats.precision}</td>
                        <td className="py-2 pr-4">{stats.recall}</td>
                        <td className={`py-2 pr-4 font-medium ${f1Color(stats.f1)}`}>
                          {stats.f1}
                        </td>
                        <td className="py-2">{stats.support}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="panel p-6">
              <h2 className="text-sm font-semibold mb-4">Accuracy Trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ACCURACY_TREND}>
                  <XAxis dataKey="version" tick={{ fill: "#a0a0b8" }} />
                  <YAxis domain={[80, 90]} tick={{ fill: "#a0a0b8" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#534AB7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "Data Pipeline" && <DataPipelineTab />}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="panel max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                <button type="button" onClick={() => setSelectedUser(null)} className="text-klenz-muted">
                  ✕
                </button>
              </div>
              <p className="text-sm text-klenz-muted mb-4">{selectedUser.email}</p>
              <h3 className="text-sm font-semibold mb-2">Analyses</h3>
              <ul className="space-y-2 text-sm">
                {(selectedUser.analyses || []).map((a) => (
                  <li key={a.id} className="panel-elevated p-3">
                    {a.predicted_career} · {new Date(a.created_at).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
