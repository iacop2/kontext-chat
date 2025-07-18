import { useState, useCallback } from 'react';
import { StyleModel } from '@/lib/models';
import { StyleState } from '@/types/chat';

export function useStyleSelection() {
	const [styleState, setStyleState] = useState<StyleState>({});

	const handleStyleSelect = useCallback((style: StyleModel) => {
		setStyleState({ selectedStyle: style });
	}, []);

	const handleStyleRemove = useCallback(() => {
		setStyleState({});
	}, []);

	return {
		styleState,
		handleStyleSelect,
		handleStyleRemove,
	};
}
