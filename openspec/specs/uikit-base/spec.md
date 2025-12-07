# UI Kit Base Components

## Purpose

Provides a collection of base UI components for the @hai3/uikit package, including data visualization with charts built on Recharts library.
## Requirements
### Requirement: Chart Component

The system SHALL provide a Chart component in the `@hai3/uikit` package for data visualization, built on Recharts library.

#### Scenario: Chart component is available

- **WHEN** importing Chart from `@hai3/uikit`
- **THEN** the Chart component and its sub-components are available
- **AND** components include: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent

#### Scenario: Line chart rendering

- **WHEN** using Chart with LineChart and Line components from Recharts
- **THEN** a line chart is rendered with customizable colors and data points
- **AND** the chart is responsive and adapts to container width

#### Scenario: Bar chart rendering

- **WHEN** using Chart with BarChart and Bar components from Recharts
- **THEN** a bar chart is rendered with customizable colors and data
- **AND** the chart supports multiple bars per data point

#### Scenario: Area chart rendering

- **WHEN** using Chart with AreaChart and Area components from Recharts
- **THEN** an area chart is rendered with gradient fills
- **AND** the chart displays smooth curves

#### Scenario: Pie chart rendering

- **WHEN** using Chart with PieChart and Pie components from Recharts
- **THEN** a pie chart is rendered with color-coded segments
- **AND** the chart displays labels and percentages

### Requirement: Chart Demo Examples

The system SHALL provide Chart examples in the Data Display Elements section of the UI Kit demo.

#### Scenario: Chart section in DataDisplayElements

- **WHEN** viewing the Data Display category
- **THEN** a Chart section is displayed with heading and examples
- **AND** the section includes data-element-id="element-chart" for navigation

#### Scenario: Chart examples use translations

- **WHEN** Chart examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component
- **AND** no translation keys are displayed (values are shown)

#### Scenario: Multiple chart type examples

- **WHEN** viewing the Chart section
- **THEN** at least 4 chart type examples are shown: Line, Bar, Area, and Pie
- **AND** each example has a descriptive label
- **AND** each chart displays sample data appropriately

### Requirement: Chart in Category System

The system SHALL include Chart as an implemented element in the Data Display category.

#### Scenario: Chart in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Chart' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Chart appears in the Data Display category navigation menu

#### Scenario: Chart element ordering

- **WHEN** viewing the Data Display category
- **THEN** Chart is positioned appropriately among other data display elements
- **AND** the navigation menu reflects the correct order

### Requirement: Chart Translations

The system SHALL provide Chart translations across all supported languages (36 languages).

#### Scenario: Chart translation keys

- **WHEN** Chart component is used in the demo
- **THEN** translation keys exist for all Chart elements
- **AND** keys include: chart_heading, chart_line_label, chart_bar_label, chart_area_label, chart_pie_label

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Chart translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Drawer Component

The system SHALL provide a Drawer component in the `@hai3/uikit` package for mobile-friendly overlay panels, built on the vaul library.

#### Scenario: Drawer component is available

- **WHEN** importing Drawer from `@hai3/uikit`
- **THEN** the Drawer component and its sub-components are available
- **AND** components include: Drawer, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription

#### Scenario: Drawer supports multiple directions

- **WHEN** using DrawerContent with direction prop
- **THEN** the drawer can slide from bottom, top, left, or right
- **AND** each direction has appropriate styling and animations

#### Scenario: Drawer has touch gesture support

- **WHEN** using Drawer on touch devices
- **THEN** the drawer supports drag-to-dismiss gestures
- **AND** the drawer shows a visual drag handle for bottom direction

#### Scenario: Drawer styling follows theme

- **WHEN** rendering Drawer components
- **THEN** the overlay uses theme-aware background opacity
- **AND** the content uses bg-background, border-border, and text-foreground tokens
- **AND** all animations are smooth (animate-in/animate-out)

### Requirement: Drawer Demo Examples

The system SHALL provide Drawer examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Drawer section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Drawer section is displayed with heading and examples
- **AND** the section includes data-element-id="element-drawer" for navigation

#### Scenario: Drawer section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Drawer section appears after Dialog and before Sheet
- **AND** the order matches the category elements order: Card, Dialog, Drawer, Sheet

#### Scenario: Drawer examples use translations

- **WHEN** Drawer examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple drawer direction examples

- **WHEN** viewing the Drawer section
- **THEN** at least one example demonstrating drawer functionality is shown
- **AND** the example includes a trigger button and content with header/footer

