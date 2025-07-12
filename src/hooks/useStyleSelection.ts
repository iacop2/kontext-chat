import { useState } from 'react';
import { StyleModel } from '@/lib/models';

type StyleSelectionState = {
  selectedStyle?: StyleModel;
};

export function useStyleSelection() {
  const [styleState, setStyleState] = useState<StyleSelectionState>({});

  const handleStyleSelect = (style: StyleModel) => {
    setStyleState({ selectedStyle: style });
  };

  const handleStyleRemove = () => {
    setStyleState({});
  };

  return {
    styleState,
    handleStyleSelect,
    handleStyleRemove,
  };
}