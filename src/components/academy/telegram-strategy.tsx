import type { TelegramStrategy } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";

interface TelegramStrategyProps {
  strategy: TelegramStrategy;
}

export function TelegramStrategyBlock({ strategy }: TelegramStrategyProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[#71717a]">
        Telegram-группы — не для спама, а для полезного присутствия. Отвечай, когда люди сами
        ищут сайт, бота или CRM. Если заинтересовались — переходи в личку и добавляй в CRM.
      </p>

      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Где искать чаты</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {strategy.chatTypes.map((chat) => (
            <span key={chat} className="rounded-lg bg-white px-3 py-1.5 text-xs text-[#18181b]">
              {chat}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#f4f4f5] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Что делать</p>
          <ul className="mt-3 space-y-1.5">
            {strategy.dos.map((item) => (
              <li key={item} className="text-sm text-[#18181b]">· {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[#f4f4f5] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Что нельзя</p>
          <ul className="mt-3 space-y-1.5">
            {strategy.donts.map((item) => (
              <li key={item} className="text-sm text-[#71717a]">· {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: "Сообщение в чат", text: strategy.chatMessage },
          { label: "Мягкий вариант", text: strategy.softMessage },
          { label: "Если написали «нужен сайт»", text: strategy.replyToNeedSite },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-[#f4f4f5] p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">{item.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{item.text}</p>
            <div className="mt-3">
              <CopyButton text={item.text} label="Скопировать" className="w-full sm:w-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
