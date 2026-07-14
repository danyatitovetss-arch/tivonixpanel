"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bot,
  ChevronDown,
  ExternalLink,
  Globe,
  Layers,
  LayoutTemplate,
  Link2,
  Palette,
  PanelTop,
  Zap,
} from "lucide-react";
import { CopyButton } from "@/components/academy/copy-button";
import { AcademyCardBody } from "@/components/academy/academy-card";
import {
  ABOUT_TIVONIX_INTRO,
  TIVONIX_ALLOWED_PHRASES,
  TIVONIX_ELEVATOR_PITCH,
  TIVONIX_FORBIDDEN_PHRASES,
  TIVONIX_LINKS_HINT,
  TIVONIX_OFFICIAL_LINKS,
  TIVONIX_PITCH_TEXTS,
  TIVONIX_SERVICES,
  TIVONIX_WHEN_NEEDED,
  type TivonixServiceCard,
} from "@/lib/academy-about-data";
import { cn } from "@/lib/utils";

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sites: Globe,
  "web-services": Layers,
  crm: LayoutTemplate,
  bots: Bot,
  automation: Zap,
  admin: PanelTop,
  integrations: Link2,
  design: Palette,
};

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-[#18181b] md:text-lg">{children}</h3>;
}

export function AboutTivonixHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/images/tivonix-logo-lockup.png"
        alt="TIVONIX"
        width={560}
        height={140}
        priority={false}
        className="h-auto w-full max-w-[340px] object-contain sm:max-w-[440px] md:max-w-[520px]"
      />
      <h2
        id="about-tivonix-title"
        className="mt-6 text-xl font-bold tracking-tight text-[#18181b] sm:text-2xl md:mt-8 md:text-3xl"
      >
        {ABOUT_TIVONIX_INTRO.title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#71717a] md:mt-4 md:text-lg md:leading-relaxed">
        {ABOUT_TIVONIX_INTRO.subtitle}
      </p>
    </div>
  );
}

function FlatBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-white p-4 md:p-5", className)}>{children}</div>;
}

function PhraseCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "yes" | "no";
}) {
  const isYes = variant === "yes";

  return (
    <div
      className={cn(
        "rounded-2xl bg-[#f4f4f5] p-5 ring-2 ring-offset-[3px] ring-offset-white md:p-6",
        isYes ? "ring-emerald-500" : "ring-red-500"
      )}
    >
      <h4
        className={cn(
          "text-base font-semibold md:text-lg",
          isYes ? "text-emerald-700" : "text-red-600"
        )}
      >
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-base leading-snug text-[#18181b] md:text-[17px]">
            <span
              className={cn(
                "mt-0.5 shrink-0 text-sm font-bold",
                isYes ? "text-emerald-600" : "text-red-500"
              )}
              aria-hidden
            >
              {isYes ? "✓" : "✕"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceCard({ service }: { service: TivonixServiceCard }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = SERVICE_ICONS[service.id] ?? Globe;

  return (
    <AcademyCardBody className="p-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 p-5 text-left md:p-6"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
          <Icon className="size-5 text-[#18181b]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-semibold text-[#18181b] md:text-lg">{service.title}</h4>
            <ChevronDown
              className={cn(
                "mt-0.5 size-5 shrink-0 text-[#71717a] transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
          <p className="mt-1.5 text-base leading-relaxed text-[#71717a]">{service.description}</p>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#ebebeb] px-5 pb-5 pt-4 md:px-6 md:pb-6">
          <FlatBlock>
            <p className="text-sm font-medium text-[#18181b] md:text-base">Что можно предложить:</p>
            <ul className="mt-3 space-y-2">
              {service.offers.map((offer) => (
                <li key={offer} className="flex gap-2 text-base text-[#18181b]">
                  <span className="text-[#71717a]">·</span>
                  {offer}
                </li>
              ))}
            </ul>
          </FlatBlock>
        </div>
      )}
    </AcademyCardBody>
  );
}

function PitchCard({ title, text }: { title: string; text: string }) {
  const [isOpen, setIsOpen] = useState(title === "Коротко о TIVONIX");

  return (
    <AcademyCardBody className="p-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 p-5 text-left md:p-6"
      >
        <span className="text-base font-semibold text-[#18181b] md:text-lg">{title}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-[#71717a] transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="space-y-4 border-t border-[#ebebeb] px-5 pb-5 pt-4 md:px-6 md:pb-6">
          <FlatBlock>
            <p className="whitespace-pre-line text-base leading-relaxed text-[#18181b]">{text}</p>
          </FlatBlock>
          <CopyButton text={text} label="Скопировать" className="w-full sm:w-auto" />
        </div>
      )}
    </AcademyCardBody>
  );
}

export function AboutTivonixSection() {
  return (
    <div className="space-y-8">
      <AcademyCardBody>
        <blockquote className="relative rounded-xl bg-white px-5 py-6 md:px-8 md:py-9">
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-4 select-none font-serif text-5xl leading-none text-[#18181b]/10 md:left-7 md:top-5 md:text-6xl"
          >
            “
          </span>
          <div className="relative space-y-5 md:space-y-6">
            {ABOUT_TIVONIX_INTRO.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={cn(
                  "leading-relaxed text-[#18181b]",
                  index === 0
                    ? "text-lg font-medium md:text-2xl md:leading-snug"
                    : "text-base text-[#334155] md:text-xl md:leading-relaxed"
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </blockquote>
      </AcademyCardBody>

      <div className="space-y-4">
        <Subheading>Что делает TIVONIX</Subheading>
        <div className="grid gap-3 md:grid-cols-2">
          {TIVONIX_SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Subheading>Когда клиенту нужен TIVONIX</Subheading>
        <AcademyCardBody>
          <FlatBlock>
            <p className="mb-3 text-sm font-medium text-[#18181b] md:text-base">
              Клиенту можно предлагать TIVONIX, если:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {TIVONIX_WHEN_NEEDED.map((item) => (
                <li key={item} className="flex gap-2 text-base text-[#18181b]">
                  <span className="shrink-0 text-emerald-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </FlatBlock>
        </AcademyCardBody>
      </div>

      <div className="space-y-4">
        <Subheading>Что говорить клиенту о TIVONIX</Subheading>
        <div className="space-y-3">
          {TIVONIX_PITCH_TEXTS.map((pitch) => (
            <PitchCard key={pitch.id} title={pitch.title} text={pitch.text} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Subheading>Официальные ссылки TIVONIX</Subheading>
        <AcademyCardBody>
          <div className="grid gap-2 sm:grid-cols-2">
            {TIVONIX_OFFICIAL_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-between gap-3 rounded-xl bg-white px-4 text-base font-medium text-[#18181b] transition-colors hover:bg-white/80"
              >
                <span>{link.label}</span>
                <ExternalLink className="size-4 shrink-0 text-[#71717a]" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#71717a] md:text-base">
            {TIVONIX_LINKS_HINT}
          </p>
        </AcademyCardBody>
      </div>

      <div className="space-y-4">
        <Subheading>Как партнёру объяснить TIVONIX за 10 секунд</Subheading>
        <AcademyCardBody>
          <FlatBlock>
            <p className="text-base leading-relaxed text-[#18181b] md:text-[17px]">
              {TIVONIX_ELEVATOR_PITCH.text}
            </p>
            <p className="mt-4 text-base font-medium text-[#18181b]">{TIVONIX_ELEVATOR_PITCH.note}</p>
            <ul className="mt-3 space-y-2">
              {TIVONIX_ELEVATOR_PITCH.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-base text-[#18181b]">
                  <span className="text-[#71717a]">·</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </FlatBlock>
        </AcademyCardBody>
      </div>

      <div className="space-y-4">
        <Subheading>Что НЕ говорить</Subheading>
        <div className="grid gap-4 md:grid-cols-2">
          <PhraseCard title="Нельзя говорить" items={TIVONIX_FORBIDDEN_PHRASES} variant="no" />
          <PhraseCard title="Правильно говорить" items={TIVONIX_ALLOWED_PHRASES} variant="yes" />
        </div>
      </div>
    </div>
  );
}
