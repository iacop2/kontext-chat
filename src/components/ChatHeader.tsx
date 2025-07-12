export function ChatHeader() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="container flex h-14 items-center justify-center">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Kontext Chat</h1>
        </div>
      </div>
    </div>
  );
}