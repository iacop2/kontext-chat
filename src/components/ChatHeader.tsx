import { ApiKeySettings } from '@/components/ApiKeySettings';

export function ChatHeader() {
  return (
    <div className="bg-gradient-to-b from-primary/30 to-background">
      <div className="flex h-20 items-center justify-between px-4 w-full gap-4">
        <div className="flex-1" />
        <h1 className="text-3xl font-medium leading-[39.56px] tracking-[-0.04em] text-black">Kontext Chat</h1>
        <div className="flex-1 flex justify-end">
          <ApiKeySettings />
        </div>
      </div>
    </div>
  );
}