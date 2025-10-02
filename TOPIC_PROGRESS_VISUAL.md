## Topic Card Progress - Visual Layout

### Before (Original)
```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Topic Title                              [▶]  [→]       │
│  Description text goes here...                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### After (With Progress)
```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Topic Title                  [3/8 (38%)]  [▶]  [→]     │
│  Description text goes here...                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
                                     ↑
                              NEW PROGRESS BADGE
```

### Component Structure
```
<div class="topic-card">                    // Main container
  <div class="flex-1">                      // Left side
    <h3>Topic Title</h3>
    <p>Description</p>
  </div>
  
  <div class="flex items-center gap-3">    // Right side
    <!-- NEW ELEMENT -->
    <div class="progress-badge">           // Progress badge
      <span>3/8</span>
      <span>(38%)</span>
    </div>
    
    <div class="play-icon">                // Play button
      <PlayIcon />
    </div>
    
    <ArrowRight />                         // Arrow
  </div>
</div>
```

### Color Variations

#### 1. Sky Theme (Topic 1)
```
┌───────────────────────────────────────────────────────────┐
│  🌊 React Fundamentals      [2/8 (25%)]  [▶]  [→]       │
│     Learn the basics of React hooks...                   │
└───────────────────────────────────────────────────────────┘
   ↑ Sky blue gradient with matching progress badge
```

#### 2. Violet Theme (Topic 2)
```
┌───────────────────────────────────────────────────────────┐
│  💜 State Management        [4/8 (50%)]  [▶]  [→]       │
│     Master state in React applications...                │
└───────────────────────────────────────────────────────────┘
   ↑ Purple/violet gradient with matching progress badge
```

#### 3. Completed (Green)
```
┌───────────────────────────────────────────────────────────┐
│  ✅ Introduction            [8/8 (100%)]  [▶]  [→]      │
│     Get started with the basics...                       │
└───────────────────────────────────────────────────────────┘
   ↑ Emerald green gradient indicating completion
```

#### 4. Locked (Gray)
```
┌───────────────────────────────────────────────────────────┐
│  🔒 Advanced Patterns       [0/8 (0%)]  [▶]  [→]        │
│     Complete previous topics to unlock...                │
└───────────────────────────────────────────────────────────┘
   ↑ Gray muted style, cursor: not-allowed
```

### Mobile View (< 640px)
```
┌──────────────────────────────────┐
│                                  │
│  Topic Title                     │
│  Description...                  │
│                                  │
│         [2/8 (25%)]  [▶]  [→]   │
│                                  │
└──────────────────────────────────┘
     ↑ Progress badge remains readable
```

### CSS Classes Applied

#### Progress Badge
```css
/* Base styles */
px-3 py-1.5           // Padding: 12px horizontal, 6px vertical
rounded-full          // Fully rounded corners
backdrop-blur-sm      // Subtle blur effect
flex items-center     // Flexbox alignment
gap-1.5              // 6px gap between elements

/* Color variations (example: sky theme) */
bg-sky-400/30        // Sky blue with 30% opacity
text-sky-100         // Light sky text color

/* Typography */
text-xs              // 12px font size
font-semibold        // Bold numbers
opacity-80           // 80% opacity for percentage
```

### Interactive States

#### Default State
```
[3/8 (38%)]  ← Normal state
```

#### Hover State (entire card)
```
[3/8 (38%)]  ← Badge maintains style
                Card lifts up slightly
                Shadow becomes more prominent
```

#### Focus State
```
[3/8 (38%)]  ← Badge remains visible
                Keyboard focus ring on card
```

### Progress Badge Sizing

```
┌─────────────────┐
│  3  /  8  (38%) │
│  ↑    ↑    ↑   │
│  │    │    │   │
│  │    │    └─ Percentage (lighter)
│  │    └────── Total lessons
│  └─────────── Completed lessons
└─────────────────┘
     78px width (approximate)
```

### Spacing Breakdown

```
┌────────────┬─────┬──────────────┬─────┬────────┬─────┬───────┐
│  Topic     │     │  [2/5 (40%)] │     │   [▶]  │     │  [→]  │
│  Info      │ 16px│   Progress   │ 12px│  Play  │ 12px│ Arrow │
└────────────┴─────┴──────────────┴─────┴────────┴─────┴───────┘
   flex-1    ml-4     Badge        gap-3   Icon    gap-3  Icon
```

### Accessibility

#### Screen Reader Output
```html
<div role="article" aria-label="React Fundamentals topic">
  <h3>React Fundamentals</h3>
  <p>Learn the basics of React...</p>
  <div aria-label="Progress: 2 out of 8 lessons completed, 25 percent">
    <span>2/8</span>
    <span>(25%)</span>
  </div>
  <button aria-label="Start learning React Fundamentals">
    <PlayIcon />
  </button>
</div>
```

### Color Palette Reference

| Theme    | Card Gradient                              | Badge Background  | Badge Text    |
|----------|-------------------------------------------|-------------------|---------------|
| Sky      | from-sky-500/25 to-indigo-500/25         | bg-sky-400/30     | text-sky-100  |
| Violet   | from-violet-600/25 to-fuchsia-500/25     | bg-fuchsia-400/30 | text-fuchsia-100 |
| Amber    | from-amber-500/25 to-rose-500/25         | bg-amber-400/30   | text-amber-100 |
| Emerald  | from-emerald-500/25 to-lime-500/25       | bg-emerald-400/30 | text-emerald-100 |
| Rose     | from-rose-500/25 to-purple-500/25        | bg-rose-400/30    | text-rose-100 |
| Cyan     | from-cyan-500/25 to-blue-500/25          | bg-cyan-400/30    | text-cyan-100 |
| Completed| from-emerald-500/20 to-emerald-400/25    | bg-emerald-500/30 | text-emerald-100 |
| Locked   | bg-gray-900/40                           | bg-gray-600       | text-gray-300 |

---

**Design System Compliance**: ✅ Follows existing gradient patterns
**Brand Consistency**: ✅ Matches current UI theme
**User Testing**: Ready for feedback
