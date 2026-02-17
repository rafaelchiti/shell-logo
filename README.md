# shell-logo

Render colorful ASCII art logos in your terminal using Figlet fonts and gradient colors.

## Install

```bash
pnpm install -g shell-logo
# or
npm i -g shell-logo
```

## Usage

```bash
shell-logo
```

Launches an interactive menu to configure and generate your logo. A `.shell-logo.json` file is created in the current directory to persist your settings.

## Config

The generated `.shell-logo.json` looks like this:

```json
{
  "text": "My Project",
  "font": "Standard",
  "gradient": ["#ff6b6b", "#feca57"]
}
```

See `examples/` for more config samples.

## License

MIT
