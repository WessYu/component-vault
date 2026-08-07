type TextProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

function H1(props: TextProps) {
  return <h1 {...props} />;
}

function H2(props: TextProps) {
  return <h2 {...props} />;
}

function Paragraph(props: TextProps) {
  return <p {...props} />;
}

function Caption(props: TextProps) {
  return <small {...props} />;
}

export const Text = { H1, H2, Paragraph, Caption };
