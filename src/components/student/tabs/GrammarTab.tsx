"use client";
import { useState } from "react";

// ─── данные ──────────────────────────────────────────────────────────────────

const PRONOUNS = [
  { subject: "I",    possAdj: "my",    object: "me",   ru: "я / мой / меня"   },
  { subject: "you",  possAdj: "your",  object: "you",  ru: "ты / твой / тебя" },
  { subject: "he",   possAdj: "his",   object: "him",  ru: "он / его / его"   },
  { subject: "she",  possAdj: "her",   object: "her",  ru: "она / её / её"    },
  { subject: "it",   possAdj: "its",   object: "it",   ru: "оно / его / его"  },
  { subject: "we",   possAdj: "our",   object: "us",   ru: "мы / наш / нас"   },
  { subject: "they", possAdj: "their", object: "them", ru: "они / их / их"    },
];

const MODALS = [
  {
    title: "can / can't",
    tip: "can не меняется: I can, he can, they can — всегда одинаково.",
    rows: [
      ["I can swim.",             "Я умею плавать."],
      ["She can speak English.",  "Она говорит по-английски."],
      ["I can't drive.",          "Я не умею водить машину."],
      ["He can't cook.",          "Он не умеет готовить."],
      ["Can you help me?",        "Ты можешь мне помочь?"],
      ["Yes, I can. / No, I can't.", "Да. / Нет."],
    ],
  },
  {
    title: "must / mustn't",
    tip: "must = внутренняя обязанность или строгий запрет (mustn't).",
    rows: [
      ["You must stop.",          "Ты должен остановиться."],
      ["She must work hard.",     "Она должна много работать."],
      ["You mustn't smoke here.", "Здесь нельзя курить."],
      ["He mustn't be late.",     "Ему нельзя опаздывать."],
    ],
  },
  {
    title: "should / shouldn't",
    tip: "should — мягкий совет, не строгая обязанность.",
    rows: [
      ["You should sleep more.",      "Тебе стоит больше спать."],
      ["She should see a doctor.",    "Ей стоит сходить к врачу."],
      ["You shouldn't eat fast food.","Не стоит есть фастфуд."],
      ["He shouldn't work so much.",  "Ему не стоит так много работать."],
    ],
  },
];

const WANT_NEED = [
  { form: "want to + V",       ru: "хотеть что-то сделать",   ex: "I want to learn English.", exRu: "Я хочу учить английский." },
  { form: "need to + V",       ru: "нужно что-то сделать",    ex: "I need to study more.",    exRu: "Мне нужно больше учиться." },
  { form: "don't want to + V", ru: "не хотеть",               ex: "I don't want to be late.", exRu: "Я не хочу опаздывать." },
  { form: "don't need to + V", ru: "не нужно",                ex: "You don't need to worry.", exRu: "Тебе не нужно беспокоиться." },
];

const LIKE_DOING = [
  { verb: "love",       ru: "обожать",         ex: "I love dancing.",            exRu: "Я обожаю танцевать." },
  { verb: "like",       ru: "любить / нравится",ex: "She likes cooking.",          exRu: "Ей нравится готовить." },
  { verb: "enjoy",      ru: "получать удовольствие", ex: "He enjoys reading.",    exRu: "Ему нравится читать." },
  { verb: "don't mind", ru: "не против",       ex: "I don't mind waiting.",       exRu: "Я не против подождать." },
  { verb: "hate",       ru: "ненавидеть",      ex: "I hate getting up early.",    exRu: "Я ненавижу рано вставать." },
];

const PREPOSITIONS = [
  { prep: "in",          ru: "в",          ex: "The keys are in the bag." },
  { prep: "on",          ru: "на",         ex: "The book is on the table." },
  { prep: "under",       ru: "под",        ex: "The cat is under the chair." },
  { prep: "in front of", ru: "перед",      ex: "He's standing in front of the house." },
  { prep: "behind",      ru: "за / позади",ex: "The garden is behind the house." },
  { prep: "between",     ru: "между",      ex: "She's sitting between Tom and Anna." },
  { prep: "next to",     ru: "рядом с",    ex: "The bank is next to the café." },
  { prep: "opposite",    ru: "напротив",   ex: "The school is opposite the park." },
];

