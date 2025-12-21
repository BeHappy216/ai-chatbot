"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_:not(pre)>code]:my-0 [&_:not(pre)>code]:inline [&_:not(pre)>code]:py-0 [&_:not(pre)>code]:align-baseline [&_:not(pre)>code]:text-[0.9em] [&_:not(pre)>code]:leading-inherit [&_blockquote]:whitespace-pre-wrap [&_blockquote]:not-italic [&_blockquote]:leading-[0] [&_blockquote_*]:leading-normal [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
