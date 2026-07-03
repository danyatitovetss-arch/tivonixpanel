interface ProspectActionsProps {
  onMarkMessaged: () => void;
  onMarkReplied: () => void;
  onConvert: () => void;
  onNotRelevant: () => void;
  onDoNotContact: () => void;
}

export function ProspectActions({
  onMarkMessaged,
  onMarkReplied,
  onConvert,
  onNotRelevant,
  onDoNotContact,
}: ProspectActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionBtn onClick={onMarkMessaged}>Написали</ActionBtn>
      <ActionBtn onClick={onMarkReplied}>Ответил</ActionBtn>
      <ActionBtn primary onClick={onConvert}>Добавить в лиды</ActionBtn>
      <ActionBtn onClick={onNotRelevant}>Не подходит</ActionBtn>
      <ActionBtn onClick={onDoNotContact}>Не трогать</ActionBtn>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "rounded-full bg-[#050505] px-4 py-2 text-sm font-medium text-white"
          : "rounded-full bg-[#f6f6f6] px-4 py-2 text-sm font-medium text-[#050505]"
      }
    >
      {children}
    </button>
  );
}
