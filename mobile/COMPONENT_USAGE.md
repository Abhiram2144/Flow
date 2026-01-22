# Shadcn UI Components - Usage Guide

## Overview
This guide provides practical examples for using the shadcn-inspired UI components installed in the Flow app.

## Components Reference

### Button Component

**Variants:** `primary` | `secondary` | `outline` | `ghost` | `destructive`
**Sizes:** `sm` | `md` | `lg`

```tsx
import { Button } from '@/components/ui';

// Primary Button (Main Actions)
<Button variant="primary" size="md" onPress={() => console.log('clicked')}>
  Save Budget
</Button>

// Secondary Button (Less Important)
<Button variant="secondary" size="md">
  Cancel
</Button>

// Outline Button (Alternative Action)
<Button variant="outline" size="md">
  Learn More
</Button>

// Ghost Button (Minimal)
<Button variant="ghost" size="sm">
  Dismiss
</Button>

// Destructive Button (Dangerous Action)
<Button variant="destructive" size="md" onPress={deleteAccount}>
  Delete Account
</Button>

// Disabled State
<Button disabled>Saving...</Button>
```

---

### Card Component

**Variants:** `default` | `elevated` | `outline`

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Basic Card
<Card>
  <CardContent>
    <Text>Card content goes here</Text>
  </CardContent>
</Card>

// Card with Header
<Card variant="elevated">
  <CardHeader>
    <Text>Budget Overview</Text>
  </CardHeader>
  <CardContent>
    <Text>Remaining: £500</Text>
  </CardContent>
</Card>

// Full-Featured Card
<Card variant="default">
  <CardHeader>
    <Text>Monthly Report</Text>
  </CardHeader>
  <CardContent>
    <Text>Content goes here</Text>
  </CardContent>
  <CardFooter>
    <Button variant="primary" size="sm">Export</Button>
  </CardFooter>
</Card>
```

---

### Input Component

```tsx
import { Input } from '@/components/ui';

// Basic Input
<Input
  label="Amount"
  placeholder="0.00"
  value={amount}
  onChangeText={setAmount}
  keyboardType="decimal-pad"
/>

// Input with Currency Prefix
<Input
  label="Budget"
  prefix="£"
  placeholder="0"
  keyboardType="numeric"
  value={budget}
  onChangeText={setBudget}
/>

// Input with Error
<Input
  label="Email"
  error="Invalid email format"
  value={email}
  onChangeText={setEmail}
/>

// Custom Container Style
<Input
  label="Merchant"
  containerStyle={{ marginBottom: 20 }}
/>
```

---

### Badge Component

**Variants:** `default` | `success` | `warning` | `error` | `info`

```tsx
import { Badge } from '@/components/ui';

// Default Badge
<Badge>Pending</Badge>

// Success Badge
<Badge variant="success">On Budget</Badge>

// Warning Badge
<Badge variant="warning">High Spending</Badge>

// Error Badge
<Badge variant="error">Over Budget</Badge>

// Info Badge
<Badge variant="info">New Feature</Badge>
```

---

### Stat Component

```tsx
import { Stat } from '@/components/ui';

// Basic Stat
<Stat
  label="Spent"
  value={1250.50}
  format="currency"
/>

// Stat with Trend
<Stat
  label="Daily Average"
  value={50}
  format="currency"
  trend="up"
  trendValue="10%"
/>

// Number Format
<Stat
  label="Days Left"
  value={15}
  format="number"
/>

// Custom Text Format
<Stat
  label="Status"
  value="On Pace"
  format="text"
/>
```

---

### Alert Component

**Variants:** `default` | `success` | `warning` | `error` | `info`

```tsx
import { Alert } from '@/components/ui';

// Error Alert
<Alert
  variant="error"
  title="Could not save"
  message="Please check your connection and try again"
/>

// Success Alert
<Alert
  variant="success"
  title="Budget Updated"
  message="Your monthly budget has been successfully updated"
/>

// Warning Alert
<Alert
  variant="warning"
  title="High Spending"
  message="You've exceeded 80% of your monthly budget"
/>

// Info Alert
<Alert
  variant="info"
  message="Statement upload will be available soon"
/>
```

---

### Progress Component

```tsx
import { Progress } from '@/components/ui';

// Basic Progress
<Progress
  value={75}
  max={100}
/>

// With Label
<Progress
  value={75}
  max={100}
  showLabel
/>

// With Variant
<Progress
  value={50}
  max={100}
  variant="success"
/>

<Progress
  value={85}
  max={100}
  variant="warning"
/>

<Progress
  value={100}
  max={100}
  variant="error"
/>

// Custom Height
<Progress
  value={60}
  max={100}
  height={12}
