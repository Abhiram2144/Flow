# 🎨 Component Visual Reference

## Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                   UI COMPONENT LIBRARY                  │
│                    (8 Total Components)                 │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   BUTTON         │  │   CARD           │  │   INPUT          │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Variants: 4      │  │ Variants: 3      │  │ Label: Yes       │
│ Sizes: 3         │  │ Sections: 3      │  │ Error: Yes       │
│ Primary ████████ │  │ Default: □────   │  │ Prefix: Yes      │
│ Secondary ██████ │  │ Elevated: ◆──    │  │ [Input Field]    │
│ Outline ┌──────┐ │  │ Outline:  ┌──┐   │  │ Keyboard: 6 types│
│ Ghost   text   │  │ Structure │  │   │  │ Error support    │
│ Destructive  ██│  │ ├─Header  │  │   │  │                  │
│                │  │ ├─Content │  │   │  │                  │
│ Sizes: sm/md/lg│  │ └─Footer  │  │   │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   BADGE          │  │   STAT           │  │   ALERT          │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Variants: 5      │  │ Formats: 3       │  │ Variants: 5      │
│ ✓ Success (✓)    │  │ • Currency (£)   │  │ ┃ Default        │
│ ⚠ Warning (⚠)    │  │ • Number (123)   │  │ ┃ Success  ✓      │
│ ✗ Error   (✗)    │  │ • Text          │  │ ┃ Warning  ⚠      │
│ ℹ Info    (ℹ)    │  │ Trends: ↑ ↓ ←   │  │ ┃ Error    ✗      │
│   Default       │  │ Icons: Yes       │  │ ┃ Info     ℹ      │
│                │  │ Flexible layout  │  │                  │
│ Compact design  │  │                  │  │ With title:      │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   SKELETON       │  │   PROGRESS       │
├──────────────────┤  ├──────────────────┤
│ Pulse Animation  │  │ Percentage: 0-100│
│ ████████░░░░░░░░│  │ ▰▰▰▰▰░░░░░░░░░░ │
│ ████░░░░░░░░░░░░│  │ Variants: 3      │
│ ████████████░░░░│  │ • Success (✓)    │
│                │  │ • Warning (⚠)    │
│ Loading states  │  │ • Error   (✗)    │
│ Pre-built card  │  │ Label: Optional  │
└──────────────────┘  └──────────────────┘
```

---

## Component Relationships

```
┌─────────────────────────────────────────┐
│            Container Layer              │
│  ┌─────────────────────────────────┐   │
│  │   CARD (Elevated/Default)       │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ CardHeader                │  │   │
│  │  │ • Title, Badge, etc       │  │   │
│  │  ├───────────────────────────┤  │   │
│  │  │ CardContent               │  │   │
│  │  │ • Form inputs             │  │   │
│  │  │ • Statistics              │  │   │
│  │  │ • Progress bars           │  │   │
│  │  ├───────────────────────────┤  │   │
│  │  │ CardFooter                │  │   │
│  │  │ • Buttons, actions        │  │   │
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
│         Content Components              │
│    Stat | Badge | Progress | Alert     │
│                                         │
│         Action Components               │
│    Button | Input                       │
│                                         │
│         Feedback Components             │
│    Skeleton | Alert                     │
└─────────────────────────────────────────┘
```

---

## Component Composition Example

```
DASHBOARD COMPOSITION:

