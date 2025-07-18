import { ApiKeySettings } from '@/components/ApiKeySettings';

export function ChatHeader() {
	return (
		<div className="bg-gradient-to-b from-primary/30 to-background">
			<div className="flex h-20 w-full items-center justify-between gap-4 px-4">
				<div className="flex-1" />
				<h1 className="text-3xl font-medium leading-[39.56px] tracking-[-0.04em] text-black">
					Kontext Chat
				</h1>
				<div className="flex flex-1 justify-end">
					<ApiKeySettings />
				</div>
			</div>
		</div>
	);
}
