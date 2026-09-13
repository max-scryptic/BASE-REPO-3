"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Component,
  ExternalLink,
  Layers3,
  Palette,
  PanelLeft,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
} from "lucide-react";
import { Accordion } from "@base-ui/react/accordion";
import { Button as BaseButton } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { Popover } from "@base-ui/react/popover";
import { Progress } from "@base-ui/react/progress";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Select } from "@base-ui/react/select";
import { Slider } from "@base-ui/react/slider";
import { Switch } from "@base-ui/react/switch";
import { Tabs } from "@base-ui/react/tabs";
import { Tooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

const componentGroups = [
  {
    label: "Structure",
    items: [
      "Accordion",
      "Collapsible",
      "Dialog",
      "Drawer",
      "Popover",
      "Preview Card",
      "Scroll Area",
      "Separator",
      "Tabs",
      "Tooltip",
    ],
  },
  {
    label: "Input",
    items: [
      "Autocomplete",
      "Button",
      "Checkbox",
      "Checkbox Group",
      "Combobox",
      "Field",
      "Fieldset",
      "Form",
      "Input",
      "Number Field",
      "OTP Field",
      "Radio",
      "Radio Group",
      "Select",
      "Slider",
      "Switch",
      "Toggle",
      "Toggle Group",
    ],
  },
  {
    label: "Navigation",
    items: ["Context Menu", "Menu", "Menubar", "Navigation Menu", "Toolbar"],
  },
  {
    label: "Feedback",
    items: ["Alert Dialog", "Avatar", "Meter", "Progress", "Toast"],
  },
];

const setupSteps = [
  {
    title: "Lock the foundation",
    body: "Keep Base UI as the primitive layer, define one local wrapper path, and avoid adding more generated shadcn components while the migration is active.",
    status: "Started",
  },
  {
    title: "Define design tokens",
    body: "Promote radius, color, density, motion, focus, and elevation tokens from globals into named component decisions.",
    status: "Next",
  },
  {
    title: "Build wrapper components",
    body: "Create app-owned Button, Field, Select, Dialog, Menu, Tabs, and Toast components that compose Base UI parts and hide primitive details.",
    status: "Next",
  },
  {
    title: "Migrate existing consumers",
    body: "Replace Radix and shadcn-style imports route by route, keeping behavior tests around forms, overlays, and keyboard navigation.",
    status: "Planned",
  },
  {
    title: "Document recipes",
    body: "Add examples for forms, tables, settings pages, command menus, empty states, and async feedback using the local component set.",
    status: "Planned",
  },
];

const packageFacts = [
  ["Primitive package", "@base-ui/react"],
  ["Installed version", "^1.8.0"],
  ["Styling strategy", "Tailwind v4 classes on local wrappers"],
  ["Portal setup", "Root isolation plus relative body"],
  ["Current overlap", "Existing shadcn-style components remain available"],
];

const densityOptions = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Balanced", value: "balanced" },
  { label: "Compact", value: "compact" },
];

const focusOptions = [
  { label: "Visible", value: "visible" },
  { label: "Strong", value: "strong" },
  { label: "System", value: "system" },
];

function baseButtonClassName(variant: "solid" | "outline" | "soft" = "solid") {
  return cn(
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50",
    variant === "solid" &&
      "bg-foreground text-background hover:bg-foreground/90 data-pressed:bg-foreground/80",
    variant === "outline" &&
      "border border-border bg-background text-foreground hover:bg-muted data-pressed:bg-muted",
    variant === "soft" &&
      "bg-teal-50 text-teal-950 hover:bg-teal-100 data-pressed:bg-teal-200"
  );
}

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/30";

const popupClassName =
  "z-50 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0";

