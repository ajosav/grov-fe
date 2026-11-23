import {createContext, type ReactNode, useContext, useState} from 'react';

import {
  ChartPie,
  ClipboardList,
  House,
  Leaf,
  PiggyBank,
  Salad,
  ShoppingBasket,
  Sparkles,
  Store,
  Wheat,
  WifiOff,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActionBar,
  AmountInput,
  AppBar,
  Banner,
  BottomNav,
  type BottomNavLink,
  BudgetMeter,
  Button,
  CollapsibleCard,
  type ColumnDef,
  Combobox,
  ConfirmDialog,
  CopyableText,
  DataTable,
  DatePicker,
  Field,
  FileUpload,
  GlassCard,
  HeroPanel,
  IconTile,
  Label,
  LoadMore,
  Markdown,
  Money,
  MultiCombobox,
  OrSeparator,
  Pagination,
  PlanLine,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  QuantityStepper,
  RadioGroup,
  RadioGroupItem,
  type RowSelectionState,
  Segmented,
  SelectTile,
  StatusDialog,
  StepIndicator,
  Tag,
  Textarea,
  Wash,
} from '../components';
import {Row, Section} from './parts';

const FOODS = [
  {value: 'rice', label: 'Rice, local parboiled', keywords: ['ofada']},
  {value: 'beans', label: 'Brown beans', keywords: ['oloyin', 'ewa']},
  {value: 'garri', label: 'Garri, yellow'},
  {value: 'yam', label: 'Yam tuber', keywords: ['isu']},
  {value: 'palm-oil', label: 'Palm oil'},
  {value: 'groundnut', label: 'Groundnut oil'},
  {value: 'egusi', label: 'Egusi, ground'},
  {value: 'crayfish', label: 'Crayfish'},
];

