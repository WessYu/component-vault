import type { HTMLAttributes } from "react";

export const Text = {
  H1: (props: HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />,
  Paragraph: (props: HTMLAttributes<HTMLParagraphElement>) => <p {...props} />,
};