### Requirement: Drawer in Category System

The system SHALL include Drawer as an implemented element in the Layout & Structure category.

#### Scenario: Drawer in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Drawer' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Drawer appears in the Layout & Structure category navigation menu

### Requirement: Drawer Translations

The system SHALL provide Drawer translations across all supported languages (36 languages).

#### Scenario: Drawer translation keys

- **WHEN** Drawer component is used in the demo
- **THEN** translation keys exist for all Drawer elements
- **AND** keys include: drawer_heading, drawer_open, drawer_title, drawer_description, drawer_close

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Drawer translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Aspect Ratio Component

The system SHALL provide an AspectRatio component in the `@hai3/uikit` package for maintaining consistent width-to-height ratios, built on @radix-ui/react-aspect-ratio.

#### Scenario: AspectRatio component is available

- **WHEN** importing AspectRatio from `@hai3/uikit`
- **THEN** the AspectRatio component is available for use

#### Scenario: AspectRatio accepts ratio prop

- **WHEN** using AspectRatio with a ratio prop (e.g., 16/9, 4/3, 1)
- **THEN** the container maintains the specified aspect ratio
- **AND** child content fills the container proportionally

#### Scenario: AspectRatio with images

- **WHEN** placing an image inside AspectRatio
- **THEN** the image is constrained to the specified ratio
- **AND** the image can use object-fit for positioning

### Requirement: Aspect Ratio Demo Examples

The system SHALL provide AspectRatio examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: AspectRatio section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** an Aspect Ratio section is displayed with heading and examples
- **AND** the section includes data-element-id="element-aspect-ratio" for navigation

#### Scenario: AspectRatio section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Aspect Ratio section appears first (before Card)
- **AND** the order matches the category elements order

#### Scenario: AspectRatio examples use translations

- **WHEN** AspectRatio examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple aspect ratio examples

- **WHEN** viewing the Aspect Ratio section
- **THEN** examples demonstrate common ratios (16:9, 1:1)
- **AND** each example shows visual content within the ratio container

### Requirement: Aspect Ratio in Category System

The system SHALL include Aspect Ratio as an implemented element in the Layout & Structure category.

#### Scenario: Aspect Ratio in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Aspect Ratio' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Aspect Ratio appears in the Layout & Structure category navigation menu

### Requirement: Aspect Ratio Translations

The system SHALL provide Aspect Ratio translations across all supported languages (36 languages).

#### Scenario: Aspect Ratio translation keys

- **WHEN** AspectRatio component is used in the demo
- **THEN** translation keys exist for all AspectRatio elements
- **AND** keys include: aspect_ratio_heading, aspect_ratio_16_9_label, aspect_ratio_1_1_label

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Aspect Ratio translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Resizable Component

The system SHALL provide a Resizable component in the `@hai3/uikit` package for creating resizable panel layouts, built on react-resizable-panels library.

#### Scenario: Resizable component is available

- **WHEN** importing Resizable from `@hai3/uikit`
- **THEN** the Resizable component and its sub-components are available
- **AND** components include: ResizablePanelGroup, ResizablePanel, ResizableHandle

#### Scenario: Horizontal resizable layout

- **WHEN** using ResizablePanelGroup with direction="horizontal"
- **THEN** panels are arranged horizontally
- **AND** ResizableHandle allows resizing panels by dragging

#### Scenario: Vertical resizable layout

- **WHEN** using ResizablePanelGroup with direction="vertical"
- **THEN** panels are arranged vertically
- **AND** ResizableHandle allows resizing panels by dragging

#### Scenario: ResizableHandle with visible grip

- **WHEN** using ResizableHandle with withHandle prop set to true
- **THEN** a visible grip icon is displayed on the handle
- **AND** the grip rotates 90 degrees for vertical layouts

#### Scenario: Resizable styling follows theme

- **WHEN** rendering Resizable components
- **THEN** the handle uses bg-border for the divider line
- **AND** the grip uses bg-border and border-border tokens
- **AND** focus states use ring-ring for accessibility

### Requirement: Resizable Demo Examples

The system SHALL provide Resizable examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Resizable section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Resizable section is displayed with heading and examples
- **AND** the section includes data-element-id="element-resizable" for navigation

#### Scenario: Resizable section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Resizable section appears after Drawer and before Sheet
- **AND** the order matches the category elements order

#### Scenario: Resizable examples use translations

- **WHEN** Resizable examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple resizable examples

