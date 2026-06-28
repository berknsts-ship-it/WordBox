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
      ["I can swim.",               "Я умею плавать."],
      ["She can speak English.",    "Она говорит по-английски."],
      ["I can't drive.",            "Я не умею водить машину."],
      ["Can you help me?",          "Ты можешь мне помочь?"],
      ["Yes, I can. / No, I can't.","Да. / Нет."],
    ],
  },
  {
    title: "must / mustn't",
    tip: "must = внутренняя обязанность или строгий запрет (mustn't).",
    rows: [
      ["You must stop.",            "Ты должен остановиться."],
      ["You mustn't smoke here.",   "Здесь нельзя курить."],
      ["He mustn't be late.",       "Ему нельзя опаздывать."],
    ],
  },
  {
    title: "should / shouldn't",
    tip: "should — мягкий совет, не строгая обязанность.",
    rows: [
      ["You should sleep more.",       "Тебе стоит больше спать."],
      ["She should see a doctor.",     "Ей стоит сходить к врачу."],
      ["You shouldn't eat fast food.", "Не стоит есть фастфуд."],
    ],
  },
];

const WANT_NEED = [
  { form: "want to + V",       ru: "хотеть что-то сделать",  ex: "I want to learn English.", exRu: "Я хочу учить английский." },
  { form: "need to + V",       ru: "нужно что-то сделать",   ex: "I need to study more.",    exRu: "Мне нужно больше учиться." },
  { form: "don't want to + V", ru: "не хотеть",              ex: "I don't want to be late.", exRu: "Я не хочу опаздывать." },
  { form: "don't need to + V", ru: "не нужно",               ex: "You don't need to worry.", exRu: "Тебе не нужно беспокоиться." },
];

const LIKE_DOING = [
  { verb: "love",       ru: "обожать",               ex: "I love dancing.",          exRu: "Я обожаю танцевать." },
  { verb: "like",       ru: "любить / нравится",     ex: "She likes cooking.",        exRu: "Ей нравится готовить." },
  { verb: "enjoy",      ru: "получать удовольствие", ex: "He enjoys reading.",        exRu: "Ему нравится читать." },
  { verb: "don't mind", ru: "не против",             ex: "I don't mind waiting.",     exRu: "Я не против подождать." },
  { verb: "hate",       ru: "ненавидеть",            ex: "I hate getting up early.", exRu: "Я ненавижу рано вставать." },
];

const PREPOSITIONS = [
  { prep: "in",          ru: "в",           ex: "The keys are in the bag." },
  { prep: "on",          ru: "на",          ex: "The book is on the table." },
  { prep: "under",       ru: "под",         ex: "The cat is under the chair." },
  { prep: "in front of", ru: "перед",       ex: "He's standing in front of the house." },
  { prep: "behind",      ru: "за / позади", ex: "The garden is behind the house." },
  { prep: "between",     ru: "между",       ex: "She's sitting between Tom and Anna." },
  { prep: "next to",     ru: "рядом с",     ex: "The bank is next to the café." },
  { prep: "opposite",    ru: "напротив",    ex: "The school is opposite the park." },
];

const ADJ_PREP = [
  { adj: "interested in",  ex: "I'm interested in music.",    exRu: "Я интересуюсь музыкой." },
  { adj: "good at",        ex: "She's good at maths.",         exRu: "У неё хорошо идёт математика." },
  { adj: "bad at",         ex: "I'm bad at cooking.",          exRu: "Я плохо готовлю." },
  { adj: "keen on",        ex: "He's keen on football.",       exRu: "Он увлечён футболом." },
  { adj: "afraid of",      ex: "She's afraid of spiders.",     exRu: "Она боится пауков." },
  { adj: "bored with",     ex: "I'm bored with this film.",    exRu: "Мне скучно от этого фильма." },
  { adj: "different from", ex: "This is different from that.", exRu: "Это отличается от того." },
];

const TENSE_ROWS = [
  { label: "Когда?",      ps: "в общем, всегда, обычно",                                pc: "прямо сейчас, в процессе, планы",                     bg: "var(--brown-pale)", },
  { label: "Утверждение", ps: "I/You/We/They + V\nShe/He/It + Vs/es",                  pc: "I am Ving\nWe/You/They are Ving\nShe/He/It is Ving",   bg: "transparent", },
  { label: "Отрицание",   ps: "I/You/We/They don't + V\nShe/He/It doesn't + V",        pc: "I'm not Ving\nWe/You/They aren't Ving\nShe/He/It isn't Ving", bg: "transparent", },
  { label: "Вопрос",      ps: "Do I/you/we/they + V?\nDoes she/he/it + V?",            pc: "Am I Ving?\nAre you/we/they Ving?\nIs she/he/it Ving?", bg: "transparent", },
  { label: "Маркеры",     ps: "always · usually · often\nsometimes · hardly ever · never\nonce/twice a week", pc: "now · right now · today\nat the moment · this week", bg: "rgba(251,207,232,0.25)", },
];