const TENSE_ROWS = [
  {
    label: "Когда?",
    ps:  "в общем, всегда, обычно",
    pc:  "прямо сейчас, в процессе, планы",
    bg:  "var(--brown-pale)",
    bold: true,
  },
  {
    label: "Утверждение",
    ps:  "I/You/We/They + V\nShe/He/It + Vs/es",
    pc:  "I am Ving\nWe/You/They are Ving\nShe/He/It is Ving",
    bg: "transparent",
    bold: false,
  },
  {
    label: "Отрицание",
    ps:  "I/You/We/They don't + V\nShe/He/It doesn't + V",
    pc:  "I'm not Ving\nWe/You/They aren't Ving\nShe/He/It isn't Ving",
    bg: "transparent",
    bold: false,
  },
  {
    label: "Вопрос",
    ps:  "Do I/you/we/they + V?\nDoes she/he/it + V?",
    pc:  "Am I Ving?\nAre you/we/they Ving?\nIs she/he/it Ving?",
    bg: "transparent",
    bold: false,
  },
  {
    label: "Маркеры",
    ps:  "always · usually · often\nsometimes · hardly ever · never\nonce/twice a week",
    pc:  "now · right now · today\nat the moment · this week",
    bg: "rgba(251,207,232,0.25)",
    bold: false,
  },
];

// ─── компоненты ──────────────────────────────────────────────────────────────

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono"
      style={accent
        ? { background: "var(--brown-mid)", color: "#fff" }
        : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}
    >
      {children}
    </span>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl px-4 py-3 text-xs" style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
      💡 {children}
    </div>
  );
}

