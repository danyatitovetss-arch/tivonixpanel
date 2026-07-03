"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { AcademyPageHeader } from "@/components/academy/academy-page-header";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { AcademyHero } from "@/components/academy/academy-hero";
import { CommissionGuide } from "@/components/academy/commission-guide";
import { StartGuide } from "@/components/academy/start-guide";
import { CategoryGrid } from "@/components/academy/category-grid";
import { SearchSourcesTabs } from "@/components/academy/search-sources-tabs";
import { LeadChecklist } from "@/components/academy/lead-checklist";
import { ConstructionTemplates } from "@/components/academy/construction-templates";
import { TemplateLibrary } from "@/components/academy/template-library";
import { TelegramStrategyBlock } from "@/components/academy/telegram-strategy";
import { MarketplaceList } from "@/components/academy/marketplace-list";
import { CrmGuide } from "@/components/academy/crm-guide";
import { DailyPlan } from "@/components/academy/daily-plan";
import { MistakesList } from "@/components/academy/mistakes-list";
import { FaqAccordion } from "@/components/academy/faq-accordion";
import { CopyButton } from "@/components/academy/copy-button";
import { AcademyNav, getAcademyScrollOffset } from "@/components/academy/academy-nav";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";
import { RoleGuard } from "@/components/access/role-guard";
import {
  ACADEMY_SECTIONS,
  START_GUIDE_INTRO,
  START_STEPS,
  START_CHECKLIST,
  CATEGORIES,
  SEARCH_SOURCES,
  LEAD_QUALITY_CHECKLIST,
  LEAD_QUALITY_CONCLUSION,
  CONSTRUCTION_TEMPLATES,
  MESSAGE_TEMPLATES,
  TELEGRAM_STRATEGY,
  MARKETPLACE_SOURCES,
  MARKETPLACE_KEYWORDS,
  MARKETPLACE_HOW_TO,
  MARKETPLACE_RESPONSE_TEMPLATE,
  AFTER_REPLY_STEPS,
  CLIENT_QUESTIONS,
  CRM_INSTRUCTIONS,
  CRM_COMMENT_EXAMPLES,
  DAILY_PLAN,
  WEEKLY_PLAN,
  MISTAKES,
  FAQ_ITEMS,
  STATUS_GUIDE,
  LEAD_EXAMPLES,
} from "@/lib/academy-data";
import { StatusGuideTable } from "@/components/academy/status-guide-table";

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-[var(--academy-scroll-offset)] text-lg font-bold tracking-tight text-[#050505] sm:text-xl md:text-2xl"
    >
      {children}
    </h2>
  );
}

const SECTION_SCROLL_CLASS = "scroll-mt-[var(--academy-scroll-offset)]";