/>
```

---

### Skeleton Component

```tsx
import { Skeleton, SkeletonCard } from '@/components/ui';

// Individual Skeleton
<Skeleton width="80%" height={20} />

// Skeleton Card (Pre-built)
<SkeletonCard />

// Skeleton with Custom Styles
<Skeleton
  width="100%"
  height={60}
  borderRadius={10}
/>

// Skeleton List
{isLoading ? (
  <View>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </View>
) : (
  <YourContentHere />
)}
```

---

## Real-World Examples

### Example 1: Budget Form
```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Alert,
} from '@/components/ui';

export function BudgetForm() {
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!budget) {
      setError('Please enter a budget amount');
      return;
    }
    // Save logic...
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <Text>Set Monthly Budget</Text>
      </CardHeader>
      <CardContent>
        <Input
          label="Budget Amount"
          prefix="£"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
        {error && <Alert variant="error" message={error} />}
        <Button
          variant="primary"
          onPress={handleSave}
          style={{ marginTop: 16 }}
        >
          Save Budget
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Transaction List
```tsx
import { Card, CardContent, CardHeader } from '@/components/ui';

export function TransactionList({ transactions }) {
  return (
    <Card>
      <CardHeader>
        <Text>Recent Transactions</Text>
      </CardHeader>
      <CardContent>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <View>
              <Text>{tx.merchant}</Text>
              <Text style={styles.date}>{tx.date}</Text>
            </View>
            <Text style={styles.amount}>£{tx.amount}</Text>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Example 3: Status Dashboard
```tsx
import { Card, CardContent, Badge, Stat, Progress } from '@/components/ui';

export function BudgetDashboard({ budget, spent }) {
  const percentage = (spent / budget) * 100;
  const status = percentage < 70 ? 'success' : percentage < 90 ? 'warning' : 'error';

  return (
    <Card variant="elevated">
      <CardContent>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>Remaining</Text>
            <Text style={styles.value}>£{(budget - spent).toFixed(2)}</Text>
          </View>
          <Badge variant={status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'error'}>
            {status}
          </Badge>
        </View>
        <Progress
          value={spent}
          max={budget}
          variant={status}
          showLabel
        />
        <View style={styles.stats}>
          <Stat label="Spent" value={spent} format="currency" />
          <Stat label="Budget" value={budget} format="currency" />
        </View>
      </CardContent>
    </Card>
  );
}
```

---

## Styling Tips

### Common Patterns

```tsx
// Spacing
<View style={{ gap: 12, marginBottom: 16 }}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</View>

// Grid Layout
<View style={{ flexDirection: 'row', gap: 12 }}>
  <Stat label="Stat 1" value={100} style={{ flex: 1 }} />
  <Stat label="Stat 2" value={200} style={{ flex: 1 }} />
</View>

// Conditional Styling
{error ? (
  <Alert variant="error" message={error} />
) : (
  <Alert variant="success" message="All good!" />
)}
```

---

## Theme Colors

All components use colors from `@/constants/theme.ts`:

```typescript
AppColors = {
  background: '#0B0D0F',      // Dark navy
  cardDark: '#111417',        // Slightly lighter navy
  cardLight: '#E5E5E5',       // Light gray
  border: '#1A1E24',          // Border color
  borderSubtle: '#2A2E35',    // Subtle borders
  textPrimary: '#EDE7DB',     // Main text (light)
  textSecondary: '#B8B2A7',   // Secondary text
  textTertiary: '#8C8577',    // Tertiary text
  accent: '#D4AF37',          // Gold
  accentLight: '#FFD966',     // Light gold
  error: '#ff6b6b',           // Red
}
```

---

## Best Practices

1. **Use Semantic Variants** - Choose button variants that convey intent
2. **Consistent Spacing** - Use gap and margin for consistent spacing
3. **Error Handling** - Always show errors with Alert component
4. **Loading States** - Use Skeleton components during loading
5. **Accessibility** - Always include labels for inputs
6. **Mobile-First** - Test on actual mobile devices
7. **Performance** - Use React.memo for complex components
8. **Testing** - Test all interactive elements thoroughly

---

## Troubleshooting

**Issue:** Text not visible
- Check text color against background
- Verify font weight and size are appropriate
- Ensure component is not hidden/overflow

**Issue:** Button not responding
- Verify onPress handler is defined
- Check if button is disabled
- Ensure Touch area is adequate (min 44x44)

**Issue:** Input not showing errors
- Verify error prop is passed
- Check if error text style is visible
- Ensure container has space for error message

**Issue:** Card shadow not showing
- Use `variant="elevated"` for shadow
- Check elevation/shadow values on platform
- Verify Android elevation is supported
