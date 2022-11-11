// lint-staged.config.js
module.exports = {
  // Type check TypeScript files
  '**/*.(ts,tsx)': () => ['npx tsc --noEmit'],
  // Lint then format TypeScript and JavaScript files
  '**/*.(js,ts,tsx)': () => ['npx eslint src --fix'],
}
