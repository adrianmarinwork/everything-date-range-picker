# EverythingDateRangePicker

**A lightweight, dependency-free JavaScript date range picker.**

![EverythingDateRangePicker Screenshot](https://github.com/adrianmarinwork/everything-date-range-picker/assets/screenshot.png)

## ✨ Features

- 📅 **Pure JavaScript**: No external dependencies.
- 🎨 **Customizable**: Easily style to fit your application's design.
- 🔧 **UMD Build**: Compatible with various module systems.
- 🛠️ **Easy Integration**: Simple setup with minimal configuration.
- 🏎️ **Fast Navigation**: Easily navigate between dates by clicking the calendar header.

## 🧪 Demo

[Live Demo](https://adrianmarinwork.github.io/everything-date-range-picker/demo/)

## 🚀 Installation

```bash
npm install everything-date-range-picker
```

## 📦 Usage

### HTML

```html
<div id="datePickerContainer"></div>
<script src="node_modules/everything-date-range-picker/dist/everything-date-range-picker.js"></script>
<script>
  const datePicker = new EverythingDateRangePicker('datePickerContainer', {
    singleCalendar: false,
    styleTheme: 'light|dark',
    startDate: '2024-12-13 00:00:00',
    endDate: '2024-12-20 23:59:59',
    granularity: 'hour|day|week|month|quarter|semester|year',
    showGranularityDropdown: true,
    // Additional options here
  });
</script>
```

### JavaScript Module

```javascript
import EverythingDateRangePicker from 'everything-date-range-picker';

const datePicker = new EverythingDateRangePicker('datePickerContainer', {
  singleCalendar: false,
  styleTheme: 'light|dark',
  startDate: '2024-12-13 00:00:00',
  endDate: '2024-12-20 23:59:59',
  granularity: 'hour|day|week|month|quarter|semester|year',
  showGranularityDropdown: true,
  // Additional options here
});
```

## ⚙️ Options

- `containerId` (String): The id of the DOM element to render the picker into.
- `options` (Object): Contains all the options to configure the date picker, check options below.

- `styleTheme` (String): The theme used to style the picker. Default: Browser preference. Available: light|dark.
- `startDate` (Date|String): Initial start date. Default: Start of today.
- `endDate` (Date|String): \*Only available when `singleCalendar: false`. Initial end date. Default: End of today.
- `minDate` (Date|String): Minimum selectable date. Default: `null`.
- `maxDate` (Date|String): Maximum selectable date. Default: `null`.
- `granularity` (String): Calendar granularity. Default: `hour`. Available: hour|day|week|month|quarter|semester|year.
- `singleCalendar` (Boolean): Whether the calendar renders with one calendar or two. Default: `false`.
- `showFastNavigationArrows` (Boolean): \*Only available when `sigleCalendar: true`. Arrows that let the user navigate between dates without opening the calendar. Default: `false`.
- `hideRanges` (Boolean): \*Only available when `singlesCalendar: false`. Whether the fast selection ranges are visible or hidden. Default: `false`.
- `customRanges` (Array): \*Only available when `singleCalendar: false`. Your list of fast selection custom ranges. Default: `[]`. Format: [{ label: 'My Range', startDate: new Date(new Date().setHours(0, 0)), endDate: new Date(), position: 2 }].
- `appendToDefaultRanges` (Boolean): \*Only available when `singleCalendar: false`. When set to `true` your `customRanges` will be appended to the default fast selection ranges based in the position property, if value set to `false` your `customRanges` will replace the default ones. Default: `false`.
- `hiddenRanges` (Array): \*Only available when `singleCalendar: false`. List of ranges that will be hidden. Default: `[]`.
- `disabledRanges` (Array): \*Only available when `singleCalendar: false`. List of ranges that will be disabled. Default: `[]`.
- `firstDayOfWeek` (String): The day of the week that the calendar will display as the first day for the hour, day and week granularities. Default: `Monday`. Available: Monday|Sunday.
- `showGranularityDropdown` (Boolean): Whether the dropdown to change the granularity of the calendars is visible or hidden. Default: `false`.
- `changeGranularityCallback` (Function): Callback when the granularity changes. Default: `null`.
- `showApplyButton` (Boolean): Whether the apply button is visible or hidden. Default: `true`.
- `applyButtonText` (String): The text that will be disaplyed in the apply button. Default: `Apply`.
- `applyDatesCallback` (Function): Callback when the apply button is clicked. Default: `null`.
- `showSetStartDayButton` (Boolean): \*Only available when `granularity: 'hour'`. Wether the Set Start Day button that takes care of setting the start of the day is visible or hidden. Default: `false`.
- `showSetEndDayButton` (Boolean): \*Only available when `granularity: 'hour'`. Wether the Set End Day button that takes care of setting the end of the day is visible or hidden. Default: `false`.
- `changeStartDateCallback` (Function): Callback when the start date of the calendar changes. Default: `null`.
- `changeEndDateCallback` (Function): Callback when the end date of the calendar changes. Default: `null`.
- `listOfDisabledDates` (Array): List of dates that will disabled in the calendar. Default: `[]`.
- `customStyleVariables` (Object): Object to edit the value of the CSS variables that style the picker. Default: `null`. Available:
  - `--font-family`
  - `--text-color`: Dark version: `--dark-text-color`.
  - `--calendar-bg`: Dark version: `--dark-calendar-bg`.
  - `--hover-bg-color`: Dark version: `--dark-hover-bg-color`.
  - `--selected-bg-color`: Dark version: `--dark-selected-bg-color`.
  - `--border-color`: Dark version: `--dark-border-color`.

## 🛠️ Build

To build the project:

```bash
npm run build
```

This will generate the UMD bundle in the `dist/` directory.

## 📄 License

MIT

## 🙌 Contributing

Contributions are welcome! Please open issues and submit pull requests for any enhancements or bug fixes.

## 🔗 Links

- [GitHub Repository](https://github.com/adrianmarinwork/everything-date-range-picker)
- [NPM Package](https://www.npmjs.com/package/everything-date-range-picker)
- [Live Demo](https://adrianmarinwork.github.io/everything-date-range-picker/demo/)