- **WHEN** viewing the Resizable section
- **THEN** three examples are shown: horizontal with grip handle, vertical without handle, and nested layout
- **AND** nested layout demonstrates horizontal panel containing vertical panels

### Requirement: Resizable in Category System

The system SHALL include Resizable as an implemented element in the Layout & Structure category.

#### Scenario: Resizable in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Resizable' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Resizable appears in the Layout & Structure category navigation menu

### Requirement: Resizable Translations

The system SHALL provide Resizable translations across all supported languages (36 languages).

#### Scenario: Resizable translation keys

- **WHEN** Resizable component is used in the demo
- **THEN** translation keys exist for all Resizable elements
- **AND** keys include: resizable_heading, resizable_horizontal_label, resizable_vertical_label, resizable_nested_label, resizable_panel_one, resizable_panel_two, resizable_panel_three

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Resizable translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Scroll Area Component

The system SHALL provide a Scroll Area component in the `@hai3/uikit` package for creating custom scrollable containers with styled scrollbars, built on @radix-ui/react-scroll-area.

#### Scenario: Scroll Area component is available

- **WHEN** importing ScrollArea from `@hai3/uikit`
- **THEN** the ScrollArea and ScrollBar components are available
- **AND** ScrollArea provides a custom scrollable viewport
- **AND** ScrollBar provides styled scrollbar with configurable orientation

#### Scenario: Vertical scroll support

- **WHEN** using ScrollArea with content taller than the container
- **THEN** a vertical scrollbar appears automatically
- **AND** the scrollbar uses theme-aware styling with bg-border token

#### Scenario: Horizontal scroll support

- **WHEN** using ScrollArea with ScrollBar orientation="horizontal"
- **THEN** a horizontal scrollbar appears for wide content
- **AND** the scrollbar is styled consistently with vertical scrollbars

#### Scenario: Scroll Area styling follows theme

- **WHEN** rendering ScrollArea components
- **THEN** the scrollbar thumb uses bg-border token
- **AND** the viewport supports focus-visible ring styling
- **AND** all animations are smooth transitions

### Requirement: Scroll Area Demo Examples

The system SHALL provide Scroll Area examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Scroll Area section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Scroll Area section is displayed with heading and examples
- **AND** the section includes data-element-id="element-scroll-area" for navigation

#### Scenario: Scroll Area examples use translations

- **WHEN** Scroll Area examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple scroll area examples

- **WHEN** viewing the Scroll Area section
- **THEN** two examples are shown: vertical scroll and horizontal scroll
- **AND** vertical example shows a list of items in a bounded height container
- **AND** horizontal example shows horizontally scrolling content with images

### Requirement: Scroll Area in Category System

The system SHALL include Scroll Area as an implemented element in the Layout & Structure category.

#### Scenario: Scroll Area in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Scroll Area' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Scroll Area appears in the Layout & Structure category navigation menu

### Requirement: Scroll Area Translations

The system SHALL provide Scroll Area translations across all supported languages (36 languages).

#### Scenario: Scroll Area translation keys

- **WHEN** Scroll Area component is used in the demo
- **THEN** translation keys exist for all Scroll Area elements
- **AND** keys include: scroll_area_heading, scroll_area_vertical_label, scroll_area_horizontal_label, scroll_area_tags_title, scroll_area_photo_by

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Scroll Area translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Separator Component

The system SHALL provide a Separator component in the `@hai3/uikit` package for visually dividing content sections, built on @radix-ui/react-separator.

#### Scenario: Separator component is available

- **WHEN** importing Separator from `@hai3/uikit`
- **THEN** the Separator component is available
- **AND** it supports horizontal and vertical orientations

#### Scenario: Horizontal separator

- **WHEN** using Separator with default or orientation="horizontal"
- **THEN** a horizontal line is rendered spanning the full width
- **AND** the line uses bg-border token for consistent theming

#### Scenario: Vertical separator

- **WHEN** using Separator with orientation="vertical"
- **THEN** a vertical line is rendered spanning the full height
- **AND** the component uses h-full and w-px styling

#### Scenario: Separator accessibility

- **WHEN** rendering Separator with decorative=true (default)
- **THEN** the separator is marked as decorative for screen readers
- **AND** when decorative=false, it has proper semantic role

### Requirement: Separator Demo Examples

The system SHALL provide Separator examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Separator section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Separator section is displayed with heading and examples
- **AND** the section includes data-element-id="element-separator" for navigation

#### Scenario: Separator examples use translations

- **WHEN** Separator examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Separator example content

