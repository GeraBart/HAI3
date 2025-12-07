## ADDED Requirements

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
