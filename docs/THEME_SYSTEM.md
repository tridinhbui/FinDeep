# Theme System Documentation

## Overview

This project implements a comprehensive theme system with Light and Dark modes using CSS custom properties (design tokens). The system respects user preferences, persists theme choices, and provides a consistent design language across the application.

## Features

- ✅ **Light/Dark Mode Toggle**: Switch between themes with a smooth transition
- ✅ **Design Tokens**: All colors use CSS custom properties for consistency
- ✅ **Persistence**: Theme choice is saved to localStorage
- ✅ **System Preference**: Respects `prefers-color-scheme` on first load
- ✅ **WCAG AA Compliance**: Dark theme has sufficient contrast ratios
- ✅ **No Hard-coded Colors**: Components only reference CSS variables
- ✅ **Smooth Transitions**: All theme changes are animated

## Architecture

### Files Structure

```
src/
├── styles/
│   └── theme.css              # Design tokens and base styles
├── theme/
│   ├── useTheme.ts            # Theme management hook
│   └── __tests__/
│       └── useTheme.test.ts   # Theme system tests
├── components/
│   └── ThemeToggle.tsx        # Theme toggle components
└── contexts/
    └── ThemeContext.tsx       # React context wrapper
```

### Design Tokens

The theme system uses CSS custom properties defined in `src/styles/theme.css`:

#### Background Colors
- `--color-bg`: Primary background
- `--color-bg-secondary`: Secondary background
- `--color-bg-tertiary`: Tertiary background

#### Surface Colors
- `--color-surface`: Card/panel backgrounds
- `--color-surface-hover`: Hover states
- `--color-surface-secondary`: Alternative surface

#### Text Colors
- `--color-text`: Primary text
- `--color-text-secondary`: Secondary text
- `--color-text-muted`: Muted text
- `--color-text-inverse`: Inverse text (white on dark, black on light)

#### Border Colors
- `--color-border`: Primary borders
- `--color-border-secondary`: Secondary borders
- `--color-border-muted`: Subtle borders

#### Accent Colors
- `--color-accent`: Primary accent color
- `--color-accent-hover`: Accent hover state
- `--color-accent-secondary`: Secondary accent

#### Status Colors
- `--color-success`: Success state
- `--color-warning`: Warning state
- `--color-error`: Error state

#### Chat Bubble Colors
- `--color-chat-user`: User message background
- `--color-chat-user-text`: User message text
- `--color-chat-assistant`: Assistant message background
- `--color-chat-assistant-text`: Assistant message text
- `--color-chat-assistant-border`: Assistant message border

## Usage

### Using the Theme Hook

```tsx
import { useTheme } from '../theme/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme, isDark, isLight } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

### Using Design Tokens in CSS

```css
.my-component {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}
```

### Using Design Tokens in Tailwind

```tsx
<div className="bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]">
  Content using design tokens
</div>
```

### Theme Toggle Components

```tsx
import { ThemeToggle, CompactThemeToggle } from './components/ThemeToggle';

// Full toggle with label
<ThemeToggle size="md" showLabel />

// Compact toggle for headers
<CompactThemeToggle />
```

## Theme Values

### Light Theme (Default)
- Background: `#ffffff` (pure white)
- Text: `#000000` (pure black)
- Surface: `#ffffff` (white)
- Accent: `#000000` (black)
- Borders: `#e5e7eb` (light gray)

### Dark Theme
- Background: `#0f0f0f` (near black)
- Text: `#ffffff` (white)
- Surface: `#1a1a1a` (dark gray)
- Accent: `#ffffff` (white)
- Borders: `#374151` (medium gray)

## Implementation Details

### Theme Detection
1. Check localStorage for saved preference
2. If no saved preference, detect system preference using `window.matchMedia`
3. Default to light mode if no preference detected

### Theme Application
- Theme is applied via `data-theme` attribute on `<html>` element
- CSS variables are defined for both `:root` (light) and `[data-theme="dark"]` (dark)
- All theme changes are animated with CSS transitions

### Persistence
- Theme choice is saved to localStorage with key `findeep-theme`
- System preference changes are only applied if user hasn't manually set a preference
- Theme persists across browser sessions and page reloads

## Testing

### Manual Testing
1. Navigate to `/theme-demo` to see the theme system in action
2. Toggle between light and dark modes
3. Refresh the page to verify persistence
4. Change system preference and reload (should only affect first-time users)

### Automated Testing
```bash
npm test src/theme/__tests__/useTheme.test.ts
```

## Browser Support

- Modern browsers with CSS custom properties support
- Fallback to light mode for unsupported browsers
- Graceful degradation for localStorage and matchMedia

## Accessibility

- WCAG AA compliant contrast ratios
- Focus indicators use theme colors
- Reduced motion support via CSS transitions
- High contrast mode compatibility

## Performance

- CSS variables are applied at the document level
- Minimal JavaScript overhead for theme switching
- Efficient localStorage usage
- No runtime style calculations

## Migration Notes

### From Previous Theme System
- Old Tailwind dark mode classes are replaced with CSS variables
- `dark:` prefixes are replaced with `[var(--color-*)]` syntax
- Theme context now wraps the new useTheme hook
- All hard-coded colors have been replaced with design tokens

### Breaking Changes
- Components using old theme classes need to be updated
- Custom CSS using hard-coded colors should use design tokens
- Theme provider interface remains the same for compatibility
