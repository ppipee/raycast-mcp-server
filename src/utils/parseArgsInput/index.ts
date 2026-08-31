// Splits a command-line-ish string into argv tokens, honouring single and double
// quotes so values such as --header "Bearer x y" survive as one argument.
export default function parseArgsInput(input: string): string[] {
  const args: string[] = [];
  let current = "";
  let quote: '"' | "'" | undefined;
  let hasToken = false;

  for (const char of input.trim()) {
    if (quote) {
      if (char === quote) {
        quote = undefined;
      } else {
        current += char;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;

      continue;
    }

    if (/\s/.test(char)) {
      if (hasToken) {
        args.push(current);
        current = "";
        hasToken = false;
      }

      continue;
    }

    current += char;
    hasToken = true;
  }

  if (hasToken) {
    args.push(current);
  }

  return args;
}
