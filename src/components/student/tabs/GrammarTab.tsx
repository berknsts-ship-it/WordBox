const PRONOUNS = [
  { subject: "I",    possAdj: "my",    object: "me",   ru: "я / мой / меня" },
  { subject: "you",  possAdj: "your",  object: "you",  ru: "ты / твой / тебя" },
  { subject: "he",   possAdj: "his",   object: "him",  ru: "он / его / его" },
  { subject: "she",  possAdj: "her",   object: "her",  ru: "она / её / её" },
  { subject: "it",   possAdj: "its",   object: "it",   ru: "оно / его / его" },
  { subject: "we",   possAdj: "our",   object: "us",   ru: "мы / наш / нас" },
  { subject: "they", possAdj: "their", object: "them", ru: "они / их / их" },
];

const MODALS = [
  {
    title: "can / can't",
    subtitle: "умею / не умею; могу / не могу",
    rows: [
      { form: "I can swim.",            ru: "Я умею плавать." },
      { form: "She can speak English.",  ru: "Она говорит по-английски." },
      { form: "I can't drive.",          ru: "Я не умею водить машину." },
      { form: "He can't cook.",          ru: "Он не умеет готовить." },
      { form: "Can you help me?",        ru: "Ты можешь мне помочь?" },
      { form: "Can she swim?",           ru: "Она умеет плавать?" },
      { form: "Yes, I can.",             ru: "Да." },
      { form: "No, I can't.",            ru: "Нет." },
    ],
    tip: "can не меняется: I can, he can, they can — всегда одинаково.",
  },
  {
    title: "must / mustn't",
    subtitle: "должен / нельзя",
    rows: [
      { form: "You must stop.",          ru: "Ты должен остановиться." },
      { form: "She must work hard.",     ru: "Она должна много работать." },
      { form: "You mustn't smoke here.", ru: "Здесь нельзя курить." },
      { form: "He mustn't be late.",     ru: "Ему нельзя опаздывать." },
    ],
    tip: "must = внутренняя необходимость или строгий запрет (mustn't).",
  },
  {
    title: "should / shouldn't",
    subtitle: "стоит / не стоит (совет)",
    rows: [
      { form: "You should sleep more.",   ru: "Тебе стоит больше спать." },
      { form: "She should see a doctor.", ru: "Ей стоит сходить к врачу." },
      { form: "You shouldn't eat fast food.", ru: "Не стоит есть фастфуд." },
      { form: "He shouldn't work so much.",   ru: "Ему не стоит так много работать." },
    ],
    tip: "should — мягкий совет, не строгая обязанность.",
  },
];

function Card({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="bg-white/80 rounded-3xl border p-5 sm:p-6" style={{ borderColor: "var(--brown-pale)" }}>
      <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--brown-dark)", fontFamily: "var(--font-lora)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs mb-4" style={{ color: "var(--brown-light)" }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono"
      style={
        accent
          ? { background: "var(--brown-mid)", color: "#fff" }
          : { background: "var(--brown-pale)", color: "var(--brown-dark)" }
      }
    >
      {children}
    </span>
  );
}

export default function GrammarTab() {
  return (
    <div className="space-y-5">

      {/* Местоимения — общая таблица */}
      <Card title="Местоимения" subtitle="Личные · Притяжательные прилагательные · Объектные">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Личное", "Притяж. прил.", "Объектное", "По-русски"].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 pr-4 text-xs font-semibold"
                    style={{ color: "var(--brown-light)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRONOUNS.map((p, i) => (
                <tr key={p.subject} style={{ borderTop: i > 0 ? "1px solid var(--brown-pale)" : undefined }}>
                  <td className="py-2 pr-4"><Pill accent>{p.subject}</Pill></td>
                  <td className="py-2 pr-4"><Pill>{p.possAdj}</Pill></td>
                  <td className="py-2 pr-4"><Pill>{p.object}</Pill></td>
                  <td className="py-2 text-xs" style={{ color: "var(--brown-mid)" }}>{p.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Примеры */}
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--brown-light)" }}>Примеры</p>
          {[
            { en: "This is my bag.", ru: "Это моя сумка." },
            { en: "She loves him.", ru: "Она любит его." },
            { en: "Can you help us?", ru: "Ты можешь нам помочь?" },
            { en: "Their house is big.", ru: "Их дом большой." },
          ].map((ex) => (
            <div key={ex.en} className="flex items-baseline gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>{ex.en}</span>
              <span className="text-xs" style={{ color: "var(--brown-light)" }}>— {ex.ru}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Модальные глаголы */}
      <p className="text-xs font-semibold px-1" style={{ color: "var(--brown-light)", letterSpacing: "0.05em" }}>
        МОДАЛЬНЫЕ ГЛАГОЛЫ
      </p>
      {MODALS.map((modal) => (
        <Card key={modal.title} title={modal.title} subtitle={modal.subtitle}>
          <div className="space-y-2">
            {modal.rows.map((row) => (
              <div key={row.form} className="flex items-baseline gap-3">
                <span className="text-sm font-semibold min-w-0" style={{ color: "var(--brown-dark)" }}>
                  {row.form}
                </span>
                <span className="text-xs shrink-0" style={{ color: "var(--brown-light)" }}>— {row.ru}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 rounded-xl px-4 py-3 text-xs"
            style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
          >
            💡 {modal.tip}
          </div>
        </Card>
      ))}

    </div>
  );
}
