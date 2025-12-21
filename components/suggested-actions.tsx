"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useMemo } from "react";
import { chatModels } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
};

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedModelId,
}: SuggestedActionsProps) {
  const suggestedActions = useMemo(() => {
    const model = chatModels.find((m) => m.id === selectedModelId);
    return (
      model?.suggestions || [
        "什么是四念住？",
        "什么是不死之心？",
        "解脱道修行的次第",
        "如何应用我是觉知",
      ]
    );
  }, [selectedModelId]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1 }}
        className="grid w-full gap-2 sm:grid-cols-2"
        data-testid="suggested-actions"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key={suggestedActions.join("|")}
      >
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            key={suggestedAction}
            transition={{ delay: 0.05 * index }}
          >
            <Suggestion
              className="h-auto w-full whitespace-normal p-3 text-left"
              onClick={(suggestion) => {
                window.history.pushState({}, "", `/chat/${chatId}`);
                sendMessage({
                  role: "user",
                  parts: [{ type: "text", text: suggestion }],
                });
              }}
              suggestion={suggestedAction}
            >
              {suggestedAction}
            </Suggestion>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }
    return true;
  }
);
