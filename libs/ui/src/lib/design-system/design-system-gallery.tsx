import {useState} from 'react';

import {Bell, Info, Plus, Search, ShoppingBasket} from 'lucide-react';

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  Input,
  Label,
  Logo,
  Money,
  OtpInput,
  PasswordInput,
  PhoneInput,
  PriceStatus,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeToggle,
  toast,
  Tooltip,
} from '../components';
import {GrovSection, MoreFieldsSection, NavigationSection, RichDataDemos} from './more-sections';
import {Row, Section, sectionId, SECTIONS} from './parts';

/**
 * Every @grov/ui token and component on one page, in the current theme.
 * Mounted at /design-system in the app and admin (dev, or VITE_SHOW_DESIGN_SYSTEM).
 * Add a section here whenever you add or change a component.
 */

const COLOURS: {group: string; tokens: {name: string; className: string; ink?: string}[]}[] = [
  {
    group: 'Surfaces',
    tokens: [
      {name: 'canvas', className: 'bg-canvas'},
      {name: 'surface', className: 'bg-surface'},
      {name: 'surface-raised', className: 'bg-surface-raised'},
      {name: 'surface-sunken', className: 'bg-surface-sunken'},
      {name: 'night', className: 'bg-night', ink: 'text-on-night'},
      {name: 'night-hi', className: 'bg-night-hi', ink: 'text-on-night'},
    ],
  },
  {
    group: 'Brand and action',
    tokens: [
      {name: 'primary (flame)', className: 'bg-primary', ink: 'text-primary-foreground'},
      {name: 'flame-strong', className: 'bg-flame-strong', ink: 'text-on-night'},
      {name: 'flame-tint', className: 'bg-flame-tint', ink: 'text-flame-strong'},
      {name: 'action-disabled', className: 'bg-action-disabled', ink: 'text-on-action-disabled'},
    ],
  },
  {
    group: 'Status',
    tokens: [
      {name: 'leaf', className: 'bg-leaf', ink: 'text-on-bright'},
      {name: 'leaf-tint', className: 'bg-leaf-tint', ink: 'text-leaf-strong'},
      {name: 'palm', className: 'bg-palm', ink: 'text-on-bright'},
      {name: 'palm-tint', className: 'bg-palm-tint', ink: 'text-palm-strong'},
      {name: 'sky-tint', className: 'bg-sky-tint', ink: 'text-sky-strong'},
      {name: 'danger', className: 'bg-danger', ink: 'text-destructive-foreground'},
      {name: 'danger-tint', className: 'bg-danger-tint', ink: 'text-danger'},
    ],
  },
  {
    group: 'Ink and lines',
    tokens: [
      {name: 'ink', className: 'bg-ink', ink: 'text-canvas'},
      {name: 'ink-muted', className: 'bg-ink-muted', ink: 'text-canvas'},
      {name: 'line', className: 'bg-line'},
      {name: 'line-strong', className: 'bg-line-strong', ink: 'text-canvas'},
    ],
  },
];

const TYPE: {className: string; label: string}[] = [
  {className: 'font-display text-display-xl', label: 'display-xl · ₦184,500'},
  {className: 'font-display text-display-lg', label: 'display-lg · ₦52,400'},
  {className: 'text-title-lg', label: 'title-lg · Your plan for October'},
  {className: 'text-title-md', label: 'title-md · Stock list'},
  {className: 'text-title-sm', label: 'title-sm · Rice, local parboiled'},
  {className: 'text-body-lg', label: 'body-lg · Plan your household food budget.'},
  {className: 'text-body', label: 'body · Every line says why it’s there and what it costs.'},
  {className: 'text-body-sm', label: 'body-sm · Updated 2 hours ago'},
  {className: 'text-label', label: 'label · Continue'},
  {className: 'text-chip', label: 'chip · LOCKED'},
  {className: 'text-money', label: 'money · ₦21,000'},
];