- **WHEN** viewing the Separator section
- **THEN** the example shows both horizontal and vertical separators
- **AND** horizontal separator divides content blocks
- **AND** vertical separators divide inline items

### Requirement: Separator in Category System

The system SHALL include Separator as an implemented element in the Layout & Structure category.

#### Scenario: Separator in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Separator' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Separator appears in the Layout & Structure category navigation menu

### Requirement: Separator Translations

The system SHALL provide Separator translations across all supported languages (36 languages).

#### Scenario: Separator translation keys

- **WHEN** Separator component is used in the demo
- **THEN** translation keys exist for all Separator elements
- **AND** keys include: separator_heading, separator_title, separator_description, separator_blog, separator_docs, separator_source

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Separator translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Breadcrumb Component
The UI kit SHALL provide Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, and BreadcrumbEllipsis components for building accessible navigation breadcrumbs with customizable separators, aria labels, and slot support for custom link components.

#### Scenario: Basic Breadcrumb Navigation
Given a user viewing a deeply nested page
When the breadcrumb component is rendered
Then the breadcrumb displays the navigation hierarchy with proper ARIA attributes

### Requirement: Breadcrumb Demo Examples
The UI kit demo SHALL provide examples for the Breadcrumb component in the Navigation category including:
- Default breadcrumb with custom separator (slash instead of chevron)
- Dropdown breadcrumb showing collapsed items in a dropdown menu

All examples SHALL use the `tk()` helper for translations.

#### Scenario: Demo Examples Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Breadcrumb examples are rendered
Then two distinct breadcrumb variations are displayed with appropriate labels

### Requirement: Breadcrumb in Category System
The UI kit element registry SHALL include 'Breadcrumb' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Breadcrumb
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Breadcrumb' appears as an implemented element

### Requirement: Breadcrumb Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `breadcrumb_heading` - Section heading
- `breadcrumb_custom_separator_label` - Custom separator example label
- `breadcrumb_dropdown_label` - Dropdown example label
- `breadcrumb_home` - Home link text
- `breadcrumb_components` - Components link text
- `breadcrumb_breadcrumb` - Breadcrumb page text
- `breadcrumb_documentation` - Documentation link text
- `breadcrumb_themes` - Themes link text
- `breadcrumb_github` - GitHub link text

#### Scenario: Translated Breadcrumb Labels
Given a user viewing the breadcrumb demo in a non-English language
When translations are loaded
Then all breadcrumb labels display in the selected language

### Requirement: Pagination Component
The UI kit SHALL provide Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, and PaginationEllipsis components for building accessible pagination controls with page links, navigation arrows, and ellipsis for truncated page ranges.

#### Scenario: Basic Pagination Navigation
Given a user viewing paginated content
When the pagination component is rendered
Then the pagination displays previous/next controls and page number links with proper ARIA labels

### Requirement: Pagination Demo Example
The UI kit demo SHALL provide an example for the Pagination component in the Navigation category demonstrating previous/next navigation, numbered page links with active state, and ellipsis for truncated ranges, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Pagination example is rendered
Then a functional pagination with numbered pages and navigation controls is displayed

### Requirement: Pagination in Category System
The UI kit element registry SHALL include 'Pagination' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Pagination
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Pagination' appears as an implemented element

### Requirement: Pagination Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `pagination_heading` - Section heading
- `pagination_previous` - Previous button label
- `pagination_next` - Next button label

#### Scenario: Translated Pagination Labels
Given a user viewing the pagination demo in a non-English language
When translations are loaded
Then all pagination labels display in the selected language

### Requirement: Navigation Menu Demo Example
The UI kit demo SHALL provide an example for the Navigation Menu component in the Navigation category demonstrating a horizontal navigation bar with dropdown menus containing links and descriptions, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Navigation Menu example is rendered
Then a functional navigation menu with expandable dropdown sections is displayed

### Requirement: Navigation Menu in Category System
The UI kit element registry SHALL include 'Navigation Menu' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Navigation Menu
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Navigation Menu' appears as an implemented element

