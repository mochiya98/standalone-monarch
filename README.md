# Standalone Monarch

> optimized for syntax highlighting 🦋

## Usage

```bash
npm i && npm run build
```

```tsx
StandaloneMonarch.colorizeElement(targetNode, {mimeType: "typescript"});
StandaloneMonarch.colorize("const a = 3;", 'typescript').then(c => console.log(c));
StandaloneMonarch.defineTheme('myTheme', {base: "vs", inherit: true});
StandaloneMonarch.setTheme("vs-dark");
```