export default function AcademyPage() {
  const { open: openAddLead } = useAddLeadSheet();
  const [activeSection, setActiveSection] = useState("start");
  const scrollingRef = useRef(false);

  function scrollToSection(id: string) {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (!el) return;

    scrollingRef.current = true;
    const offset = getAcademyScrollOffset();
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 600);
  }

  useEffect(() => {
    const sections = ACADEMY_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${Math.round(getAcademyScrollOffset())}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const firstTemplate = MESSAGE_TEMPLATES.find((t) => t.category === "first")?.text ?? "";

  return (
    <RoleGuard resource="leads" redirectTo="/dashboard">
      <AppLayout title="Как искать клиентов" showAddLead={false} showSearch={false}>
        <div className="pb-28 lg:pb-24">
          <div className="lg:grid lg:grid-cols-[minmax(200px,240px)_1fr] lg:gap-10">
            <AcademyNav activeSection={activeSection} onSelect={scrollToSection} />

            <div className="space-y-12 lg:space-y-14">
              <AcademyPageHeader />

              {/* Hero + Start */}
              <section id="start" className={`${SECTION_SCROLL_CLASS} space-y-10`}>
                <AcademyHero
                  onAddClient={openAddLead}
                  onCheckDuplicate={() => scrollToSection("crm")}
                  onOpenTemplates={() => scrollToSection("templates")}
                  onOpenPlan={() => scrollToSection("plan")}
                />

                <div className="space-y-4">
                  <SectionTitle id="commission">Комиссия</SectionTitle>
                  <CommissionGuide />
                </div>

                <div className="space-y-4">
                  <SectionTitle id="start-guide">Начни отсюда</SectionTitle>
                  <StartGuide
                    intro={START_GUIDE_INTRO}
                    steps={START_STEPS}
                    checklist={START_CHECKLIST}
                  />
                </div>
              </section>

              {/* Categories */}
              <section id="niches" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="niches-title">Какие бизнесы искать</SectionTitle>
                <p className="text-sm text-[#6b7280]">
                  22 категории с признаками, площадками и готовым первым сообщением. Выбери одну
                  нишу и работай с ней неделю.
                </p>
                <CategoryGrid categories={CATEGORIES} />
              </section>

              {/* Search sources */}
              <section id="sources" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="sources-title">Где искать клиентов</SectionTitle>
                <SearchSourcesTabs sources={SEARCH_SOURCES} />
              </section>

              {/* Quality checklist */}
              <section id="checklist" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="checklist-title">Как понять, что бизнесу нужна услуга</SectionTitle>
                <LeadChecklist
                  title="Проверка бизнеса за 1 минуту"
                  items={LEAD_QUALITY_CHECKLIST}
                  conclusion={LEAD_QUALITY_CONCLUSION}
                />
              </section>

              {/* Construction templates */}
              <section id="construction" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="construction-title">Пример: что писать строительной компании</SectionTitle>
                <p className="text-sm text-[#6b7280]">
                  10 готовых сообщений для строительных компаний — скопируй и адаптируй под
                  конкретный бизнес.
                </p>
                <ConstructionTemplates templates={CONSTRUCTION_TEMPLATES} />
              </section>

              {/* Template library */}
              <section id="templates" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="templates-title">Шаблоны по ситуациям</SectionTitle>
                <p className="text-sm text-[#6b7280]">
                  Первое сообщение, ответы, возражения, повторные — ищи по тексту или фильтру.
                </p>
                <TemplateLibrary templates={MESSAGE_TEMPLATES} />
              </section>

              {/* Telegram */}
              <section id="telegram" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="telegram-title">Telegram-группы</SectionTitle>
                <TelegramStrategyBlock strategy={TELEGRAM_STRATEGY} />
              </section>

              {/* Marketplaces */}
              <section id="marketplaces" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="marketplaces-title">Фриланс-биржи</SectionTitle>
                <MarketplaceList
                  platforms={MARKETPLACE_SOURCES}
                  keywords={MARKETPLACE_KEYWORDS}
                  howTo={MARKETPLACE_HOW_TO}
                  responseTemplate={MARKETPLACE_RESPONSE_TEMPLATE}
                />
              </section>

              {/* After reply */}
              <section id="after-reply" className={`${SECTION_SCROLL_CLASS} space-y-6`}>
                <SectionTitle id="after-reply-title">Что делать, если клиент ответил</SectionTitle>
                <AcademyCardBody>
                  <ol className="space-y-2">
                    {AFTER_REPLY_STEPS.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm text-[#050505]">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-[#6b7280]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </AcademyCardBody>
                <div>
                  <h3 className="mb-3 text-base font-semibold text-[#050505]">Вопросы клиенту</h3>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_QUESTIONS.map((q) => (
                      <span
                        key={q}
                        className="rounded-xl bg-[#f6f6f6] px-3 py-2 text-sm text-[#050505]"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* CRM */}
              <section id="crm" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="crm-title">Как добавить клиента в CRM</SectionTitle>
                <AcademyCardBody>
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    Перед отправкой сообщения проверь дубль: открой «Клиенты» или начни добавлять
                    карточку — CRM сама проверит совпадение по Instagram, Telegram, сайту или
                    телефону.
                  </p>
                </AcademyCardBody>
                <CrmGuide
                  steps={CRM_INSTRUCTIONS}
                  commentExamples={CRM_COMMENT_EXAMPLES}
                  onAddClient={openAddLead}
                />
              </section>

              {/* Statuses */}
              <section id="statuses" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="statuses-title">Какие статусы ставить</SectionTitle>
                <StatusGuideTable rows={STATUS_GUIDE} />
              </section>

              {/* Daily plan */}
              <section id="plan" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="plan-title">План на 1 час в день</SectionTitle>
                <DailyPlan
                  items={DAILY_PLAN}
                  weekly={WEEKLY_PLAN}
                  conclusion="Главное — делать это стабильно каждый день. Даже 5–10 сообщений в день могут дать результат."
                />
              </section>

              {/* Mistakes */}
              <section id="mistakes" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="mistakes-title">Что нельзя делать</SectionTitle>
                <MistakesList items={MISTAKES} />
              </section>

              {/* Lead examples */}
              <section id="examples" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="examples-title">Хороший и плохой лид</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <AcademyCardBody>
                    <h3 className="font-semibold text-[#050505]">Хороший клиент</h3>
                    <ul className="mt-3 space-y-1.5">
                      {LEAD_EXAMPLES.good.map((item) => (
                        <li key={item} className="text-sm text-[#6b7280]">· {item}</li>
                      ))}
                    </ul>
                  </AcademyCardBody>
                  <AcademyCardBody>
                    <h3 className="font-semibold text-[#050505]">Плохой клиент</h3>
                    <ul className="mt-3 space-y-1.5">
                      {LEAD_EXAMPLES.bad.map((item) => (
                        <li key={item} className="text-sm text-[#6b7280]">· {item}</li>
                      ))}
                    </ul>
                  </AcademyCardBody>
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className={`${SECTION_SCROLL_CLASS} space-y-4`}>
                <SectionTitle id="faq-title">FAQ</SectionTitle>
                <FaqAccordion items={FAQ_ITEMS} />
              </section>

              {/* Quick actions */}
              <AcademyCardBody className="sm:p-8">
                <h2 className="text-lg font-bold text-[#050505]">Быстрые действия</h2>
                <p className="mt-2 text-sm text-[#6b7280]">Начни прямо сейчас — всё уже готово в CRM.</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                  <button
                    type="button"
                    onClick={openAddLead}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#050505] px-5 text-sm font-medium text-white sm:w-auto"
                  >
                    Добавить клиента
                  </button>
                  <Link
                    href="/prospecting"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] sm:w-auto hover:bg-[#efefef]"
                  >
                    Открыть список для поиска
                  </Link>
                  <Link
                    href="/leads"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] sm:w-auto hover:bg-[#efefef]"
                  >
                    Открыть моих клиентов
                  </Link>
                  {firstTemplate && (
                    <CopyButton
                      text={firstTemplate}
                      label="Скопировать первое сообщение"
                      className="w-full sm:w-auto"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => scrollToSection("templates")}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] sm:w-auto hover:bg-[#efefef]"
                  >
                    Открыть шаблоны
                  </button>
                </div>
              </AcademyCardBody>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