export function BaseUiDashboard() {
  const [progress, setProgress] = React.useState(62);

  return (
    <Tooltip.Provider>
      <main className="min-h-dvh bg-[#f7f7f3] text-foreground">
        <section className="border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex w-fit items-center gap-2 rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="size-3.5 text-teal-700" />
                  Base UI migration workspace
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
                    Component system configuration
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                    A working Base UI dashboard for choosing the primitive
                    layer, mapping the component inventory, and sequencing the
                    shift away from generated shadcn-style components.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <BaseButton className={baseButtonClassName("soft")}>
                  <Sparkles className="size-4" />
                  Base primitive
                </BaseButton>

                <Dialog.Root>
                  <Dialog.Trigger className={baseButtonClassName("solid")}>
                    <Code2 className="size-4" />
                    Migration notes
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black/30 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
                    <Dialog.Popup className="fixed left-1/2 top-1/2 flex w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-lg border border-border bg-background p-5 shadow-xl transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                      <div className="space-y-2">
                        <Dialog.Title className="text-lg font-semibold">
                          Base UI migration notes
                        </Dialog.Title>
                        <Dialog.Description className="text-sm leading-6 text-muted-foreground">
                          Base UI is unstyled and accessible by default. The app
                          should own styling, tokens, wrappers, and examples.
                        </Dialog.Description>
                      </div>
                      <div className="grid gap-2 text-sm">
                        {setupSteps.slice(0, 3).map((step) => (
                          <div
                            key={step.title}
                            className="grid grid-cols-[1rem_1fr] gap-3 rounded-md bg-muted/60 p-3"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 text-teal-700" />
                            <div>
                              <p className="font-medium">{step.title}</p>
                              <p className="leading-5 text-muted-foreground">
                                {step.body}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Dialog.Close className={baseButtonClassName("outline")}>
                          Close
                        </Dialog.Close>
                      </div>
                    </Dialog.Popup>
                  </Dialog.Portal>
                </Dialog.Root>

                <Menu.Root>
                  <Menu.Trigger className={baseButtonClassName("outline")}>
                    <PanelLeft className="size-4" />
                    Components
                    <ChevronDown className="size-4" />
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner sideOffset={8}>
                      <Menu.Popup className={cn(popupClassName, "w-56")}>
                        {componentGroups.map((group) => (
                          <Menu.Group key={group.label}>
                            <Menu.GroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              {group.label}
                            </Menu.GroupLabel>
                            {group.items.slice(0, 4).map((item) => (
                              <Menu.Item
                                key={item}
                                className="rounded-sm px-2 py-1.5 text-sm outline-none data-highlighted:bg-muted"
                              >
                                {item}
                              </Menu.Item>
                            ))}
                          </Menu.Group>
                        ))}
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {packageFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-muted/40 p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Live primitives</h2>
                  <p className="text-sm text-muted-foreground">
                    Base UI parts composed with local tokens and Tailwind v4.
                  </p>
                </div>
                <Popover.Root>
                  <Popover.Trigger className={baseButtonClassName("soft")}>
                    <Palette className="size-4" />
                    Token notes
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner sideOffset={8}>
                      <Popover.Popup
                        className={cn(popupClassName, "max-w-80 space-y-2 p-4")}
                      >
                        <Popover.Arrow className="relative block h-2 w-4 overflow-clip before:absolute before:left-1/2 before:top-1 before:size-3 before:-translate-x-1/2 before:rotate-45 before:border before:border-border before:bg-popover" />
                        <Popover.Title className="text-sm font-semibold">
                          Token layer
                        </Popover.Title>
                        <Popover.Description className="text-sm leading-6 text-muted-foreground">
                          Keep Base UI unstyled, then encode the app opinion in
                          local wrappers and shared CSS variables.
                        </Popover.Description>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </div>

              <Tabs.Root defaultValue="controls">
                <Tabs.List className="relative mb-4 flex w-fit gap-1 rounded-md bg-muted p-1">
                  {["controls", "overlays", "layout"].map((value) => (
                    <Tabs.Tab
                      key={value}
                      value={value}
                      className="relative z-10 h-8 rounded-sm px-3 text-sm font-medium capitalize text-muted-foreground outline-none data-active:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      {value}
                    </Tabs.Tab>
                  ))}
                  <Tabs.Indicator className="absolute left-0 top-1 h-8 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-sm bg-background shadow-sm transition-[translate,width]" />
                </Tabs.List>

                <Tabs.Panel value="controls" className="outline-none [[hidden]]:hidden">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold">
                            Form controls
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Inputs, state, and primitive composition.
                          </p>
                        </div>
                        <Tooltip.Root>
                          <Tooltip.Trigger className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background">
                            <SlidersHorizontal className="size-4" />
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={8}>
                              <Tooltip.Popup className={cn(popupClassName, "px-3 py-2 text-xs")}>
                                Base UI controls expose state via data attributes.
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium">Token sync</span>
                          <Switch.Root
                            defaultChecked
                            className="flex h-6 w-11 shrink-0 rounded-full border border-border bg-muted p-0.5 transition-colors data-checked:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                          >
                            <Switch.Thumb className="size-4.5 rounded-full bg-background shadow-sm transition-transform data-checked:translate-x-5" />
                          </Switch.Root>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox.Root
                            defaultChecked
                            className="flex size-5 shrink-0 items-center justify-center rounded border border-border bg-background text-background data-checked:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                          >
                            <Checkbox.Indicator className="flex data-unchecked:hidden">
                              <Check className="size-3.5" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          Accessible focus rings
                        </label>

                        <Select.Root items={densityOptions} defaultValue="balanced">
                          <Select.Label className="text-sm font-medium">
                            Density
                          </Select.Label>
                          <Select.Trigger className={cn(inputClassName, "mt-1 flex w-full items-center justify-between")}>
                            <Select.Value placeholder="Choose density" />
                            <Select.Icon>
                              <ChevronDown className="size-4" />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Positioner sideOffset={6}>
                              <Select.Popup className={cn(popupClassName, "min-w-(--anchor-width)")}>
                                <Select.List>
                                  {densityOptions.map((option) => (
                                    <Select.Item
                                      key={option.value}
                                      value={option.value}
                                      className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-highlighted:bg-muted"
                                    >
                                      <Select.ItemIndicator>
                                        <Check className="size-3.5" />
                                      </Select.ItemIndicator>
                                      <Select.ItemText>{option.label}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                                </Select.List>
                              </Select.Popup>
                            </Select.Positioner>
                          </Select.Portal>
                        </Select.Root>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <h3 className="text-sm font-semibold">Interaction scale</h3>
                      <p className="mb-5 text-sm text-muted-foreground">
                        Sliders, radios, and progress use the same state hooks.
                      </p>

                      <RadioGroup
                        defaultValue="visible"
                        className="mb-5 grid gap-2"
                      >
                        {focusOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Radio.Root
                              value={option.value}
                              className="flex size-5 items-center justify-center rounded-full border border-border bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                            >
                              <Radio.Indicator className="size-2.5 rounded-full bg-teal-700 data-unchecked:hidden" />
                            </Radio.Root>
                            {option.label} focus
                          </label>
                        ))}
                      </RadioGroup>

                      <Slider.Root
                        value={progress}
                        onValueChange={(value) => setProgress(value)}
                      >
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <Slider.Label className="font-medium">
                            Adoption target
                          </Slider.Label>
                          <span className="text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                        <Slider.Control className="flex w-full touch-none items-center py-3">
                          <Slider.Track className="h-2 w-full rounded-full bg-muted">
                            <Slider.Indicator className="rounded-full bg-teal-700" />
                            <Slider.Thumb
                              aria-label="Adoption target"
                              className="size-5 rounded-full border border-teal-900 bg-background shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground"
                            />
                          </Slider.Track>
                        </Slider.Control>
                      </Slider.Root>

                      <Progress.Root
                        value={progress}
                        className="mt-5 grid grid-cols-2 gap-y-2"
                      >
                        <Progress.Label className="text-sm font-medium">
                          Base UI coverage
                        </Progress.Label>
                        <Progress.Value className="text-right text-sm text-muted-foreground" />
                        <Progress.Track className="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
                          <Progress.Indicator className="bg-teal-700 transition-[width]" />
                        </Progress.Track>
                      </Progress.Root>
                    </div>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="overlays" className="outline-none [[hidden]]:hidden">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ["Dialog", "Modal flows and confirmation states"],
                      ["Popover", "Inline configuration and metadata"],
                      ["Menu", "Commands, actions, and navigation"],
                    ].map(([title, body]) => (
                      <div
                        key={title}
                        className="rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="layout" className="outline-none [[hidden]]:hidden">
                  <Accordion.Root
                    defaultValue={["tokens"]}
                    className="divide-y divide-border rounded-lg border border-border"
                  >
                    {[
                      [
                        "tokens",
                        "Token contract",
                        "Map Tailwind variables to component decisions before building more wrappers.",
                      ],
                      [
                        "wrappers",
                        "Wrapper API",
                        "Expose simple app props, compose Base UI render props internally, and keep primitive imports out of feature code.",
                      ],
                      [
                        "tests",
                        "Verification",
                        "Cover keyboard behavior, form submission, focus trapping, and portaled overlays.",
                      ],
                    ].map(([value, title, body]) => (
                      <Accordion.Item key={value} value={value}>
                        <Accordion.Header>
                          <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground">
                            {title}
                            <ChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel className="px-4 pb-4 text-sm leading-6 text-muted-foreground">
                          {body}
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </Tabs.Panel>
              </Tabs.Root>
            </section>

            <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-3">
                <SquareStack className="size-5 text-teal-700" />
                <div>
                  <h2 className="text-lg font-semibold">Component inventory</h2>
                  <p className="text-sm text-muted-foreground">
                    Base UI primitives to wrap for a full app component set.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {componentGroups.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{group.label}</h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {group.items.length} primitives
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <Layers3 className="size-5 text-teal-700" />
                <div>
                  <h2 className="text-lg font-semibold">Setup plan</h2>
                  <p className="text-sm text-muted-foreground">
                    The path to a full component library.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {setupSteps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {step.status}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <Component className="size-5 text-teal-700" />
                <div>
                  <h2 className="text-lg font-semibold">Architecture</h2>
                  <p className="text-sm text-muted-foreground">
                    Recommended ownership model.
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  Base UI should stay as the unstyled accessibility layer.
                  Feature code should import app-owned components from a single
                  local namespace.
                </p>
                <p>
                  Existing `src/components/ui` files can be migrated
                  incrementally, starting with Button, Field, Dialog, Menu, and
                  Select.
                </p>
              </div>
              <a
                href="https://base-ui.com/react/overview/quick-start"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-800 underline-offset-4 hover:underline"
              >
                Base UI quick start
                <ExternalLink className="size-3.5" />
              </a>
            </section>
          </aside>
        </section>
      </main>
    </Tooltip.Provider>
  );
}