// ─── UI-компоненты ────────────────────────────────────────────────────────────

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono"
      style={accent
        ? { background: "var(--brown-mid)", color: "#fff" }
        : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
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

function Ex({ en, ru }: { en: string; ru: string }) {
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{en}</span>
      <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ru}</span>
    </div>
  );
}

function Table2({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brown-light)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: i > 0 ? "1px solid var(--brown-pale)" : undefined }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4">
                  {j < row.length - 1 ? <Pill accent={j === 0}>{cell}</Pill> : <span className="text-xs" style={{ color: "var(--brown-mid)" }}>{cell}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ emoji, title, unit, children, open, onToggle }: {
  emoji: string; title: string; unit: string;
  children: React.ReactNode; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-5 text-left">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "var(--brown-dark)", fontFamily: "var(--font-lora)" }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{unit}</p>
        </div>
        <span className="text-base transition-transform duration-200" style={{ color: "var(--brown-light)", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t space-y-4" style={{ borderColor: "var(--brown-pale)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── TenseTable (shared between both books) ───────────────────────────────────

function TenseTable({ o, toggle }: { o: (id: string) => boolean; toggle: (id: string) => void }) {
  return (
    <Section emoji="⏱️" title="Present Simple vs Continuous" unit="Разделы 1, 3" open={o("tenses")} onToggle={() => toggle("tenses")}>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs border-collapse min-w-[460px]">
          <thead>
            <tr>
              <th className="p-2 text-left w-24" style={{ color: "var(--brown-light)" }}></th>
              <th className="p-3 text-left" style={{ background: "#dcfce7", color: "#166534" }}>
                <span className="font-bold text-sm block">Present Simple</span>
                <span className="font-normal">в общем</span>
              </th>
              <th className="p-3 text-left" style={{ background: "#dbeafe", color: "#1e40af" }}>
                <span className="font-bold text-sm block">Present Continuous</span>
                <span className="font-normal">в процессе / планы</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {TENSE_ROWS.map((row) => (
              <tr key={row.label} style={{ background: row.bg, borderTop: "1px solid var(--brown-pale)" }}>
                <td className="p-2 font-semibold text-xs" style={{ color: "var(--brown-mid)", verticalAlign: "top" }}>{row.label}</td>
                <td className="p-3" style={{ color: "#166534", verticalAlign: "top" }}>
                  {row.ps.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                </td>
                <td className="p-3" style={{ color: "#1e40af", verticalAlign: "top" }}>
                  {row.pc.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-1.5 mt-3">
        <Ex en="I work in an office." ru="Я работаю в офисе. (всегда)" />
        <Ex en="I'm working from home today." ru="Сегодня я работаю из дома. (сейчас)" />
      </div>
      <Tip>Глаголы состояния (know, like, want, need, have) не используются в Continuous.</Tip>
    </Section>
  );
}

// ─── English File Elementary ──────────────────────────────────────────────────

function EnglishFileElementary({ o, toggle }: { o: (id: string) => boolean; toggle: (id: string) => void }) {
  return (
    <>
      <Section emoji="🔤" title="Местоимения" unit="Разделы 1–2" open={o("pronouns")} onToggle={() => toggle("pronouns")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>{["Личное", "Притяж. прил.", "Объектное", "По-русски"].map((h) => (
                <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brown-light)" }}>{h}</th>
              ))}</tr>
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
        <div className="space-y-1.5 mt-3">
          <Ex en="This is my bag." ru="Это моя сумка." />
          <Ex en="She loves him." ru="Она любит его." />
          <Ex en="Their house is big." ru="Их дом большой." />
        </div>
      </Section>

      <TenseTable o={o} toggle={toggle} />

      <Section emoji="📍" title="Предлоги места" unit="Разделы 4–5" open={o("prepositions")} onToggle={() => toggle("prepositions")}>
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

      <Section emoji="🎯" title="want to / need to" unit="Раздел 5" open={o("wantneed")} onToggle={() => toggle("wantneed")}>
        <Tip>После want/need всегда ставится to + глагол в базовой форме.</Tip>
        <div className="space-y-4 mt-2">
          {WANT_NEED.map((row) => (
            <div key={row.form} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill accent>{row.form}</Pill>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.ru}</span>
              </div>
              <Ex en={row.ex} ru={row.exRu} />
            </div>
          ))}
        </div>
      </Section>

      <Section emoji="❤️" title="like / love / hate + doing" unit="Раздел 5" open={o("likehate")} onToggle={() => toggle("likehate")}>
        <Tip>После этих глаголов используется -ing форма (герундий).</Tip>
        <div className="space-y-4 mt-2">
          {LIKE_DOING.map((row) => (
            <div key={row.verb} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill accent>{row.verb} + Ving</Pill>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {row.ru}</span>
              </div>
              <Ex en={row.ex} ru={row.exRu} />
            </div>
          ))}
        </div>
      </Section>

      <Section emoji="💬" title="Модальные глаголы" unit="Раздел 6" open={o("modals")} onToggle={() => toggle("modals")}>
        {MODALS.map((m) => (
          <div key={m.title}>
            <p className="font-bold text-sm mb-2" style={{ color: "var(--brown-dark)" }}>{m.title}</p>
            <div className="space-y-1.5">
              {m.rows.map(([en, ru]) => <Ex key={en} en={en} ru={ru} />)}
            </div>
            <Tip>{m.tip}</Tip>
          </div>
        ))}
      </Section>
    </>
  );
}

// ─── Solutions Elementary ─────────────────────────────────────────────────────

function SolutionsElementary({ o, toggle }: { o: (id: string) => boolean; toggle: (id: string) => void }) {
  return (
    <>
      <Section emoji="🤝" title="have got — иметь" unit="Unit I (вводный)" open={o("havegot")} onToggle={() => toggle("havegot")}>
        <Table2
          headers={["Утверждение", "Отрицание", "Вопрос", ""]}
          rows={[
            ["I/you/we/they have got", "I/you/we/they haven't got", "Have I/you/we/they got…?", "я/ты/мы/они"],
            ["he/she/it has got",      "he/she/it hasn't got",      "Has he/she/it got…?",      "он/она/оно"],
          ]}
        />
        <div className="space-y-1.5 mt-2">
          <Ex en="I've got two sisters." ru="У меня две сестры." />
          <Ex en="She hasn't got a car." ru="У неё нет машины." />
          <Ex en="Have you got a pet?" ru="У тебя есть питомец?" />
          <Ex en="Yes, I have. / No, I haven't." ru="Да. / Нет." />
        </div>
        <Tip>have got = have (значение «иметь»). В разговоре чаще используют сокращения: I've got, he's got.</Tip>
      </Section>

      <Section emoji="📰" title="Артикли a / an / the" unit="Unit I (вводный)" open={o("articles")} onToggle={() => toggle("articles")}>
        <div className="space-y-3">
          {[
            { pill: "a / an", ru: "неопределённый — предмет упоминается впервые или не конкретный",
              rows: [["a cat", "кошка (какая-то)"], ["an apple", "яблоко (any)"]] },
            { pill: "the",    ru: "определённый — предмет уже известен или единственный",
              rows: [["the cat is black", "та самая кошка чёрная"], ["the sun", "солнце (одно)"]] },
            { pill: "— (ноль)", ru: "без артикля: имена, страны, языки, множественное число в общем смысле",
              rows: [["I like cats.", "кошки вообще"], ["She speaks French.", "без артикля"]] },
          ].map(({ pill, ru, rows }) => (
            <div key={pill}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Pill accent>{pill}</Pill>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ru}</span>
              </div>
              {rows.map(([en, r]) => <Ex key={en} en={en} ru={r} />)}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--brown-light)" }}>this / that / these / those</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[["this", "это (ед.ч., рядом)"], ["that", "то (ед.ч., далеко)"], ["these", "эти (мн.ч., рядом)"], ["those", "те (мн.ч., далеко)"]].map(([w, r]) => (
              <div key={w} className="flex items-center gap-2">
                <Pill>{w}</Pill>
                <span className="text-xs" style={{ color: "var(--brown-mid)" }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section emoji="📋" title="have to — должен, нужно" unit="Unit 2" open={o("haveto")} onToggle={() => toggle("haveto")}>
        <Table2
          headers={["Утверждение", "Отрицание", "По-русски"]}
          rows={[
            ["I/you/we/they have to",  "I/you/we/they don't have to",  "я должен / мне не нужно"],
            ["he/she/it has to",       "he/she/it doesn't have to",    "он должен / ему не нужно"],
          ]}
        />
        <div className="space-y-1.5 mt-3">
          <Ex en="I have to wear a uniform." ru="Я должна носить форму." />
          <Ex en="She has to study every day." ru="Ей нужно учиться каждый день." />
          <Ex en="You don't have to come." ru="Тебе не нужно приходить." />
          <Ex en="Do you have to work on Saturdays?" ru="Тебе нужно работать по субботам?" />
        </div>
        <Tip>don't have to ≠ mustn't. Don't have to = необязательно. Mustn't = нельзя.</Tip>
      </Section>

      <TenseTable o={o} toggle={toggle} />

      <Section emoji="📦" title="there is / there are + some / any" unit="Unit 4" open={o("thereis")} onToggle={() => toggle("thereis")}>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--brown-light)" }}>there is / there are</p>
            <div className="space-y-1.5">
              <Ex en="There is a café near here." ru="Рядом есть кафе." />
              <Ex en="There are three eggs in the fridge." ru="В холодильнике три яйца." />
              <Ex en="There isn't any milk." ru="Молока нет." />
              <Ex en="There aren't any chairs." ru="Стульев нет." />
              <Ex en="Is there a bank nearby?" ru="Рядом есть банк?" />
              <Ex en="Are there any students here?" ru="Здесь есть студенты?" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--brown-light)" }}>some / any</p>
            <Table2
              headers={["", "Использование", "Пример"]}
              rows={[
                ["some", "утверждения",         "There's some bread."],
                ["any",  "отрицания и вопросы", "Is there any milk?"],
              ]}
            />
          </div>
        </div>
      </Section>

      <Section emoji="🔢" title="how much / how many + количество" unit="Unit 4" open={o("quantity")} onToggle={() => toggle("quantity")}>
        <div className="space-y-3">
          <Table2
            headers={["", "С чем?", "Пример"]}
            rows={[
              ["how much",    "неисчисляемые (вода, молоко, хлеб)", "How much water do you drink?"],
              ["how many",    "счётные (яблоки, яйца, стулья)",     "How many eggs do we need?"],
              ["much / a little", "неисчисляемые — отриц./утверж.", "I don't drink much coffee. / a little milk"],
              ["many / a few",    "счётные — отриц./утверж.",        "Not many students. / a few apples"],
              ["a lot of",        "и те, и другие — утверждение",    "I eat a lot of fruit."],
            ]}
          />
          <div className="space-y-1.5">
            <Ex en="I don't eat much sugar." ru="Я не ем много сахара." />
            <Ex en="She drinks a lot of water." ru="Она пьёт много воды." />
            <Ex en="There are a few apples left." ru="Осталось несколько яблок." />
            <Ex en="I have a little time." ru="У меня немного времени." />
          </div>
        </div>
      </Section>

      <Section emoji="🔗" title="Прилагательное + предлог" unit="Unit 4" open={o("adjprep")} onToggle={() => toggle("adjprep")}>
        <div className="space-y-3">
          {ADJ_PREP.map((r) => (
            <div key={r.adj} className="space-y-0.5">
              <Pill accent>{r.adj}</Pill>
              <Ex en={r.ex} ru={r.exRu} />
            </div>
          ))}
        </div>
        <Tip>Предлог после прилагательного нужно запоминать вместе с ним — он не переводится буквально.</Tip>
      </Section>
    </>
  );
}

// ─── главный компонент ────────────────────────────────────────────────────────

const TEXTBOOK_LABELS: Record<string, string> = {
  english_file_elementary: "English File Elementary",
  solutions_elementary:    "Solutions 3rd Ed. Elementary",
};

export default function GrammarTab({ textbook }: { textbook: string | null }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const o = (id: string) => !!open[id];

  if (!textbook) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">📐</p>
        <p className="font-semibold text-stone-700">Учебник не указан</p>
        <p className="text-sm text-stone-400 mt-1">Репетитор выберет учебник — и здесь появится грамматика</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold pb-1" style={{ color: "var(--brown-light)" }}>
        {TEXTBOOK_LABELS[textbook] ?? textbook}
      </p>
      {textbook === "english_file_elementary" && <EnglishFileElementary o={o} toggle={toggle} />}
      {textbook === "solutions_elementary"    && <SolutionsElementary   o={o} toggle={toggle} />}
    </div>
  );
}
