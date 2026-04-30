# Dentline Clinic - Component Library

This directory contains all reusable components for the Dentline Clinic application.

## Directory Structure

```
components/
├── ui/              # Reusable UI components
├── layout/          # Layout components (Sidebar, TopBar)
└── landing/         # Landing page specific components
```

## UI Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import Button from "@/components/ui/Button";

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" isLoading={loading}>
  Delete
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "danger" | "ghost"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: ReactNode

### Input
Form input with label, error handling, and icons.

```tsx
import Input from "@/components/ui/Input";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`, `rightIcon`: ReactNode

### Modal
Centered modal dialog with backdrop blur.

```tsx
import Modal from "@/components/ui/Modal";

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `subtitle`: string (optional)
- `size`: "sm" | "md" | "lg" | "xl"
- `footer`: ReactNode (optional)

### SidePanel
Sliding panel from the right side.

```tsx
import SidePanel from "@/components/ui/SidePanel";

<SidePanel
  isOpen={isOpen}
  onClose={handleClose}
  title="Details"
  subtitle="View information"
  width="md"
  footer={<Button onClick={handleClose}>Close</Button>}
>
  <div>Panel content here</div>
</SidePanel>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `subtitle`: string (optional)
- `width`: "sm" | "md" | "lg"
- `footer`: ReactNode (optional)

### Table
Responsive table with loading and empty states.

```tsx
import { Table, TableRow, TableCell, TableLoading, TableEmpty } from "@/components/ui/Table";

<Table headers={["Name", "Email", "Status"]} minWidth="640px">
  {loading ? (
    <TableLoading rows={5} cols={3} />
  ) : data.length === 0 ? (
    <TableEmpty colSpan={3} message="No data found" />
  ) : (
    data.map((item) => (
      <TableRow key={item.id} onClick={() => handleClick(item)}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell><StatusBadge status={item.status} /></TableCell>
      </TableRow>
    ))
  )}
</Table>
```

### StatusBadge
Colored badge for status display.

```tsx
import StatusBadge from "@/components/ui/StatusBadge";

<StatusBadge status="COMPLETED" variant="history" />
<StatusBadge status="PAID" variant="payment" />
<StatusBadge status="BOOKED" variant="appointment" />
```

**Props:**
- `status`: string
- `variant`: "appointment" | "payment" | "history"

### Avatar
User avatar with initials.

```tsx
import Avatar from "@/components/ui/Avatar";

<Avatar initials="JD" size="md" />
```

**Props:**
- `initials`: string
- `size`: "sm" | "md" | "lg" | "xl"
- `className`: string (optional)

### Card
Container card with optional hover effect.

```tsx
import Card from "@/components/ui/Card";

<Card padding="md" hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Props:**
- `padding`: "none" | "sm" | "md" | "lg"
- `hover`: boolean
- `className`: string (optional)

### StatsCard
Statistics display card.

```tsx
import StatsCard from "@/components/ui/StatsCard";

<StatsCard
  label="Total Patients"
  value="1,234"
  badge="+12%"
  subtitle="vs last month"
  icon={<PatientIcon />}
/>
```

### Alert
Alert message with variants.

```tsx
import Alert from "@/components/ui/Alert";

<Alert variant="success">Operation completed successfully</Alert>
<Alert variant="error">An error occurred</Alert>
```

**Props:**
- `variant`: "success" | "error" | "warning" | "info"

### SearchInput
Search input with icon.

```tsx
import SearchInput from "@/components/ui/SearchInput";

<SearchInput
  placeholder="Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

### FilterButtons
Filter button group.

```tsx
import FilterButtons from "@/components/ui/FilterButtons";

<FilterButtons
  filters={["All", "Active", "Inactive"]}
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
/>
```

### LoadingSpinner
Loading spinner indicator.

```tsx
import LoadingSpinner from "@/components/ui/LoadingSpinner";

<LoadingSpinner size="md" />
```

**Props:**
- `size`: "sm" | "md" | "lg"

### EmptyState
Empty state placeholder.

```tsx
import EmptyState from "@/components/ui/EmptyState";

<EmptyState
  icon={<SearchIcon />}
  title="No results found"
  description="Try adjusting your search"
  action={<Button>Clear Filters</Button>}
/>
```

## Best Practices

1. **Always use TypeScript** - All components are typed for better DX
2. **Responsive by default** - Components adapt to screen sizes
3. **Accessible** - Components follow ARIA guidelines
4. **Consistent styling** - Use the design system colors and spacing
5. **Reusable** - Extract repeated patterns into components

## Design System

### Colors
- Primary: `#00685C`
- Secondary: `#0D9488`
- Danger: `#93000A`
- Text: `#0B1C30`
- Muted: `#94A3B8`
- Border: `#F1F5F9`
- Background: `#F8F9FF`

### Spacing
- sm: `0.5rem` (8px)
- md: `1rem` (16px)
- lg: `1.5rem` (24px)
- xl: `2rem` (32px)

### Border Radius
- sm: `0.375rem` (6px)
- md: `0.5rem` (8px)
- lg: `0.75rem` (12px)
- xl: `1rem` (16px)