### Requirement: Navigation Menu Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `navigation_menu_heading` - Section heading
- `navigation_menu_getting_started` - Getting Started menu trigger
- `navigation_menu_components` - Components menu trigger
- `navigation_menu_documentation` - Documentation link
- `navigation_menu_hai3_desc` - HAI3 description
- `navigation_menu_introduction` - Introduction link title
- `navigation_menu_introduction_desc` - Introduction link description
- `navigation_menu_installation` - Installation link title
- `navigation_menu_installation_desc` - Installation link description
- `navigation_menu_typography` - Typography link title
- `navigation_menu_typography_desc` - Typography link description
- `navigation_menu_alert_dialog` - Alert Dialog link title
- `navigation_menu_alert_dialog_desc` - Alert Dialog link description
- `navigation_menu_hover_card` - Hover Card link title
- `navigation_menu_hover_card_desc` - Hover Card link description
- `navigation_menu_progress` - Progress link title
- `navigation_menu_progress_desc` - Progress link description
- `navigation_menu_scroll_area` - Scroll Area link title
- `navigation_menu_scroll_area_desc` - Scroll Area link description

#### Scenario: Translated Navigation Menu Labels
Given a user viewing the navigation menu demo in a non-English language
When translations are loaded
Then all navigation menu labels display in the selected language

### Requirement: Menubar Component
The UI kit SHALL provide Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarShortcut, MenubarGroup, and MenubarPortal components for building desktop-style menu bar interfaces with support for submenus, checkbox items, radio groups, and keyboard navigation.

#### Scenario: Desktop Menu Interface
Given a user viewing an application with a menubar
When the menubar component is rendered
Then the menubar displays menu triggers with accessible dropdown menus and keyboard navigation

### Requirement: Menubar Demo Example
The UI kit demo SHALL provide an example for the Menubar component in the Navigation category demonstrating a complete menu bar with File, Edit, and View menus including submenus, checkboxes, radio items, and keyboard shortcuts using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Menubar example is rendered
Then a functional menu bar with multiple menus and interactive items is displayed

### Requirement: Menubar in Category System
The UI kit element registry SHALL include 'Menubar' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Menubar
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Menubar' appears as an implemented element

### Requirement: Menubar Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `menubar_heading` - Section heading
- `menubar_file` - File menu
- `menubar_edit` - Edit menu
- `menubar_view` - View menu
- `menubar_profiles` - Profiles menu
- `menubar_new_tab` - New Tab item
- `menubar_new_window` - New Window item
- `menubar_new_incognito` - New Incognito Window item (disabled)
- `menubar_share` - Share submenu
- `menubar_email` - Email item
- `menubar_messages` - Messages item
- `menubar_notes` - Notes item
- `menubar_print` - Print item
- `menubar_undo` - Undo item
- `menubar_redo` - Redo item
- `menubar_find` - Find submenu
- `menubar_search_web` - Search the web item
- `menubar_find_file` - Find... item
- `menubar_find_next` - Find Next item
- `menubar_find_previous` - Find Previous item
- `menubar_cut` - Cut item
- `menubar_copy` - Copy item
- `menubar_paste` - Paste item
- `menubar_always_show_bookmarks` - Always Show Bookmarks Bar checkbox
- `menubar_always_show_full_urls` - Always Show Full URLs checkbox
- `menubar_reload` - Reload item
- `menubar_force_reload` - Force Reload item (disabled)
- `menubar_toggle_fullscreen` - Toggle Fullscreen item
- `menubar_hide_sidebar` - Hide Sidebar item
- `menubar_edit_profile` - Edit profile item
- `menubar_add_profile` - Add Profile item

#### Scenario: Translated Menubar Labels
Given a user viewing the menubar demo in a non-English language
When translations are loaded
Then all menubar labels display in the selected language

### Requirement: Tabs Component
The UI kit SHALL provide Tabs, TabsList, TabsTrigger, and TabsContent components built on @radix-ui/react-tabs for organizing content into switchable tabbed panels with proper ARIA accessibility.

#### Scenario: Tab Panel Navigation
Given a user viewing tabbed content
When the user clicks on a tab trigger
Then the corresponding tab content panel is displayed and the trigger shows active state

### Requirement: Tabs Demo Example
The UI kit demo SHALL provide an example for the Tabs component in the Navigation category demonstrating multiple tab panels with form content (Account/Password tabs) using Card, Input, and Button components, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Tabs example is rendered
Then functional tab panels with form inputs are displayed and switchable

### Requirement: Tabs in Category System
The UI kit element registry SHALL include 'Tabs' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Tabs
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Tabs' appears as an implemented element

### Requirement: Tabs Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `tabs_heading` - Section heading
- `tabs_account` - Account tab label
- `tabs_password` - Password tab label
- `tabs_account_title` - Account card title
- `tabs_account_description` - Account card description
- `tabs_password_title` - Password card title
- `tabs_password_description` - Password card description
- `tabs_name` - Name field label
- `tabs_username` - Username field label
- `tabs_current_password` - Current password field label
- `tabs_new_password` - New password field label
- `tabs_save_changes` - Save changes button
- `tabs_save_password` - Save password button