export function DesignSystemGallery() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <Logo />
          <h1 className="text-title-lg">Design system</h1>
          <p className="max-w-2xl text-body text-ink-muted">
            Tokens and components from <code>@grov/ui</code>. Switch the theme to check both. Visual
            rules live in the design skill.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <nav aria-label="Sections" className="flex flex-wrap gap-2">
        {SECTIONS.map(s => (
          <a
            key={s}
            href={`#${sectionId(s)}`}
            className="rounded-pill bg-surface-sunken px-3 py-1.5 text-body-sm font-semibold hover:bg-line"
          >
            {s}
          </a>
        ))}
      </nav>

      <Section title="Colours">
        <div className="grid gap-6">
          {COLOURS.map(group => (
            <div key={group.group} className="grid gap-3">
              <h3 className="text-chip uppercase tracking-wide text-ink-muted">{group.group}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {group.tokens.map(t => (
                  <div key={t.name} className="overflow-hidden rounded-md border border-line">
                    <div
                      className={`flex h-16 items-end p-2 text-chip ${t.className} ${t.ink ?? 'text-ink'}`}
                    >
                      Aa
                    </div>
                    <div className="bg-surface px-2 py-1.5 text-body-sm">
                      <code>{t.className}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="grid gap-4">
          {TYPE.map(t => (
            <p key={t.label} className={t.className}>
              {t.label}
            </p>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <Row label="Variants">
          <Button>Primary</Button>
          <Button variant="night">Night</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="Search">
            <Search />
          </Button>
        </Row>
        <Row label="States">
          <Button>
            <ShoppingBasket /> Add to basket
          </Button>
          <Button loading>Paying</Button>
          <Button disabled>Disabled</Button>
          <Button block className="max-w-xs">
            Block
          </Button>
        </Row>
      </Section>

      <Section title="Fields">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Email" hint="We’ll send a code to this address.">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Email" error="Enter a valid email address">
            <Input type="email" defaultValue="ngozi@" />
          </Field>
          <Field label="Password" hint="At least 8 characters with a symbol.">
            <PasswordInput defaultValue="secret!123" />
          </Field>
          <Field label="Phone" hint="The rider calls this number.">
            <PhoneInput />
          </Field>
          <Field label="Last name" optional>
            <Input />
          </Field>
          <Field label="Disabled">
            <Input disabled defaultValue="Ikeja, Lagos" />
          </Field>
          <OtpDemo />
          <Field label="City">
            <Select defaultValue="lagos">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="ibadan">Ibadan</SelectItem>
                <SelectItem value="abuja" disabled>
                  Abuja (soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <MoreFieldsSection />

      <Section title="Selection">
        <Row label="Checkbox">
          <div className="flex items-center gap-3">
            <Checkbox id="ds-cb1" defaultChecked />
            <Label htmlFor="ds-cb1">We have a freezer</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="ds-cb2" />
            <Label htmlFor="ds-cb2">Avoid groundnuts</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="ds-cb3" disabled />
            <Label htmlFor="ds-cb3">Disabled</Label>
          </div>
        </Row>
        <Row label="Switch">
          <div className="flex items-center gap-3">
            <Switch id="ds-sw1" defaultChecked />
            <Label htmlFor="ds-sw1">Plan reminders</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ds-sw2" />
            <Label htmlFor="ds-sw2">Marketing emails</Label>
          </div>
        </Row>
        <Row label="Tabs">
          <Tabs defaultValue="families" className="grid gap-3">
            <TabsList>
              <TabsTrigger value="families">Families</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>
            <TabsContent value="families" className="text-body text-ink-muted">
              Plans for everyone you feed.
            </TabsContent>
            <TabsContent value="students" className="text-body text-ink-muted">
              Small packs and roommate baskets.
            </TabsContent>
          </Tabs>
        </Row>
        <Row label="Theme toggle">
          <ThemeToggle />
          <ThemeToggle compact />
        </Row>
      </Section>

      <Section title="Status">
        <Row label="Badges">
          <Badge>Neutral</Badge>
          <Badge tone="flame">Selected</Badge>
          <Badge tone="leaf">Paid</Badge>
          <Badge tone="palm">Savings</Badge>
          <Badge tone="sky">Info</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="night">All permissions</Badge>
        </Row>
        <Row label="Price status (every price before payment)">
          <PriceStatus status="locked" />
          <PriceStatus status="estimate" detail="₦4,100–₦4,600" />
          <PriceStatus status="updated" detail="2h ago" />
          <PriceStatus status="changed" detail="₦3,900 → ₦4,200" />
          <PriceStatus status="out-of-stock" />
        </Row>
        <Row label="Money (integer kobo in)">
          <Money kobo={18_450_000} className="font-display text-display-lg" />
          <Money kobo={-120_000} className="text-money" />
          <Money kobo={50_000} signed className="text-money" />
          <Money kobo={123_456} showKobo className="text-money" />
        </Row>
        <Row label="Avatar">
          <Avatar name="Ngozi" />
          <Avatar name="Tunde" className="size-12" />
        </Row>
      </Section>

      <Section title="Feedback">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert tone="info" title="Prices are estimates">
            Final prices lock when you pay.
          </Alert>
          <Alert tone="success" title="Order placed">
            Arrives Saturday, 10am–2pm.
          </Alert>
          <Alert tone="warning" title="₦24,500 above your budget">
            That’s fine. Checkout still works.
          </Alert>
          <Alert tone="danger" title="Payment didn’t go through">
            Nothing was charged. Try again.
          </Alert>
        </div>
        <Row label="Toasts">
          <Button variant="outline" onClick={() => toast('Basket updated')}>
            Default
          </Button>
          <Button variant="outline" onClick={() => toast.success('Code sent')}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error('Can’t reach us right now')}>
            Error
          </Button>
        </Row>
        <Row label="Loading">
          <Spinner />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-10 rounded-pill" />
        </Row>
      </Section>

      <Section title="Overlays">
        <Row label="Dialogs">
          {(['center', 'sheet', 'side'] as const).map(layout => (
            <Dialog key={layout}>
              <DialogTrigger asChild>
                <Button variant="outline">{layout}</Button>
              </DialogTrigger>
              <DialogContent layout={layout}>
                <DialogHeader>
                  <DialogTitle>Remove rice from the basket?</DialogTitle>
                  <DialogDescription>You can add it back from the stock list.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Keep it</Button>
                  <Button>Remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </Row>
        <Row label="Menu and tooltip">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuItem>
                <Bell /> Remind me
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Edit (after cut-off)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cancel order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip content="Edit until Thursday 6pm">
            <Button variant="ghost" size="icon" aria-label="About cut-off">
              <Info />
            </Button>
          </Tooltip>
        </Row>
      </Section>

      <GrovSection />

      <NavigationSection />

      <Section title="Data">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">Rice, local parboiled</TableCell>
              <TableCell>4.5 kg</TableCell>
              <TableCell>
                <Money kobo={2_100_000} />
              </TableCell>
              <TableCell>
                <PriceStatus status="locked" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Brown beans</TableCell>
              <TableCell>2.5 kg</TableCell>
              <TableCell>
                <Money kobo={840_000} />
              </TableCell>
              <TableCell>
                <PriceStatus status="estimate" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <RichDataDemos />
      </Section>

      <Section title="Layout">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>Header, content and footer.</CardDescription>
            </CardHeader>
            <CardContent className="text-body">
              Plan total: <Money kobo={18_450_000} />
            </CardContent>
            <CardFooter>
              <Button size="sm">Add to basket</Button>
            </CardFooter>
          </Card>
          <Card>
            <EmptyState
              icon={<ShoppingBasket />}
              title="Your basket is empty"
              description="Add the stock list or pick items from Shop."
              action={<Button size="sm">Go to Shop</Button>}
            />
          </Card>
        </div>
        <Separator />
        <Row label="Logo">
          <Logo />
          <Logo markOnly />
        </Row>
      </Section>
    </div>
  );
}

function OtpDemo() {
  const [code, setCode] = useState('');
  return (
    <div className="grid gap-2">
      <span className="text-body-sm font-semibold">6-digit code</span>
      <OtpInput value={code} onChange={setCode} aria-label="6-digit code" />
    </div>
  );
}