function Section({
  emoji, title, unit, children, open, onToggle,
}: {
  emoji: string; title: string; unit: string;
  children: React.ReactNode; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="bg-white/80 rounded-3xl border overflow-hidden" style={{ borderColor: "var(--brown-pale)" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-5 text-left">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "var(--brown-dark)", fontFamily: "var(--font-lora)" }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{unit}</p>
        </div>
        <span className="text-lg transition-transform duration-200" style={{ color: "var(--brown-light)", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>
          ▾
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t pt-4 space-y-4" style={{ borderColor: "var(--brown-pale)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── главный компонент ────────────────────────────────────────────────────────

export default function GrammarTab() {
  const [open, setOpen] = useState<Record<string, boolean>>({ pronouns: true });
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-3">

      {/* 1. Местоимения */}
      <Section emoji="🔤" title="Местоимения" unit="Разделы 1–2, 6" open={!!open.pronouns} onToggle={() => toggle("pronouns")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Личное", "Притяж. прил.", "Объектное", "По-русски"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brown-light)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRONOUNS.map((p, i) => (
                <tr key={p.subject} style={{ borderTop: i > 0 ? "1px solid var(--brown-pale)" : undefined }}>
                  <td className="py-2 pr-4"><Pill accent>{p.subject}</Pill></td>
                  <td className="py-2 pr-4"><Pill>{p.possAdj}</Pill></td>
                  <td className="py-2 pr-4"><Pill>{p.object}</Pill></td>
                  <td className="py-2 text-xs whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>{p.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1.5 mt-2">
          {[
            ["This is my bag.", "Это моя сумка."],
            ["She loves him.", "Она любит его."],
            ["Can you help us?", "Ты можешь нам помочь?"],
            ["Their house is big.", "Их дом большой."],
          ].map(([en, ru]) => (
            <div key={en} className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{en}</span>
              <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ru}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Модальные глаголы */}
      <Section emoji="💬" title="Модальные глаголы" unit="Раздел 6" open={!!open.modals} onToggle={() => toggle("modals")}>
        {MODALS.map((m) => (
          <div key={m.title}>
            <p className="font-bold text-sm mb-2" style={{ color: "var(--brown-dark)" }}>{m.title}</p>
            <div className="space-y-1.5">
              {m.rows.map(([en, ru]) => (
                <div key={en} className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{en}</span>
                  <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ru}</span>
                </div>
              ))}
            </div>
            <Tip>{m.tip}</Tip>
          </div>
        ))}
      </Section>

      {/* 3. want to / need to */}
      <Section emoji="🎯" title="want to / need to" unit="Раздел 5" open={!!open.wantneed} onToggle={() => toggle("wantneed")}>
        <Tip>После want/need всегда ставится to + глагол в базовой форме.</Tip>
        <div className="space-y-4 mt-2">
          {WANT_NEED.map((row) => (
            <div key={row.form} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill accent>{row.form}</Pill>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.ru}</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap pl-1">
                <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{row.ex}</span>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.exRu}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. like / love / hate + doing */}
      <Section emoji="❤️" title="like / love / hate + doing" unit="Раздел 5" open={!!open.likehate} onToggle={() => toggle("likehate")}>
        <Tip>После этих глаголов используется -ing форма (герундий).</Tip>
        <div className="space-y-4 mt-2">
          {LIKE_DOING.map((row) => (
            <div key={row.verb} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill accent>{row.verb} + Ving</Pill>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.ru}</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap pl-1">
                <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{row.ex}</span>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.exRu}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Предлоги места */}
      <Section emoji="📍" title="Предлоги места" unit="Раздел 4" open={!!open.prepositions} onToggle={() => toggle("prepositions")}>
        <div className="space-y-3">
          {PREPOSITIONS.map((p) => (
            <div key={p.prep} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Pill accent>{p.prep}</Pill>
                <span className="text-sm" style={{ color: "var(--brown-mid)" }}>— {p.ru}</span>
              </div>
              <p className="text-xs pl-1 italic" style={{ color: "var(--brown-light)" }}>{p.ex}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Present Simple vs Continuous */}
      <Section emoji="⏱️" title="Present Simple vs Continuous" unit="Разделы 4–5" open={!!open.tenses} onToggle={() => toggle("tenses")}>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="p-2 text-left w-24" style={{ color: "var(--brown-light)" }}></th>
                <th className="p-3 text-left rounded-tl-xl" style={{ background: "#dcfce7", color: "#166534" }}>
                  <span className="font-bold text-sm block">Present Simple</span>
                  <span className="font-normal">в общем</span>
                </th>
                <th className="p-3 text-left rounded-tr-xl" style={{ background: "#dbeafe", color: "#1e40af" }}>
                  <span className="font-bold text-sm block">Present Continuous</span>
                  <span className="font-normal">в процессе, планы</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {TENSE_ROWS.map((row) => (
                <tr key={row.label} style={{ background: row.bg, borderTop: "1px solid var(--brown-pale)" }}>
                  <td className="p-2 font-semibold text-xs" style={{ color: "var(--brown-mid)", verticalAlign: "top" }}>{row.label}</td>
                  <td className="p-3" style={{ color: "#166534", verticalAlign: "top" }}>
                    {row.ps.split("\n").map((line, i) => <p key={i} className={i === 0 && row.bold ? "font-bold" : ""}>{line}</p>)}
                  </td>
                  <td className="p-3" style={{ color: "#1e40af", verticalAlign: "top" }}>
                    {row.pc.split("\n").map((line, i) => <p key={i} className={i === 0 && row.bold ? "font-bold" : ""}>{line}</p>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1.5 mt-3">
          <p className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>Сравни:</p>
          {[
            ["I work in an office.", "Я работаю в офисе. (всегда)"],
            ["I'm working from home today.", "Сегодня я работаю из дома. (сейчас)"],
            ["She usually cooks dinner.", "Обычно она готовит ужин."],
            ["She's cooking dinner now.", "Сейчас она готовит ужин."],
          ].map(([en, ru]) => (
            <div key={en} className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{en}</span>
              <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ru}</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}