┌─────────────────────────────────────┐
│         SafeAreaView                │
│  ┌──────────────────────────────┐   │
│  │  ScrollView                  │   │
│  │  ┌──────────────────────────┐│   │
│  │  │ ┌────────────────────────┤│   │
│  │  │ │ Card (Elevated)        ││   │
│  │  │ │ ├─ CardHeader          ││   │
│  │  │ │ │  └─ Text             ││   │
│  │  │ │ ├─ CardContent         ││   │
│  │  │ │ │  ├─ Stat (currency)  ││   │
│  │  │ │ │  ├─ Stat (number)    ││   │
│  │  │ │ │  ├─ Progress         ││   │
│  │  │ │ │  └─ Badge            ││   │
│  │  │ │ └─ CardFooter          ││   │
│  │  │ │    └─ Button           ││   │
│  │  │ └────────────────────────┤│   │
│  │  │                          ││   │
│  │  │ ┌────────────────────────┤│   │
│  │  │ │ Card (Outline)         ││   │
│  │  │ │ ├─ CardHeader          ││   │
│  │  │ │ │  └─ Text + Badge     ││   │
│  │  │ │ ├─ CardContent         ││   │
│  │  │ │ │  └─ Alert (info)     ││   │
│  │  │ │ └─ CardFooter          ││   │
│  │  │ │    └─ Button           ││   │
│  │  │ └────────────────────────┤│   │
│  │  └──────────────────────────┘│   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Button (primary, floating)  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Component Import Pattern

```
BEFORE (Without Components):
├── TextInput
├── Text
├── View
├── Pressable
├── StyleSheet (custom styles)
├── ActivityIndicator
└── ScrollView

AFTER (With Components):
├── Button          ← Replaces Pressable + styling
├── Input           ← Replaces TextInput + styling
├── Card            ← Replaces View + styling
├── Alert           ← Replaces Text + error styling
├── Skeleton        ← Replaces ActivityIndicator
├── Badge           ← New status component
├── Stat            ← New data display
└── Progress        ← New visual feedback
```

---

## Component Usage by Page

```
DASHBOARD PAGE
├── Card (main budget display)
│  └── Progress (spending visual)
├── Card (insight)
│  └── Badge (status)
├── View (stats grid)
│  ├── Card + Stat
│  └── Card + Stat
└── Button (add expense)

ACCOUNT PAGE
├── Card (profile header)
├── Card (budget)
│  ├── Input
│  └── Button
├── Card (bank statement)
│  └── Button
├── Card (data export)
│  └── Button
└── Card (danger zone)
   ├── Alert
   └── Button

MOMENTUM PAGE
├── Card (status)
│  └── Badge
├── View (stats grid)
│  ├── Card + Stat
│  ├── Card + Stat
│  └── Card + Stat
├── Card (chart)
│  └── MomentumChart
└── Card (transactions)
   └── Transaction list

ADD EXPENSE PAGE
├── Card (amount)
│  ├── Input
│  └── Alert (errors)
├── Card (category)
│  └── View (category chips)
├── Card (date)
│  └── Input
├── Card (merchant)
│  └── Input
├── Alert (submission errors)
└── Button (submit)
```

---

## Variant Tree

```
BUTTON
├── primary
│  └─ Size: sm, md, lg
├── secondary
│  └─ Size: sm, md, lg
├── outline
│  └─ Size: sm, md, lg
├── ghost
│  └─ Size: sm, md, lg
└── destructive
   └─ Size: sm, md, lg

CARD
├── default (subtle border)
├── elevated (shadow)
└── outline (emphasized border)

BADGE
├── default
├── success
├── warning
├── error
└── info

ALERT
├── default
├── success
├── warning
├── error
└── info

PROGRESS
├── default (gold)
├── success (green)
├── warning (orange)
└── error (red)

STAT
├── currency (£)
├── number (123)
└── text (custom)

SKELETON
├── Individual (custom size)
└── SkeletonCard (pre-built)

INPUT
└── All variants same (labels + error)
```

---

## Styling Hierarchy

```
COMPONENT STYLING

Level 1: Base Styles
├─ Container size/shape
├─ Background color
├─ Border style
└─ Padding/margin

Level 2: Variant Styles
├─ Color variations
├─ Size variations
└─ State variations

Level 3: Custom Styles
├─ Custom containerStyle
├─ Custom textStyle
└─ Custom style prop

Level 4: Theme Integration
├─ AppColors from constants
└─ Typography from constants
```

---

## State Management in Components