#### Scenario: Translated Tabs Labels
Given a user viewing the tabs demo in a non-English language
When translations are loaded
Then all tabs labels and form fields display in the selected language

### Requirement: Input Demo Examples
The UI kit demo SHALL provide examples for the Input component in the Forms & Inputs category demonstrating basic email input, file input, disabled state, and input with label, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Input examples are rendered
Then four input variants are displayed: email, file, disabled, and labeled

### Requirement: Input in Category System
The UI kit element registry SHALL include 'Input' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Input
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Input' appears as an implemented element

### Requirement: Input Demo Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `input_heading` - Section heading
- `input_default_label` - Default input label
- `input_file_label` - File input label
- `input_disabled_label` - Disabled input label
- `input_with_label_label` - Input with label example label
- `input_email_placeholder` - Email placeholder text
- `input_email_label` - Email label text

#### Scenario: Translated Input Labels
Given a user viewing the input demo in a non-English language
When translations are loaded
Then all input labels and placeholders display in the selected language

### Requirement: Textarea Demo Examples
The UI kit demo SHALL provide examples for the Textarea component in the Forms & Inputs category demonstrating default textarea with placeholder and disabled state, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Textarea examples are rendered
Then two textarea variants are displayed: default and disabled

### Requirement: Textarea in Category System
The UI kit element registry SHALL include 'Textarea' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Textarea
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Textarea' appears as an implemented element

### Requirement: Textarea Demo Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `textarea_heading` - Section heading
- `textarea_default_label` - Default textarea label
- `textarea_disabled_label` - Disabled textarea label
- `textarea_placeholder` - Placeholder text

#### Scenario: Translated Textarea Labels
Given a user viewing the textarea demo in a non-English language
When translations are loaded
Then all textarea labels and placeholders display in the selected language

### Requirement: Checkbox Component
The UI kit SHALL provide a Checkbox component built on @radix-ui/react-checkbox for boolean input selection with proper accessibility, checked/unchecked states, and disabled state support.

#### Scenario: Checkbox Toggle
Given a user viewing a form with checkboxes
When the user clicks on a checkbox
Then the checkbox toggles between checked and unchecked states with visual indicator

### Requirement: Checkbox Demo Examples
The UI kit demo SHALL provide examples for the Checkbox component in the Forms & Inputs category demonstrating basic checkbox with label, checked checkbox with description, disabled checkbox, and card-style checkbox with custom styling, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Checkbox examples are rendered
Then four checkbox variants are displayed showing different use cases

### Requirement: Checkbox in Category System
The UI kit element registry SHALL include 'Checkbox' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Checkbox
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Checkbox' appears as an implemented element

### Requirement: Checkbox Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `checkbox_heading` - Section heading
- `checkbox_basic_label` - Basic example label
- `checkbox_with_text_label` - With text example label
- `checkbox_disabled_label` - Disabled example label
- `checkbox_card_label` - Card style example label
- `checkbox_terms` - Accept terms text
- `checkbox_terms_description` - Terms description text
- `checkbox_notifications` - Enable notifications text
- `checkbox_notifications_description` - Notifications description text

#### Scenario: Translated Checkbox Labels
Given a user viewing the checkbox demo in a non-English language
When translations are loaded
Then all checkbox labels and descriptions display in the selected language

### Requirement: Theme Chart Colors

The Theme contract SHALL include a `chart` color palette for data visualization components.

#### Scenario: Chart colors defined in theme

- **GIVEN** a Theme object
- **WHEN** accessing `theme.colors.chart`
- **THEN** five chart colors are available as `chart.1` through `chart.5`
- **AND** colors use OKLCH format (modern standard for perceptual uniformity)
- **AND** colors are semantically neutral (not tied to success/error/warning semantics)
- **AND** colors are optimized for contrast on the theme's background

#### Scenario: Chart colors available as CSS variables

- **GIVEN** a theme is applied to the application
- **WHEN** reading CSS variables from document root
- **THEN** `--chart-1` through `--chart-5` are available
- **AND** values update when theme changes

#### Scenario: Chart colors adapt to theme changes

- **GIVEN** a chart component using theme chart colors via CSS variables
- **WHEN** the user switches from light to dark theme
- **THEN** chart colors update to the new theme's chart palette
- **AND** chart maintains visual distinction between data series