/** Gallery sections for the components added in the first component pass. */
export function MoreFieldsSection() {
  const [kobo, setKobo] = useState<number | null>(15_000_000);
  const [food, setFood] = useState<string | null>(null);
  const [avoid, setAvoid] = useState<string[]>(['crayfish']);
  const [date, setDate] = useState<Date | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [delivery, setDelivery] = useState('door');
  return (
    <Section title="More fields">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Monthly food budget" hint="Whole naira. Sent to the API as kobo.">
          <AmountInput valueKobo={kobo} onChangeKobo={setKobo} />
        </Field>
        <Field label="Notes for the rider" hint="Optional">
          <Textarea placeholder="Gate code, landmark…" />
        </Field>
        <Field label="Main staple">
          <Combobox options={FOODS} value={food} onChange={setFood} placeholder="Search foods" />
        </Field>
        <Field label="Foods to avoid">
          <MultiCombobox
            options={FOODS}
            value={avoid}
            onChange={setAvoid}
            placeholder="Add foods"
          />
        </Field>
        <Field label="Start date">
          <DatePicker value={date} onChange={setDate} disabled={{before: new Date()}} />
        </Field>
        <div className="grid gap-3">
          <Label id="delivery-label">Delivery</Label>
          <RadioGroup value={delivery} onValueChange={setDelivery} aria-labelledby="delivery-label">
            {[
              ['door', 'To my door'],
              ['pickup', 'Pick up from the store'],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-3">
                <RadioGroupItem id={`delivery-${value}`} value={value ?? ''} />
                <Label htmlFor={`delivery-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      <FileUpload
        accept="image/png,image/jpeg,image/webp"
        multiple
        maxSize={5 * 1024 * 1024}
        hint="PNG, JPG or WebP, up to 5 MB each"
        files={files}
        onFiles={picked => setFiles(current => [...current, ...picked])}
        onRemove={file => setFiles(current => current.filter(f => f !== file))}
      />
      <Row label="Copyable text">
        <CopyableText value="9023417788" display="902 341 7788" label="account number" />
      </Row>
      <div className="max-w-sm">
        <OrSeparator />
      </div>
    </Section>
  );
}

const NavDemo = createContext<(key: string) => void>(() => undefined);

const DemoLink: BottomNavLink = ({to, className, children, ...rest}) => {
  const go = useContext(NavDemo);
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={event => {
        event.preventDefault();
        go(to.slice(1));
      }}
      {...rest}
    >
      {children}
    </a>
  );
};

export function GrovSection() {
  const [qty, setQty] = useState(4.5);
  const [unit, setUnit] = useState('kg');
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [goal, setGoal] = useState<'save' | 'eat-well'>('save');
  return (
    <Section title="Patterns">
      <Row label="Tags">
        <Tag>Neutral</Tag>
        <Tag tone="success" icon={<Leaf />}>
          In season
        </Tag>
        <Tag tone="info">New</Tag>
        <Tag tone="estimate">Estimate</Tag>
        <Tag tone="changed">Price changed</Tag>
        <Tag tone="danger">Out of stock</Tag>
        <Tag tone="bright-leaf">Saved ₦4,200</Tag>
        <Tag tone="bright-flame">Best value</Tag>
      </Row>
      <Row label="Icon tiles">
        {(['flame', 'sky', 'palm', 'leaf', 'night'] as const).map(tone => (
          <IconTile key={tone} tone={tone} icon={<Wheat />} />
        ))}
      </Row>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-4">
          <Progress value={62} max={100} label="Month used" valueLabel="62%" />
          <Progress value={18} max={30} tone="leaf" label="Days covered" valueLabel="18 of 30" />
          <Progress
            value={3}
            max={4}
            tone="palm"
            variant="ring"
            center="3/4"
            aria-label="Deliveries done"
          />
        </div>
        <div className="grid gap-4">
          <BudgetMeter totalKobo={14_250_000} budgetKobo={15_000_000} />
          <BudgetMeter
            totalKobo={17_100_000}
            budgetKobo={15_000_000}
            onFit={() => undefined}
            onAddBudget={() => undefined}
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <QuantityStepper
          value={qty}
          unit={unit}
          units={['kg', 'derica', 'paint bucket']}
          step={0.5}
          min={0}
          onChange={setQty}
          onUnitChange={setUnit}
          equivalent={(v, u) => (u === 'kg' ? `about ${Math.round(v / 0.4)} derica` : '')}
          itemLabel="Rice"
        />
        <div className="grid content-start gap-3">
          <Segmented
            label="Period"
            options={[
              {value: 'week', label: 'Week'},
              {value: 'month', label: 'Month'},
            ]}
            value={period}
            onChange={setPeriod}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectTile
              title="Save money"
              description="Cheapest plan that still feeds everyone"
              icon={<PiggyBank />}
              tone="leaf"
              selected={goal === 'save'}
              onSelect={() => setGoal('save')}
            />
            <SelectTile
              title="Eat well"
              description="More protein and vegetables"
              icon={<Salad />}
              tone="palm"
              selected={goal === 'eat-well'}
              onSelect={() => setGoal('eat-well')}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2 rounded-lg border border-line bg-surface p-2">
        <PlanLine
          name="Rice, local parboiled"
          quantity="4.5 kg"
          priceKobo={2_100_000}
          wasKobo={2_350_000}
          status="locked"
          tags={[{label: 'Staple', tone: 'neutral'}]}
          reason="Your household eats rice 9 times in this plan."
          tone="flame"
        />
        <PlanLine
          name="Brown beans"
          quantity="2.5 kg"
          priceKobo={840_000}
          status="estimate"
          tone="palm"
        />
        <PlanLine
          name="Palm oil"
          quantity="1 L"
          priceKobo={360_000}
          status="changed"
          statusDetail="was ₦3,200"
          tone="leaf"
        />
      </div>
      <div className="grid gap-3">
        <Banner tone="info" title="Prices refresh every Monday">
          Locked prices hold until you check out.
        </Banner>
        <Banner tone="offline" icon={<WifiOff />} title="You’re offline">
          Changes will save when you reconnect.
        </Banner>
        <Banner
          tone="savings"
          title="You saved ₦12,400 this month"
          actions={
            <Button size="sm" variant="secondary">
              See how
            </Button>
          }
        />
        <Banner tone="error" title="Payment didn’t go through">
          Nothing was charged. Try again or use another card.
        </Banner>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <HeroPanel>
          <p className="text-body-sm text-on-night-muted">Food balance</p>
          <p className="text-title-lg">
            <Money kobo={4_520_000} />
          </p>
        </HeroPanel>
        <HeroPanel tone="flame">
          <p className="text-body-sm">This month’s plan</p>
          <p className="text-title-lg">
            <Money kobo={15_000_000} />
          </p>
        </HeroPanel>
        <Wash className="relative min-h-0 overflow-hidden rounded-xl p-4">
          <GlassCard className="p-4">
            <p className="text-label">Glass card</p>
            <p className="text-body-sm text-ink-muted">Sits on the wash.</p>
          </GlassCard>
        </Wash>
      </div>
    </Section>
  );
}

export function NavigationSection() {
  const [active, setActive] = useState('plan');
  const [page, setPage] = useState(3);
  const [shown, setShown] = useState(3);
  const [loading, setLoading] = useState(false);
  return (
    <Section title="Navigation">
      <Phone>
        <AppBar
          title="Your plan"
          onBack={() => undefined}
          action={
            <Button size="icon-sm" variant="ghost" aria-label="Insights">
              <ChartPie aria-hidden />
            </Button>
          }
        />
        <div className="grid gap-3 p-4">
          <StepIndicator steps={['Household', 'Budget', 'Foods', 'Review']} current={1} />
          <p className="text-body-sm text-ink-muted">
            Action bar sticks to the bottom of the scroll area.
          </p>
        </div>
        <div className="px-4">
          <ActionBar
            amountKobo={14_250_000}
            sub="Delivered in 2 trips"
            action={<Button>Check out</Button>}
          />
        </div>
        <div className="relative h-24">
          <NavDemo.Provider value={setActive}>
            <BottomNav
              className="absolute"
              active={active}
              link={DemoLink}
              items={[
                {key: 'home', label: 'Home', icon: <House />, href: '/home'},
                {key: 'shop', label: 'Shop', icon: <Store />, href: '/shop'},
                {key: 'plan', label: 'Plan', icon: <Sparkles />, href: '/plan', center: true},
                {key: 'orders', label: 'Orders', icon: <ClipboardList />, href: '/orders'},
                {key: 'savings', label: 'Savings', icon: <PiggyBank />, href: '/savings'},
              ]}
            />
          </NavDemo.Provider>
        </div>
      </Phone>
      <Pagination page={page} pageCount={12} onPageChange={setPage} total={234} pageSize={20} />
      <div className="grid gap-2 rounded-lg border border-line bg-surface p-3">
        {Array.from({length: shown}, (_, i) => (
          <p key={i} className="text-body-sm">
            Order GRV-{1040 + i}
          </p>
        ))}
        <LoadMore
          hasMore={shown < 8}
          loading={loading}
          onLoadMore={() => {
            setLoading(true);
            window.setTimeout(() => {
              setShown(n => n + 2);
              setLoading(false);
            }, 600);
          }}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-line bg-surface px-4"
        >
          <AccordionItem value="a">
            <AccordionTrigger>When do prices lock?</AccordionTrigger>
            <AccordionContent>
              When you pay. Until then prices are estimates from this week’s market run.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I change my delivery day?</AccordionTrigger>
            <AccordionContent>Yes, up to 24 hours before the delivery window.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <CollapsibleCard title="Grains" summary={<Money kobo={2_940_000} />}>
          <p className="text-body-sm text-ink-muted">Rice 4.5 kg · Garri 2 kg</p>
        </CollapsibleCard>
      </div>
    </Section>
  );
}

function Phone({children}: {children: ReactNode}) {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-line bg-canvas shadow-raised">
      {children}
    </div>
  );
}

interface OrderRow {
  id: string;
  customer: string;
  items: number;
  totalKobo: number;
  status: 'paid' | 'packing' | 'delivered';
}

const ORDERS: OrderRow[] = [
  {id: 'GRV-1042', customer: 'Adaeze Okafor', items: 14, totalKobo: 14_250_000, status: 'paid'},
  {id: 'GRV-1041', customer: 'Tunde Bakare', items: 9, totalKobo: 8_730_000, status: 'packing'},
  {id: 'GRV-1040', customer: 'Halima Yusuf', items: 21, totalKobo: 22_100_000, status: 'delivered'},
  {id: 'GRV-1039', customer: 'Chinedu Eze', items: 6, totalKobo: 4_980_000, status: 'paid'},
];

const STATUS_TONE = {paid: 'info', packing: 'changed', delivered: 'success'} as const;

const COLUMNS: ColumnDef<OrderRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Order',
    cell: ({getValue}) => <span className="font-semibold">{String(getValue())}</span>,
  },
  {accessorKey: 'customer', header: 'Customer'},
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({getValue}) => <span className="tabular">{Number(getValue())}</span>,
  },
  {
    accessorKey: 'totalKobo',
    header: 'Total',
    cell: ({getValue}) => <Money kobo={Number(getValue())} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({row}) => <Tag tone={STATUS_TONE[row.original.status]}>{row.original.status}</Tag>,
  },
];

export function RichDataDemos() {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState(false);
  const rows = ORDERS.filter(o =>
    `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase())
  );
  const selected = Object.keys(selection).length;
  return (
    <>
      <DataTable
        caption="Recent orders"
        columns={COLUMNS}
        data={rows}
        getRowId={row => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        onRowClick={row => setSelection(s => ({...s, [row.id]: !s[row.id]}))}
        search={{value: query, onChange: setQuery, placeholder: 'Search orders'}}
        toolbar={
          <Button size="sm" variant="secondary" disabled={!selected}>
            Mark packed{selected ? ` (${selected})` : ''}
          </Button>
        }
        footer={
          <Pagination
            page={1}
            pageCount={1}
            onPageChange={() => undefined}
            total={rows.length}
            pageSize={20}
          />
        }
      />
      <DataTable caption="Loading" columns={COLUMNS} data={[]} getRowId={row => row.id} loading />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Markdown>
            {
              '### Jollof rice for 6\n\n1. Blend **tomatoes, peppers and onions**.\n2. Fry the base in *palm or groundnut oil* until it darkens.\n\n- 4 cups rice\n- 2 seasoning cubes\n\nRaw HTML is dropped:\n\n<script>alert(1)</script>\n\n [Read more](https://example.com)'
            }
          </Markdown>
        </div>
        <div className="grid content-start gap-3">
          <Row label="Dialogs">
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Delete role
            </Button>
            <Button variant="secondary" onClick={() => setStatus(true)}>
              Payment result
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="grid w-64 gap-2">
                <p className="text-label">Why this price?</p>
                <p className="text-body-sm text-ink-muted">
                  Average of three Mile 12 traders on Monday.
                </p>
              </PopoverContent>
            </Popover>
          </Row>
          <ConfirmDialog
            open={confirm}
            onOpenChange={setConfirm}
            tone="danger"
            title="Delete the Packer role?"
            description="3 staff have this role. They lose its permissions straight away."
            confirmLabel="Delete role"
            loading={deleting}
            onConfirm={() => {
              setDeleting(true);
              window.setTimeout(() => {
                setDeleting(false);
                setConfirm(false);
              }, 800);
            }}
          />
          <StatusDialog
            open={status}
            onOpenChange={setStatus}
            status="success"
            title="Payment confirmed"
            description={
              <>
                <Money kobo={14_250_000} /> paid. Your first delivery is on Saturday.
              </>
            }
            actionLabel="See my order"
          />
          <p className="flex items-center gap-2 text-body-sm text-ink-muted">
            <ShoppingBasket aria-hidden className="size-4" /> Confirm actions that cost money or
            can’t be undone.
          </p>
        </div>
      </div>
    </>
  );
}
