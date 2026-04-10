export function printSection(title, lines) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
  for (const line of lines) {
    console.log(line);
  }
}