```
BUTTON STATES
normal  ← Default state
  ↓
pressed ← User touches
  ↓
disabled ← When isPending

INPUT STATES
empty  ← No value
  ↓
filled ← With value
  ↓
error  ← Validation failed
  ↓
focused ← User typing

CARD STATES
default ← Normal display
  ↓
loading ← Fetching data (show Skeleton)
  ↓
error   ← Show Alert
  ↓
success ← Data loaded

BADGE STATES
default → Normal
success → Positive
warning → Attention
error   → Alert
info    → Information
```

---

## Data Flow Pattern

```
Page Component
    ↓
Import Component
    ↓
Pass Props
    ├─ variant: 'primary'
    ├─ size: 'md'
    ├─ onPress: handleClick
    ├─ disabled: false
    └─ children: 'Click Me'
    ↓
Component Renders
    ├─ Apply variant styles
    ├─ Apply size styles
    ├─ Apply custom styles
    └─ Render content
    ↓
Component Exports
    ├─ Styled element
    ├─ Event handlers
    └─ Visual feedback
    ↓
User Interaction
    ├─ Visual feedback
    ├─ Haptic response
    └─ Action triggered
```

---

## Component Export Structure

```
components/ui/
│
├── button.tsx
│   ├── export interface ButtonProps { ... }
│   ├── export function Button() { ... }
│   └── const styles = StyleSheet.create()
│
├── card.tsx
│   ├── export function Card() { ... }
│   ├── export function CardHeader() { ... }
│   ├── export function CardContent() { ... }
│   ├── export function CardFooter() { ... }
│   ├── export interface CardProps { ... }
│   └── const styles = StyleSheet.create()
│
├── input.tsx
│   ├── export function Input() { ... }
│   ├── export interface InputProps { ... }
│   └── const styles = StyleSheet.create()
│
├── ... (other components)
│
└── index.ts
    ├── export { Button, ButtonProps }
    ├── export { Card, CardHeader, CardContent, CardFooter, CardProps }
    ├── export { Input, InputProps }
    ├── export { Badge, BadgeProps }
    ├── export { Stat, StatProps }
    ├── export { Alert, AlertProps }
    ├── export { Skeleton, SkeletonCard, SkeletonProps }
    └── export { Progress, ProgressProps }
```

---

## Common Composition Patterns

### Pattern 1: Form Card
```
<Card>
  <CardHeader>
    <Text>Form Title</Text>
  </CardHeader>
  <CardContent>
    <Input />
    <Input />
    {error && <Alert />}
  </CardContent>
  <CardFooter>
    <Button>Submit</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>
```

### Pattern 2: Stats Display
```
<Card>
  <CardHeader>
    <Text>Statistics</Text>
  </CardHeader>
  <CardContent>
    <View style={{flexDirection: 'row', gap: 12}}>
      <Stat label="Spent" value={1250} format="currency" />
      <Stat label="Days" value={15} format="number" />
    </View>
  </CardContent>
</Card>
```

### Pattern 3: Status Card
```
<Card variant="elevated">
  <CardContent>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text>Status</Text>
      <Badge variant="success">Active</Badge>
    </View>
    <Progress value={75} max={100} />
  </CardContent>
</Card>
```

---

## Quick Size Reference

```
Button Sizes:
├─ sm: padding 8×12
├─ md: padding 12×16
└─ lg: padding 14×24

Card Padding:
├─ header: 12px vertical, 16px horizontal
├─ content: 16px all sides
└─ footer: 12px vertical, 16px horizontal

Input Fields:
└─ padding: 12px vertical, 12px horizontal

Badge Padding:
└─ 10px horizontal, 6px vertical

Stat Padding:
└─ 14px all sides

Alert Padding:
└─ 14px all sides

Border Radius:
├─ Input: 8px
├─ Button: 8px
├─ Card: 12px
├─ Badge: 6px
└─ Progress: 4px
```

---

This is your complete visual reference guide! 🎨
