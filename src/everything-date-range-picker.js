import './everything-date-range-picker.css';

class EverythingDateRangePicker {
  #defaultRanges = [
    {
      label: 'Today',
      startDate: new Date(new Date().setHours(0, 0)),
      endDate: new Date(),
    },
    {
      label: 'Yesterday',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0)),
      endDate: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 59)),
    },
    {
      label: 'Last 7 Days',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() - 6)).setHours(0, 0)),
      endDate: new Date(),
    },
    {
      label: 'Last 30 Days',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() - 29)).setHours(0, 0)),
      endDate: new Date(),
    },
    {
      label: 'This Week',
      startDate: new Date(
        new Date(new Date().setDate(new Date().getDate() - ((new Date().getDay() + 6) % 7))).setHours(0, 0, 0, 0)
      ),
      endDate: new Date(),
    },
    {
      label: 'Last Week',
      startDate: new Date(
        new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 6)).setHours(0, 0, 0, 0)
      ),
      endDate: new Date(
        new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).setHours(23, 59, 59, 999)
      ),
    },
    {
      label: 'This Month',
      startDate: new Date(new Date(new Date().getFullYear(), new Date().getMonth()).setHours(0, 0)),
      endDate: new Date(),
    },
    {
      label: 'Last Month',
      startDate: new Date(new Date(new Date().getFullYear(), new Date().getMonth() - 1).setHours(0, 0)),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59, 999),
    },
    {
      label: 'Year to Date',
      startDate: new Date(new Date(new Date().getFullYear(), 0).setHours(0, 0)),
      endDate: new Date(),
    },
    {
      label: 'Last Year',
      startDate: new Date(new Date(new Date().getFullYear() - 1, 0).setHours(0, 0)),
      endDate: new Date(new Date(new Date(new Date().getFullYear() - 1, 11).setDate(31)).setHours(23, 59)),
    },
  ];

  #granularitiesAvailable = ['hour', 'day', 'week', 'month', 'quarter', 'semester', 'year'];

  #monthsStrings = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  #dayOfWeekNumberRelationObj = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  #startCalendarMonth;
  #endCalendarMonth;
  #timesClickedDate = 0;
  #calendarGranularity;

  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.startDate = options.startDate || new Date(new Date().setHours(0, 0, 0, 0));
    this.#checkValidityOfDateType('startDate');
    this.currentStartDate = this.startDate;
    this.selectedStartDate = this.startDate;
    this.endDate = options.endDate || new Date(new Date().setHours(23, 59, 59, 999));
    this.#checkValidityOfDateType('endDate');
    this.currentEndDate = this.endDate;
    this.selectedEndDate = this.endDate;
    this.minDate = options.minDate || null;
    this.#checkValidityOfDateType('minDate');
    this.maxDate = options.maxDate || null;
    this.#checkValidityOfDateType('maxDate');
    this.timezone = options.timezone || null;
    this.showTimezoneChooser = this.#checkIfParameterExist(options.showTimezoneChooser, false);
    this.granularity = options.granularity || 'hour';
    this.#calendarGranularity = this.granularity;
    this.singleCalendar = this.#checkIfParameterExist(options.singleCalendar, false);
    this.showFastNavigationArrows = this.#checkIfParameterExist(options.showFastNavigationArrows, false);
    this.customRanges = options.customRanges || [];
    this.ranges = this.#defaultRanges;
    this.hideRanges = this.#checkIfParameterExist(options.hideRanges, false);
    this.appendToDefaultRanges = this.#checkIfParameterExist(options.appendToDefaultRanges, false);
    this.hiddenRanges = options.hiddenRanges || [];
    this.disabledRanges = options.disabledRanges || [];
    this.spanOfSelecteableDays = options.spanOfSelecteableDays || null;
    this.firstDayOfWeek = options.firstDayOfWeek || 'Monday';
    this.showGranularityDropdown = this.#checkIfParameterExist(options.showGranularityDropdown, false);
    this.changeGranularityCallback = options.changeGranularityCallback || null;
    this.showApplyButton = this.#checkIfParameterExist(options.showApplyButton, true);
    this.applyButtonText = options.applyButtonText || 'Apply';
    this.applyDatesCallback = options.applyDatesCallback || null;
    this.showSetStartDayButton = this.#checkIfParameterExist(options.showSetStartDayButton, false);
    this.showSetEndDayButton = this.#checkIfParameterExist(options.showSetEndDayButton, false);
    this.changeStartDateCallback = options.changeStartDateCallback || null;
    this.changeEndDateCallback = options.changeEndDateCallback || null;
    this.listOfDisabledDates = options.listOfDisabledDates || [];
    this.styleTheme = options.styleTheme || '';
    this.customStyleVariables = options.customStyleVariables || null;

    // Lets make the different checks for the dates
    const isMinDateBigger = this.#checkIfFirstDateBigger(this.minDate, this.startDate);
    const isMaxDateSmaller = this.#checkIfFirstDateSmaller(this.maxDate, this.startDate);

    if (isMinDateBigger || isMaxDateSmaller) {
      this.startDate = new Date(this.minDate);
      this.currentStartDate = this.startDate;
      this.selectedStartDate = this.startDate;
    }

    const isStartDateBigger = this.#checkIfFirstDateBigger(this.startDate, this.endDate);

    if (isStartDateBigger) {
      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    const isEndDateBigger = this.#checkIfFirstDateBigger(this.endDate, this.maxDate);

    if (isEndDateBigger) {
      this.endDate = new Date(this.maxDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    const isEndDateSmaller = this.#checkIfFirstDateSmaller(this.endDate, this.startDate);

    if (isEndDateSmaller) {
      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    this.#initDatePicker();
  }

  //#region PUBLIC METHODS

  getSelectedDates() {
    const startDateFormatted = this.getDateFormattedByGranularity(this.selectedStartDate);
    let dates = {
      granularity: this.granularity,
      startDate: startDateFormatted.date,
      startDateFrom: startDateFormatted.from,
      startDateTo: startDateFormatted.to,
    };

    // If the user has the single calendar enabled we don't need to get the end date
    if (this.singleCalendar) {
      return dates;
    }

    const endDateFormatted = this.getDateFormattedByGranularity(this.selectedEndDate);
    dates.endDate = endDateFormatted.date;
    dates.endDateFrom = endDateFormatted.from;
    dates.endDateTo = endDateFormatted.to;

    return dates;
  }

  /**
   * Method that takes care of returning the selected dates formatting them by the selected
   * granularity by the user
   * @param {Object} date The date object
   * @param {Boolean} ignoreHoursForHourGranularity A boolean to ignore the hours when formatting the hour
   * granularity
   * @returns {Object} The formatted date, the from date of the granularity selected and the to date
   */
  getDateFormattedByGranularity(date, ignoreHoursForHourGranularity) {
    const granularity = this.granularity;
    const day = this.#verifyDateElementHasTwoDigits(date.getDate());
    let month = this.#verifyDateElementHasTwoDigits(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = this.#verifyDateElementHasTwoDigits(date.getHours());
    const minutes = this.#verifyDateElementHasTwoDigits(date.getMinutes());
    let formattedDate = '';
    let from = '';
    let to = '';

    switch (granularity) {
      case 'hour':
        formattedDate = `${year}-${month}-${day}`;
        from = `${year}-${month}-${day}`;
        to = `${year}-${month}-${day}`;

        if (ignoreHoursForHourGranularity) {
          break;
        }

        formattedDate += ` ${hours}:${minutes}`;
        from += ` ${hours}:${minutes}`;
        to += ` ${hours}:${minutes}`;
        break;
      case 'day':
        formattedDate = `${year}-${month}-${day}`;
        from = `${year}-${month}-${day} 00:00`;
        to = `${year}-${month}-${day} 23:59`;
        break;
      case 'week': {
        const { week, year } = this.#getWeekInfoOfDate(date);
        const { start, end } = this.#getStartAndEndOfWeek(date);
        const startMonth = this.#verifyDateElementHasTwoDigits(start.getMonth() + 1);
        const startDate = this.#verifyDateElementHasTwoDigits(start.getDate());
        const endMonth = this.#verifyDateElementHasTwoDigits(end.getMonth() + 1);
        const endDate = this.#verifyDateElementHasTwoDigits(end.getDate());

        formattedDate = `${year}-W${this.#verifyDateElementHasTwoDigits(week)}`;
        from = `${start.getFullYear()}-${startMonth}-${startDate} 00:00`;
        to = `${end.getFullYear()}-${endMonth}-${endDate} 23:59`;
        break;
      }
      case 'month': {
        formattedDate = `${year}-${month}`;
        from = `${year}-${month}-01 00:00`;

        const lastDayOfMonth = this.#getLastDayOfMonth(date);
        to = `${year}-${month}-${lastDayOfMonth} 23:59`;
        break;
      }
      case 'quarter': {
        const { quarter, firstMonthQuarter } = this.#getQuarterOfMonth(month);
        formattedDate = `${year}-${quarter}`;
        from = `${year}-${firstMonthQuarter}-01 00:00`;

        const numberMonth = parseInt(firstMonthQuarter) - 1;
        const sumOfMonths = numberMonth + 3 > 12 ? 12 : numberMonth + 3;
        const lastMonthOfQuarter = this.#verifyDateElementHasTwoDigits(sumOfMonths);
        const lastDayOfLastMonth = this.#getLastDayOfMonth(`${year}-${lastMonthOfQuarter}-01`);
        to = `${year}-${lastMonthOfQuarter}-${lastDayOfLastMonth} 23:59`;
        break;
      }
      case 'semester': {
        const { semester, firstMonthSemester } = this.#getSemesterOfMonth(month);
        formattedDate = `${year}-${semester}`;
        from = `${year}-${firstMonthSemester}-01 00:00`;

        const numberMonth = parseInt(firstMonthSemester) - 1;
        const sumOfMonths = numberMonth + 6 > 12 ? 12 : numberMonth + 6;
        const lastMonthOfSemester = this.#verifyDateElementHasTwoDigits(sumOfMonths);
        const lastDayOfLastMonth = this.#getLastDayOfMonth(`${year}-${lastMonthOfSemester}-01`);
        to = `${year}-${lastMonthOfSemester}-${lastDayOfLastMonth} 23:59`;
        break;
      }
      case 'year':
        formattedDate = `${year}`;
        from = `${year}-01-01 00:00`;
        to = `${year}-12-31 23:59`;
        break;
    }

    return { date: formattedDate, from, to };
  }

  /**
   * Method used to set the start date
   * @param {Object|String} date The date that is going to be the start date
   */
  setStartDate(date) {
    this.startDate = date;
    this.#checkValidityOfDateType('startDate');
    this.currentStartDate = this.startDate;
    this.selectedStartDate = this.startDate;

    if (this.minDate) {
      const isMinDateBigger = this.#checkIfFirstDateBigger(this.minDate, this.startDate);

      if (isMinDateBigger) {
        const message = `Current min date (${this.minDate}) is bigger than new set start date`;
        this.#sendConsoleMessage(message, 'warning');

        this.minDate = new Date(this.startDate);
      }
    }

    if (this.maxDate) {
      const isMaxDateSmaller = this.#checkIfFirstDateSmaller(this.maxDate, this.startDate);

      if (isMaxDateSmaller) {
        const message = `Current max date (${this.maxDate}) is smaller than new set start date`;
        this.#sendConsoleMessage(message, 'warning');

        this.maxDate = new Date(this.startDate);
      }
    }

    const isEndDateSmaller = this.#checkIfFirstDateSmaller(this.endDate, this.startDate);

    if (isEndDateSmaller) {
      const message = `Current end date (${this.endDate}) is smaller than new set start date`;
      this.#sendConsoleMessage(message, 'warning');

      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    this.#updateDateRangePickerElementsAfterUpdatingDate();
  }

  /**
   * Method used to set the end date
   * @param {Object|String} date The date that is going to be the end date
   */
  setEndDate(date) {
    this.endDate = date;
    this.#checkValidityOfDateType('endDate');
    this.currentEndDate = this.endDate;
    this.selectedEndDate = this.endDate;

    if (this.minDate) {
      const isMinDateBigger = this.#checkIfFirstDateBigger(this.minDate, this.endDate);

      if (isMinDateBigger) {
        const message = `Current min date (${this.minDate}) is bigger than new set end date`;
        this.#sendConsoleMessage(message, 'warning');

        this.minDate = new Date(this.endDate);
      }
    }

    if (this.maxDate) {
      const isMaxDateSmaller = this.#checkIfFirstDateSmaller(this.maxDate, this.endDate);

      if (isMaxDateSmaller) {
        const message = `Current max date (${this.maxDate}) is smaller than new set end date`;
        this.#sendConsoleMessage(message, 'warning');

        this.maxDate = new Date(this.endDate);
      }
    }

    const isStartDateBigger = this.#checkIfFirstDateBigger(this.startDate, this.endDate);

    if (isStartDateBigger) {
      const message = `Current start date (${this.startDate}) is bigger than new set end date`;
      this.#sendConsoleMessage(message, 'warning');

      this.startDate = new Date(this.endDate);
      this.currentStartDate = this.startDate;
      this.selectedStartDate = this.startDate;
    }

    this.#updateDateRangePickerElementsAfterUpdatingDate();
  }

  getMinDate() {
    return this.minDate;
  }

  /**
   * Method used to set the min date
   * @param {Object|String} date The date that is going to be the min date
   */
  setMinDate(date) {
    this.minDate = date;
    this.#checkValidityOfDateType('minDate');

    if (this.maxDate) {
      const isMinDateBiggerMaxDate = this.#checkIfFirstDateBigger(this.minDate, this.maxDate);

      if (isMinDateBiggerMaxDate) {
        const message = `Current max date (${this.maxDate}) is smaller than new set min date`;
        this.#sendConsoleMessage(message, 'warning');

        this.maxDate = new Date(this.minDate);
      }
    }

    const isMinDateBiggerStartDate = this.#checkIfFirstDateBigger(this.minDate, this.startDate);

    if (isMinDateBiggerStartDate) {
      const message = `Current start date (${this.startDate}) is smaller than new set min date`;
      this.#sendConsoleMessage(message, 'warning');

      this.startDate = new Date(this.minDate);
      this.currentStartDate = this.startDate;
      this.selectedStartDate = this.startDate;
    }

    if (!this.singleCalendar) {
      const isMinDateBiggerEndDate = this.#checkIfFirstDateBigger(this.minDate, this.endDate);

      if (isMinDateBiggerEndDate) {
        const message = `Current end date (${this.endDate}) is smaller than new set min date`;
        this.#sendConsoleMessage(message, 'warning');

        this.endDate = new Date(this.minDate);
        this.currentEndDate = this.endDate;
        this.selectedEndDate = this.endDate;
      }
    }

    this.#updateDateRangePickerElementsAfterUpdatingDate();
  }

  getMaxDate() {
    return this.maxDate;
  }

  /**
   * Method used to set the max date
   * @param {Object|String} date The date that is going to be the max date
   */
  setMaxDate(date) {
    this.maxDate = date;
    this.#checkValidityOfDateType('maxDate');

    if (this.minDate) {
      const isMaxDateSmallerMinDate = this.#checkIfFirstDateSmaller(this.maxDate, this.minDate);

      if (isMaxDateSmallerMinDate) {
        const message = `Current min date (${this.minDate}) is bigger than new set max date`;
        this.#sendConsoleMessage(message, 'warning');

        this.minDate = new Date(this.maxDate);
      }
    }

    const isMaxDateSmallerStartDate = this.#checkIfFirstDateSmaller(this.maxDate, this.startDate);

    if (isMaxDateSmallerStartDate) {
      const message = `Current start date (${this.startDate}) is bigger than new set max date`;
      this.#sendConsoleMessage(message, 'warning');

      this.startDate = new Date(this.maxDate);
      this.currentStartDate = this.startDate;
      this.selectedStartDate = this.startDate;
    }

    if (!this.singleCalendar) {
      const isMaxDateSmallerEndDate = this.#checkIfFirstDateSmaller(this.maxDate, this.endDate);

      if (isMaxDateSmallerEndDate) {
        const message = `Current end date (${this.endDate}) is bigger than new set max date`;
        this.#sendConsoleMessage(message, 'warning');

        this.endDate = new Date(this.maxDate);
        this.currentEndDate = this.endDate;
        this.selectedEndDate = this.endDate;
      }
    }

    this.#updateDateRangePickerElementsAfterUpdatingDate();
  }

  getGranularity() {
    return this.granularity;
  }

  /**
   * Method used to set the granularity of the Date Range Picker
   * @param {String} granularity Available options ['hour', 'day', 'week', 'month', 'quarter', 'semester, 'year']
   * @param {Boolean} avoidCallbackExecution Indicates if the "changeGranularityCallback" is executed
   * @returns {void} Code execution stops if a granularity not available is sent
   */
  setGranularity(granularity, avoidCallbackExecution) {
    const isAvailableGranularity = this.#granularitiesAvailable.includes(granularity);

    if (!isAvailableGranularity) {
      this.#sendConsoleMessage(`Granularity ${granularity} you are trying to set is not available`, 'warning');
      return;
    }

    this.granularity = granularity;
    this.#calendarGranularity = granularity;

    if (this.showGranularityDropdown) {
      this.granularityDropdown.value = granularity;
    }

    this.#changingGranularityLogics(avoidCallbackExecution);
  }

  getTimezone() {
    return this.timezone;
  }

  setTimezone(timezone) {
    this.timezone = timezone;
  }

  setHiddenRanges(ranges) {
    this.hiddenRanges = ranges;
    this.#populateRangesContainer();
  }

  setDisabledRanges(ranges) {
    this.disabledRanges = ranges;
    this.#populateRangesContainer();
  }

  setListOfDisabledDates(listOfDisabledDates) {
    this.listOfDisabledDates = listOfDisabledDates;

    this.#populateStartCalendar();
    if (!this.singleCalendar) {
      this.#populateEndCalendar();
    }
  }

  //#endregion

  //#region PRIVATE METHODS

  #initDatePicker() {
    const {
      startDateEqualsMinDate,
      startDateEqualsMaxDate,
      endDateEqualsMinDate,
      endDateEqualsMaxDate,
      startDateEqualsEndDate,
    } = this.#checkDatesToRenderArrows();

    const hideLeftCalendarPreviousArrow = startDateEqualsMinDate || (startDateEqualsEndDate && this.singleCalendar);
    const hideLeftCalendarNextArrow = startDateEqualsMaxDate || startDateEqualsEndDate;

    const leftArrow = `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
        class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 12l14 0" />
        <path d="M5 12l6 6" />
        <path d="M5 12l6 -6" />
      </svg>
    `;

    const rightArrow = `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
        class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 12l14 0" />
        <path d="M13 18l6 -6" />
        <path d="M13 6l6 6" />
      </svg>
    `;

    const singleCalendar = `
      <div class="calendar">
        <div class="calendar-header">
          <div class="calendar-arrow left-calendar-previous-arrow"
            ${hideLeftCalendarPreviousArrow ? 'style="display: none"' : ''}> 
            ${leftArrow}
          </div>
          <div class="start-date-calendar-month">
          </div>
          <div class="calendar-arrow left-calendar-next-arrow"
            ${hideLeftCalendarNextArrow ? 'style="display: none"' : ''}>
            ${rightArrow}  
          </div>
        </div>
        <div class="start-date-calendar">
        </div>
        <div class="calendar-footer">
          <div class="calendar-time-picker">
            <select class="start-date-hours-dropdown">
            </select>
            <select class="start-date-minutes-dropdown">
            </select>
          </div>
        </div>
      </div>
    `;

    const hideRightCalendarPreviousArrow = endDateEqualsMinDate || startDateEqualsEndDate;
    const hideRightCalendarNextArrow = endDateEqualsMaxDate;

    let setStartDayButton = '';
    let setEndDayButton = '';

    if (this.showSetStartDayButton) {
      setStartDayButton = `
        <button class="calendar-set-start-end-day-button" data-value="start">
          Set start
        </button>
      `;
    }

    if (this.showSetEndDayButton) {
      setEndDayButton = `
        <button class="calendar-set-start-end-day-button" data-value="end">
          Set end
        </button>
      `;
    }

    const doubleCalendar = `
      <div class="calendar">
        <div class="calendar-header">
          <div class="calendar-arrow left-calendar-previous-arrow"
            ${hideLeftCalendarPreviousArrow ? 'style="display: none"' : ''}> 
            ${leftArrow} 
          </div>
          <div class="start-date-calendar-month">
          </div>
          <div class="calendar-arrow left-calendar-next-arrow"
            ${hideLeftCalendarNextArrow ? 'style="display: none"' : ''}>
            ${rightArrow}
          </div>
        </div>
        <div class="start-date-calendar">
        </div>
        <div class="calendar-footer">
          <div class="calendar-time-picker">
            ${setStartDayButton}
            <select class="start-date-hours-dropdown">
            </select>
            <select class="start-date-minutes-dropdown">
            </select>
          </div>
        </div>
      </div>
      <div class="calendar">
        <div class="calendar-header">
          <div class="calendar-arrow right-calendar-previous-arrow"
            ${hideRightCalendarPreviousArrow ? 'style="display: none"' : ''}>
            ${leftArrow}
          </div>
          <div class="end-date-calendar-month">
          </div>
          <div class="calendar-arrow right-calendar-next-arrow"
            ${hideRightCalendarNextArrow ? 'style="display: none"' : ''}>
            ${rightArrow}
          </div>
        </div>
        <div class="end-date-calendar">
        </div>
        <div class="calendar-footer">
          <div class="calendar-time-picker">
            <select class="end-date-hours-dropdown">
            </select>
            <select class="end-date-minutes-dropdown">
            </select>
            ${setEndDayButton}
          </div>
        </div>
      </div>
      <div class="calendar">
        <div class="ranges-container">
        </div>
      </div>
    `;

    let granularityDropdownHTML = '';

    if (this.showGranularityDropdown) {
      const hourSelected = this.granularity === 'hour' ? 'selected' : '';
      const daySelected = this.granularity === 'day' ? 'selected' : '';
      const weekSelected = this.granularity === 'week' ? 'selected' : '';
      const monthSelected = this.granularity === 'month' ? 'selected' : '';
      const quarterSelected = this.granularity === 'quarter' ? 'selected' : '';
      const semesterSelected = this.granularity === 'semester' ? 'selected' : '';
      const yearSelected = this.granularity === 'year' ? 'selected' : '';

      granularityDropdownHTML = `
        <div class="date-range-picker-granularity-dropdown-container">
          <select class="date-range-picker-granularity-dropdown">
            <option value="hour" ${hourSelected}>Hour</option>
            <option value="day" ${daySelected}>Day</option>
            <option value="week" ${weekSelected}>Week</option>
            <option value="month" ${monthSelected}>Month</option>
            <option value="quarter" ${quarterSelected}>Quarter</option>
            <option value="semester" ${semesterSelected}>Semester</option>
            <option value="year" ${yearSelected}>Year</option>
          </select>
        </div>
      `;
    }

    let leftFastNavigationArrowHTML = '';
    let rightFastNavigationArrowHTML = '';

    if (this.singleCalendar && this.showFastNavigationArrows) {
      leftFastNavigationArrowHTML = `
        <div class="date-range-picker-fast-navigation-arrow left-arrow">
          ${leftArrow}
        </div>
      `;

      rightFastNavigationArrowHTML = `
        <div class="date-range-picker-fast-navigation-arrow right-arrow">
          ${rightArrow}
        </div>
      `;
    }

    let applyButtonHTML = '';

    if (this.showApplyButton) {
      applyButtonHTML = `
        <button class="date-range-picker-apply-button">
          ${this.applyButtonText}
        </button>
      `;
    }

    this.container.innerHTML = `
      <div class="main-date-range-picker-container ${this.styleTheme}">
        ${granularityDropdownHTML}
        ${leftFastNavigationArrowHTML}
        <div class="date-range-picker-container">
          <div class="date-range-picker-display">
            <span class="calendar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="icon icon-tabler icons-tabler-outline icon-tabler-calendar-week">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M4 11h16" />
                <path d="M7 14h.013" />
                <path d="M10.01 14h.005" />
                <path d="M13.01 14h.005" />
                <path d="M16.015 14h.005" />
                <path d="M13.015 17h.005" />
                <path d="M7.01 17h.005" />
                <path d="M10.01 17h.005" />
              </svg>
            </span>
            <span class="selected-start-date">1</span>
            <span class="selected-dates-separator"> → </span>
            <span class="selected-end-date">2</span>
            <span class="arrow-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-down">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 5l0 14" />
                <path d="M18 13l-6 6" />
                <path d="M6 13l6 6" />
              </svg>
            </span>
          </div>
          <div class="date-range-picker-calendar-container">
            <div class="date-range-picker-calendar-body">
              ${this.singleCalendar ? singleCalendar : doubleCalendar}
            </div>
            <div class="date-range-picker-footer-container">
              ${applyButtonHTML}
            </div>
          </div>
        </div>
        ${rightFastNavigationArrowHTML}
      </div>
    `;

    if (this.showGranularityDropdown) {
      this.granularityDropdown = this.container.querySelector('.date-range-picker-granularity-dropdown');
      this.#attachOnChangeGranularityDropdownEvent();
    }

    this.display = this.container.querySelector('.date-range-picker-display');
    this.calendarContainer = this.container.querySelector('.date-range-picker-calendar-container');

    this.selectedStartDateElement = this.container.querySelector('.selected-start-date');
    this.selectedEndDateElement = this.container.querySelector('.selected-end-date');

    this.startCalendar = this.container.querySelector('.start-date-calendar');
    this.#startCalendarMonth = this.container.querySelector('.start-date-calendar-month');

    // If the singleCalendar boolean is true we render only the start calendar
    if (this.singleCalendar) {
      this.#populateStartCalendar();
      this.container.querySelector('.selected-dates-separator').remove();
      this.selectedEndDateElement.remove();
    } else {
      this.endCalendar = this.container.querySelector('.end-date-calendar');
      this.#endCalendarMonth = this.container.querySelector('.end-date-calendar-month');
      this.rangesContainer = this.container.querySelector('.ranges-container');

      this.#populateStartCalendar();
      this.#populateEndCalendar();
      this.#populateRangesContainer();
    }

    this.display.addEventListener('click', () => this.#toggleCalendar());
    document.addEventListener('click', (event) => this.#documentClickHandler(event));

    if (this.granularity !== 'hour') {
      this.#changeDisplayOfCalendarFooterContainers('none');
    }

    this.#populateTimePickers();
    this.#attachOnChangeHoursMinutesDropdownsEvent();

    if (this.singleCalendar && this.showFastNavigationArrows) {
      this.#attachClickFastNavigationArrows();
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, true);
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, false);
    }

    // Add click event listener to the arrows to navigate the months
    const listOfCalendarArrows = this.container.querySelectorAll('.calendar-arrow');

    listOfCalendarArrows.forEach((calendarArrow) => {
      calendarArrow.addEventListener('click', (event) => this.#changeRenderedCalendar(event));
    });

    if (this.showSetStartDayButton || this.showSetEndDayButton) {
      const endStartButtons = this.container.querySelectorAll('.calendar-set-start-end-day-button');

      endStartButtons.forEach((endStartbutton) => {
        endStartbutton.addEventListener('click', (event) => this.#setStartOrEndOfDay(event));
      });
    }

    if (this.showApplyButton) {
      const applyButton = this.container.querySelector('.date-range-picker-apply-button');
      applyButton.addEventListener('click', (event) => {
        this.#toggleCalendar();

        if (this.applyDatesCallback) {
          this.applyDatesCallback();
        }
      });
    }

    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');

    if (this.customStyleVariables) {
      this.#updateStyleOfDatePicker();
    }
  }

  /**
   * Method to hide or show the calendar when clicking the container of .date-range-picker-display
   */
  #toggleCalendar() {
    const currentDisplay = this.calendarContainer.style.display;
    this.calendarContainer.style.display = currentDisplay === 'block' ? 'none' : 'block';
  }

  /**
   * Method to hide the calendar when clicking anywhere in the screen except the date range picker
   * @param {Object} event The click object that contains the info of the event
   */
  #documentClickHandler(event) {
    if (!this.container.contains(event.target)) {
      this.calendarContainer.style.display = 'none';
    }
  }

  //#region Calendars Logics

  /**
   * Method that takes care of populate the start calendar with the start date
   */
  #populateStartCalendar() {
    const startDate = this.currentStartDate;
    const calendarHTML = this.#generateCalendar(startDate, 'left');
    this.startCalendar.innerHTML = calendarHTML;
    this.#attachClickCellEvent(this.startCalendar, 'left');
  }

  /**
   * Method that takes care of populate the end calendar with the end date
   */
  #populateEndCalendar() {
    const endDate = this.currentEndDate;
    const calendarHTML = this.#generateCalendar(endDate, 'right');
    this.endCalendar.innerHTML = calendarHTML;
    this.#attachClickCellEvent(this.endCalendar, 'right');
  }

  /**
   * Method that takes care of generating the HTML of the calendar
   * @param {Object} date The date object to use to generate the calendar
   * @param {String} sideOfCalendar The side of the calendar we are rendering (left, right)
   * @returns The HTML of the calendar
   */
  #generateCalendar(date, sideOfCalendar) {
    const granularity = this.#calendarGranularity;

    const titleOfCalendar = this.#generateTitleOfCalendar(granularity, date);
    if (sideOfCalendar === 'left') {
      this.#startCalendarMonth.innerHTML = titleOfCalendar;
      this.#attachClickCalendarTitleEvent(this.#startCalendarMonth);
    } else {
      this.#endCalendarMonth.innerHTML = titleOfCalendar;
      this.#attachClickCalendarTitleEvent(this.#endCalendarMonth);
    }

    let calendarHTML;
    switch (granularity) {
      case 'hour':
      case 'day':
      case 'week':
        calendarHTML = this.#generateHoursDaysWeeksCalendar(date);
        break;
      case 'month':
        calendarHTML = this.#generateMonthsCalendar(date);
        break;
      case 'quarter':
        calendarHTML = this.#generateQuartersCalendar(date);
        break;
      case 'semester':
        calendarHTML = this.#generateSemestersCalendar(date);
        break;
      case 'year':
        calendarHTML = this.#generateYearsCalendar(date);
        break;
    }

    return calendarHTML;
  }

  /**
   * Method that takes care of generating the title of the rendered calendar
   * @param {String} granularity The granularity that is currently rendering the calendar
   * @param {Object} date The date object
   * @returns {String} The formatted text that is going to be displayed as the title of the
   * rendered calendar
   */
  #generateTitleOfCalendar(granularity, date) {
    let titleOfCalendar = '';

    switch (granularity) {
      case 'hour':
      case 'day':
      case 'week': {
        const month = date.getMonth();
        const monthName = this.#monthsStrings[month];
        const year = date.getFullYear();
        titleOfCalendar = `
            <span class="calendarTitleElement" data-value="month">${monthName}</span> 
            <span class="calendarTitleElement" data-value="year">${year}</span>
          `;
        break;
      }
      case 'month':
      case 'quarter':
      case 'semester':
      case 'year': {
        const year = date.getFullYear();
        titleOfCalendar = `<span class="calendarTitleElement" data-value="year">${year}</span>`;
        break;
      }
    }

    return titleOfCalendar;
  }

  /**
   * Method used to generate the calendar used for the hours, days and weeks granularity that displays
   * the days of the month
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateHoursDaysWeeksCalendar(date) {
    let firstDayOfMonthInWeek = new Date(date);
    firstDayOfMonthInWeek = new Date(firstDayOfMonthInWeek.setDate(1)).getDay();
    const lastDayOfMonth = this.#getLastDayOfMonth(date);

    // Get the index of the week for the day the user selected as first day of the week
    const indexOfFirstDayOfWeek = this.#dayOfWeekNumberRelationObj[this.firstDayOfWeek];

    let dayOfMonth = 1;
    let weeksOfMonth = [];

    /*
      Knowing the first day of the month in the week (0 - 6) and the index of the first
      day of the week that the user has selected (0 - 6) we substract that index to the 
      first day of the month in the week as that day can change of position inside the array of
      the seven days depending on the first day of the week that the user has selected.
    */
    let indexToInsertDay = firstDayOfMonthInWeek - indexOfFirstDayOfWeek;

    /*
      Here there are two cases:
      1. The operation resulted in a negative number meaning that we are going back a week, so we have
      to add 7 days to get the position of that day in the new week (EX: The first day of the month 
      in the week is the Sunday and the first day of the week selected by the user in Wednesday)
      
      2. The first day of the month in the week is Sunday (index = 0) and the user selected the first
      day of the week as Sunday, we set the indexToInsertDay = 0, this is a special case
    */
    if (indexToInsertDay < 0) {
      indexToInsertDay = firstDayOfMonthInWeek - indexOfFirstDayOfWeek + 7;
    } else if (firstDayOfMonthInWeek === 0 && indexOfFirstDayOfWeek === 0) {
      indexToInsertDay = 0;
    }

    let daysOfWeek = [];
    daysOfWeek[indexToInsertDay] = dayOfMonth;

    // Let's calculate the positioning of the days inside each week
    do {
      // If 7 days have been inserted, reset week
      if (daysOfWeek.length === 7) {
        weeksOfMonth.push(daysOfWeek);
        daysOfWeek = [];
      }

      dayOfMonth += 1;
      daysOfWeek[daysOfWeek.length] = dayOfMonth;
    } while (dayOfMonth < lastDayOfMonth);

    weeksOfMonth.push(daysOfWeek);

    // Let's generate the days of the week for the table header
    const normalOrderOfDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    let tableHeaderDaysHTML = ``;
    let counter = 0;
    let indexToGetDayOfWeek = indexOfFirstDayOfWeek;

    do {
      if (indexToGetDayOfWeek === 7) {
        indexToGetDayOfWeek = 0;
      }

      tableHeaderDaysHTML += `<th><div>${normalOrderOfDays[indexToGetDayOfWeek]}</div></th>`;
      indexToGetDayOfWeek += 1;

      counter += 1;
    } while (counter < 7);

    let tableDaysHTML = ``;

    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();

    for (let i = 0; i < weeksOfMonth.length; i++) {
      const week = weeksOfMonth[i];
      tableDaysHTML += `<tr>`;

      for (let j = 0; j < week.length; j++) {
        const day = week[j] || '';
        const dateValue = `${year}-${month}-${day}`;
        const dateObject = new Date(dateValue);
        const attributesToAdd = day ? this.#getCalendarCellAttributesToAdd(dateObject) : '';
        const tdAttributes = day ? `class="calendar-clickable-cell" data-value="${dateValue}"` : '';

        tableDaysHTML += `<td ${tdAttributes}><div ${attributesToAdd}>${day}</div></td>`;
      }
      tableDaysHTML += `</tr>`;
    }

    const calendarHTML = `
      <table>
        <thead>
          <tr>
            ${tableHeaderDaysHTML}
          </tr>
        </thead>
        <tbody>
          ${tableDaysHTML}
        </tbody>
      </table>
    `;

    return calendarHTML;
  }

  /**
   * Method used to generate the calendar used for the months granularity that displays
   * the months
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateMonthsCalendar(date) {
    const day = 1;
    const year = new Date(date).getFullYear();

    let tableMonthsHTML = '';
    let index = 0;

    do {
      tableMonthsHTML += '<tr>';

      for (let j = 0; j < 3; j++) {
        const monthNumber = index;
        let monthName = this.#monthsStrings[monthNumber];
        monthName = monthName.substring(0, 3);

        const dateValue = `${year}-${monthNumber + 1}-${day}`;
        const dateObject = new Date(dateValue);
        const attributesToAdd = this.#getCalendarCellAttributesToAdd(dateObject);

        tableMonthsHTML += `<td class="calendar-clickable-cell" data-value="${dateValue}"><div ${attributesToAdd}>${monthName}</div></td>`;

        index += 1;
      }

      tableMonthsHTML += '</tr>';
    } while (index < 12);

    const calendarHTML = `
      <table>
        <tbody>
          ${tableMonthsHTML}
        </tbody>
      </table>
    `;

    return calendarHTML;
  }

  /**
   * Method used to generate the calendar used for the quarters granularity that displays
   * the quarters of a year
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateQuartersCalendar(date) {
    const day = 1;
    let month = 1;
    const year = new Date(date).getFullYear();

    let tableQuartersHTML = '';
    let index = 1;

    do {
      tableQuartersHTML += '<tr>';

      for (let j = 0; j < 2; j++) {
        const dateValue = `${year}-${month}-${day}`;
        const dateObject = new Date(dateValue);
        const attributesToAdd = this.#getCalendarCellAttributesToAdd(dateObject);

        tableQuartersHTML += `<td class="calendar-clickable-cell" data-value="${dateValue}"><div ${attributesToAdd}>Q${index}</div></td>`;

        index += 1;
        month += 3;
      }

      tableQuartersHTML += '</tr>';
    } while (index <= 4);

    const calendarHTML = `
      <table>
        <tbody>
          ${tableQuartersHTML}
        </tbody>
      </table>
    `;

    return calendarHTML;
  }

  /**
   * Method used to generate the calendar used for the semesters granularity that displays
   * the semesters of a year
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateSemestersCalendar(date) {
    const day = 1;
    let month = 1;
    const year = new Date(date).getFullYear();

    let tableSemestersHTML = '';

    for (let i = 1; i <= 2; i++) {
      const dateValue = `${year}-${month}-${day}`;
      const dateObject = new Date(dateValue);
      const attributesToAdd = this.#getCalendarCellAttributesToAdd(dateObject);

      tableSemestersHTML += `<td class="calendar-clickable-cell" data-value="${dateValue}"><div ${attributesToAdd}>H${i}</div></td>`;

      month += 6;
    }

    const calendarHTML = `
      <table>
        <tbody>
          <tr>
            ${tableSemestersHTML}
          </tr>
        </tbody>
      </table>
    `;

    return calendarHTML;
  }

  /**
   * Method used to generate the calendar used for the years granularity that displays
   * the years
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateYearsCalendar(date) {
    const day = 1;
    const month = 1;
    const dateYear = new Date(date).getFullYear();
    const tableFirstYear = dateYear - 6;
    const tableLastYear = dateYear + 5;
    let year = tableFirstYear;

    let tableYearsHTML = '';

    do {
      tableYearsHTML += '<tr>';

      for (let j = 0; j < 3; j++) {
        const dateValue = `${year}-${month}-${day}`;
        const dateObject = new Date(dateValue);
        const attributesToAdd = this.#getCalendarCellAttributesToAdd(dateObject);

        tableYearsHTML += `<td class="calendar-clickable-cell" data-value="${dateValue}"><div ${attributesToAdd}>${year}</div></td>`;

        year += 1;
      }

      tableYearsHTML += '</tr>';
    } while (year <= tableLastYear);

    const calendarHTML = `
      <table>
        <tbody>
          ${tableYearsHTML}
        </tbody>
      </table>
    `;

    return calendarHTML;
  }

  /**
   * Method that takes care of getting the calendar cell attributes that we will have
   * to add to the cell of the table, like if the cell is disabled, in range or selected.
   * @param {Object} dateObject The date to check
   * @returns {String} The DOM attributes that have to be attached to the DOM element
   */
  #getCalendarCellAttributesToAdd(dateObject) {
    const disabled = this.#getIfCalendarElementDisabled(dateObject);
    const { selected, selectedStartDateIsSame, selectedEndDateIsSame } = this.#getIfCalendarElementSelected(dateObject);
    let dateInRange = '';
    let startDateWhenRange = '';
    let endDateWhenRange = '';

    if (!this.singleCalendar && this.#timesClickedDate === 0) {
      if (selected === 'selected') {
        if (selectedStartDateIsSame && !selectedEndDateIsSame) {
          startDateWhenRange = 'startDate';
        }

        if (selectedEndDateIsSame && !selectedStartDateIsSame) {
          endDateWhenRange = 'endDate';
        }
      }

      const dateInBetween =
        !selectedStartDateIsSame &&
        this.selectedStartDate.valueOf() < dateObject.valueOf() &&
        !selectedEndDateIsSame &&
        dateObject.valueOf() < this.selectedEndDate.valueOf();
      dateInRange = dateInBetween ? 'dateInRange' : '';
    }

    const attributesToAdd = `class="${dateInRange} ${startDateWhenRange} ${endDateWhenRange}" ${disabled} ${selected}`;

    return attributesToAdd;
  }

  /**
   * Method that takes care of setting the state of the arrows to disable or enable them.
   * This method is only called when the user clicks a range list element
   */
  #setStateOfCalendarArrows() {
    const {
      startDateEqualsMinDate,
      startDateEqualsMaxDate,
      endDateEqualsMinDate,
      endDateEqualsMaxDate,
      startDateEqualsEndDate,
    } = this.#checkDatesToRenderArrows();

    const leftCalendarPreviousArrow = this.calendarContainer.querySelector('.left-calendar-previous-arrow');
    const leftCalendarNextArrow = this.calendarContainer.querySelector('.left-calendar-next-arrow');
    const rightCalendarPreviousArrow = this.calendarContainer.querySelector('.right-calendar-previous-arrow');
    const rightCalendarNextArrow = this.calendarContainer.querySelector('.right-calendar-next-arrow');

    let display = startDateEqualsMinDate ? 'none' : 'flex';
    leftCalendarPreviousArrow.style.display = display;

    display = startDateEqualsEndDate || startDateEqualsMaxDate ? 'none' : 'flex';
    leftCalendarNextArrow.style.display = display;

    if (!this.singleCalendar) {
      display = startDateEqualsEndDate || endDateEqualsMinDate ? 'none' : 'flex';
      rightCalendarPreviousArrow.style.display = display;

      display = endDateEqualsMaxDate ? 'none' : 'flex';
      rightCalendarNextArrow.style.display = display;
    }
  }

  /**
   * Method that takes care of checking different operations with the dates in order
   * to know of the arrows have to be hidden or shown
   * @returns {Object} Object with different booleans checking different dates checks
   */
  #checkDatesToRenderArrows() {
    let startDateEqualsMinDate = false;
    let startDateEqualsMaxDate = false;
    let endDateEqualsMinDate = false;
    let endDateEqualsMaxDate = false;
    let startDateEqualsEndDate = false;
    const granularity = this.#calendarGranularity;

    if (this.minDate) {
      startDateEqualsMinDate = this.#checkIfDatesFromSameGranularityPeriod(
        this.currentStartDate,
        this.minDate,
        granularity
      );

      if (this.currentEndDate && !this.singleCalendar) {
        endDateEqualsMinDate = this.#checkIfDatesFromSameGranularityPeriod(
          this.currentEndDate,
          this.minDate,
          granularity
        );
      }
    }

    if (this.maxDate) {
      startDateEqualsMaxDate = this.#checkIfDatesFromSameGranularityPeriod(
        this.currentStartDate,
        this.maxDate,
        granularity
      );

      if (this.currentEndDate && !this.singleCalendar) {
        endDateEqualsMaxDate = this.#checkIfDatesFromSameGranularityPeriod(
          this.currentEndDate,
          this.maxDate,
          granularity
        );
      }
    }

    if (this.currentEndDate && !this.singleCalendar) {
      startDateEqualsEndDate = this.#checkIfDatesFromSameGranularityPeriod(
        this.currentStartDate,
        this.currentEndDate,
        granularity
      );
    }

    return {
      startDateEqualsMinDate,
      startDateEqualsMaxDate,
      endDateEqualsMinDate,
      endDateEqualsMaxDate,
      startDateEqualsEndDate,
    };
  }

  /**
   * Method to change the rendered calendar of the clicked side, this method runs when the user clicks the
   * arrows rendered on the calendars
   * @param {Object} event The click object that contains the info of the event
   */
  #changeRenderedCalendar(event) {
    event.stopPropagation();
    const clickedArrow = event.target.closest('.calendar-arrow');
    const isLeftCalendar = clickedArrow.className.includes('left');
    const isPreviousArrow = clickedArrow.className.includes('previous');

    let dateToUse = this.currentStartDate;
    let calendarToUse = this.startCalendar;

    // If is the right calendar
    if (!isLeftCalendar) {
      dateToUse = this.currentEndDate;
      calendarToUse = this.endCalendar;
    }

    let newDateToRender = this.#calculateNewDate(dateToUse, isPreviousArrow);
    newDateToRender = new Date(newDateToRender);

    if (isLeftCalendar) {
      this.currentStartDate = new Date(newDateToRender);
    } else {
      this.currentEndDate = new Date(newDateToRender);
    }

    const calendarSide = isLeftCalendar ? 'left' : 'right';
    const calendarHTML = this.#generateCalendar(newDateToRender, calendarSide);
    calendarToUse.innerHTML = calendarHTML;
    this.#attachClickCellEvent(calendarToUse, calendarSide);

    const {
      startDateEqualsMinDate,
      startDateEqualsMaxDate,
      endDateEqualsMinDate,
      endDateEqualsMaxDate,
      startDateEqualsEndDate,
    } = this.#checkDatesToRenderArrows();

    // Cases when the clicked arrow is from the left calendar
    if (isLeftCalendar) {
      // Cases to disable arrows

      /*
        1st .- The user clicked the previous arrow and the start date equals the min date (hide 'previous' arrow)
        The user clicked the next arrow:
          2nd .- The start date equals the end date (hide 'next' arrow)
          3rd .- The start date equals the max date (hide 'next' arrow)
      */
      if (
        (isPreviousArrow && startDateEqualsMinDate) ||
        (!isPreviousArrow && startDateEqualsEndDate) ||
        (!isPreviousArrow && startDateEqualsMaxDate)
      ) {
        clickedArrow.style.display = 'none';
      }

      // Cases to enable arrows

      // The user clicked the previous arrow (enables the 'next' arrow)
      if (isPreviousArrow) {
        const nextArrow = this.calendarContainer.querySelector('.left-calendar-next-arrow');
        nextArrow.style.display = 'flex';

        if (!this.singleCalendar) {
          const rightCalendarPreviousArrow = this.calendarContainer.querySelector('.right-calendar-previous-arrow');
          rightCalendarPreviousArrow.style.display = 'flex';
        }
      }

      if (!isPreviousArrow) {
        const previousArrow = this.calendarContainer.querySelector('.left-calendar-previous-arrow');
        previousArrow.style.display = 'flex';

        /* 
          In the case that the next arrow is clicked in the left calendar and the
          start and end date are equal, the previous arrow in the right calendar has to be
          disabled too
        */
        if (!this.singleCalendar && startDateEqualsEndDate) {
          const rightCalendarPreviousArrow = this.calendarContainer.querySelector('.right-calendar-previous-arrow');
          rightCalendarPreviousArrow.style.display = 'none';
        }
      }
    }

    // Cases when the clicked arrow is from the right calendar
    if (!isLeftCalendar) {
      // Cases to disable arrows

      /*
        1st .- The user clicked the previous arrow and the end date equals the min date (hide 'previous' arrow)
        2nd .- The user clicked the previous arrow and the end date equals the start date (hide 'previous' arrow)
        3rd .- The user clicked the next arrow the end date equals the max date (hide 'next' arrow)
      */
      if (
        (isPreviousArrow && endDateEqualsMinDate) ||
        (isPreviousArrow && startDateEqualsEndDate) ||
        (!isPreviousArrow && endDateEqualsMaxDate)
      ) {
        clickedArrow.style.display = 'none';
      }

      // Cases to enable arrows

      // The user clicked the previous arrow (enables the 'next' arrow)
      if (isPreviousArrow) {
        const nextArrow = this.calendarContainer.querySelector('.right-calendar-next-arrow');
        nextArrow.style.display = 'flex';

        /* 
          In the case that the previous arrow is clicked in the right calendar and the
          start and end date are equal, the next arrow in the left calendar has to be
          disabled too
        */
        if (startDateEqualsEndDate) {
          const leftCalendarNextArrow = this.calendarContainer.querySelector('.left-calendar-next-arrow');
          leftCalendarNextArrow.style.display = 'none';
        }
      }

      if (!isPreviousArrow) {
        const previousArrow = this.calendarContainer.querySelector('.right-calendar-previous-arrow');
        previousArrow.style.display = 'flex';

        const leftCalendarNextArrow = this.calendarContainer.querySelector('.left-calendar-next-arrow');
        leftCalendarNextArrow.style.display = 'flex';
      }
    }
  }

  /**
   * Method that takes care of calculating the new date we have to render
   * in one of the calendar
   * @param {Object} dateToUse The date we want to use to calculate the new date
   * @param {Boolean} isPreviousArrow Indicates if we are handeling the case of one of the previous arrows
   * @returns {Number} Timestamp of the new date calculate
   */
  #calculateNewDate(dateToUse, isPreviousArrow) {
    let newDateToRender;

    switch (this.#calendarGranularity) {
      case 'hour':
      case 'day':
      case 'week': {
        const newMonth = isPreviousArrow ? dateToUse.getMonth() - 1 : dateToUse.getMonth() + 1;
        newDateToRender = new Date(new Date(dateToUse).setDate(1)).setMonth(newMonth);
        break;
      }
      case 'month':
      case 'quarter':
      case 'semester': {
        const newYear = isPreviousArrow ? dateToUse.getFullYear() - 1 : dateToUse.getFullYear() + 1;
        newDateToRender = new Date(dateToUse).setFullYear(newYear);
        break;
      }
      case 'year':
        const newYear = isPreviousArrow ? dateToUse.getFullYear() - 10 : dateToUse.getFullYear() + 10;
        newDateToRender = new Date(dateToUse).setFullYear(newYear);
        break;
    }

    return newDateToRender;
  }

  /**
   * Method that takes care of attaching the click event to the cells in the calendar
   * that contains the dates
   * @param {Object} calendarElement The DOM element of the calendar
   * @param {String} calendarSide The side of the calendar calling this method
   */
  #attachClickCellEvent(calendarElement, calendarSide) {
    const listOfDateCells = calendarElement.querySelectorAll('.calendar-clickable-cell');

    const clickEventFnct = (event) => {
      event.stopPropagation();

      if (this.granularity !== this.#calendarGranularity) {
        let newGranularity = this.granularity;

        if (['month', 'quarter', 'semester'].includes(this.granularity)) {
          newGranularity = this.granularity;
        } else if (this.#calendarGranularity === 'year' && ['hour', 'day', 'week'].includes(this.granularity)) {
          newGranularity = 'month';
        }

        const dateClicked = event.target.parentElement.getAttribute('data-value');
        if (calendarSide === 'left') {
          this.currentStartDate = new Date(dateClicked);
        } else {
          this.currentEndDate = new Date(dateClicked);
        }

        this.#calendarGranularity = newGranularity;

        if (this.#calendarGranularity === 'hour') {
          this.#changeDisplayOfCalendarFooterContainers('flex');
        }

        this.#populateStartCalendar();
        if (!this.singleCalendar) {
          this.#populateEndCalendar();
        }
        this.#setStateOfCalendarArrows();
        return;
      }

      this.#saveClickedDate(event);
    };

    listOfDateCells.forEach((dateCell) => {
      dateCell.addEventListener('click', clickEventFnct);
    });
  }

  /**
   * Method that takes care of saving the clicked date, this method runs when the user clicks
   * a cell containing a date
   * @param {Object} event The click object that contains the info of the event
   */
  #saveClickedDate(event) {
    let dateClicked = event.target.parentElement.getAttribute('data-value');
    if (!dateClicked) {
      return;
    }

    let { startHours, startMinutes, endHours, endMinutes } = this.#getSelectedStartAndEndHoursMinutes();

    if (this.singleCalendar || this.#timesClickedDate === 0) {
      if (this.granularity === 'hour') {
        const isStartEqualMax = this.#checkIfDatesSameDay(new Date(dateClicked), this.maxDate);
        const isStartEqualEnd = this.#checkIfDatesSameDay(new Date(dateClicked), this.selectedEndDate);
        const isStartEqualMin = this.#checkIfDatesSameDay(new Date(dateClicked), this.minDate);
        const maxDateHours = this.maxDate ? this.maxDate.getHours() : false;
        const maxDateMinutes = this.maxDate ? this.maxDate.getMinutes() : false;
        const minDateHours = this.minDate ? this.minDate.getHours() : false;
        const minDateMinutes = this.minDate ? this.minDate.getMinutes() : false;

        // Start Date hours or minutes smaller than Min Date
        if (this.minDate && isStartEqualMin) {
          if (parseInt(startHours) < minDateHours) {
            startHours = minDateHours;
          }

          if (`${startHours}` === `${minDateHours}` && this.selectedStartDate.getMinutes() < minDateMinutes) {
            startMinutes = minDateMinutes;
          }
        }

        // Start Date hours or minutes bigger than End Date or Max Date
        if (this.singleCalendar && this.maxDate && isStartEqualMax) {
          if (parseInt(startHours) > maxDateHours) {
            startHours = maxDateHours;
          }

          if (`${startHours}` === `${maxDateHours}` && this.selectedStartDate.getMinutes() > maxDateMinutes) {
            startMinutes = maxDateMinutes;
          }
        } else if (!this.singleCalendar && isStartEqualEnd) {
          if (parseInt(startHours) > parseInt(endHours)) {
            startHours = endHours;
          }

          if (`${startHours}` === `${endHours}` && this.selectedStartDate.getMinutes() > parseInt(endMinutes)) {
            startMinutes = endMinutes;
          }
        }

        startHours = this.#verifyDateElementHasTwoDigits(startHours);
        startMinutes = this.#verifyDateElementHasTwoDigits(startMinutes);
        dateClicked += ` ${startHours}:${startMinutes}`;
      }

      this.selectedStartDate = new Date(dateClicked);
      this.#timesClickedDate = 1;
      this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
      this.#populateStartCalendar();
      if (!this.singleCalendar) {
        this.#populateEndCalendar();
      }
      this.#populateTimePickers();

      if (this.singleCalendar && this.showFastNavigationArrows) {
        this.#setStateOfFastNavigationArrow(this.selectedStartDate, true);
        this.#setStateOfFastNavigationArrow(this.selectedStartDate, false);
      }

      if (this.changeStartDateCallback) {
        this.changeStartDateCallback();
      }
      return;
    }

    if (this.granularity === 'hour') {
      const isEndEqualMax = this.#checkIfDatesSameDay(new Date(dateClicked), this.maxDate);
      const isEndEqualStart = this.#checkIfDatesSameDay(new Date(dateClicked), this.selectedStartDate);
      const maxDateHours = this.maxDate ? this.maxDate.getHours() : false;
      const maxDateMinutes = this.maxDate ? this.maxDate.getMinutes() : false;

      // End Date hours or minutes smaller than Start Date
      if (isEndEqualStart) {
        if (parseInt(endHours) < parseInt(startHours)) {
          endHours = startHours;
        }

        if (`${endHours}` === `${startHours}` && this.selectedEndDate.getMinutes() < parseInt(startMinutes)) {
          endMinutes = startMinutes;
        }
      }

      // End Date hours or minutes bigger than Max Date
      if (this.maxDate && isEndEqualMax) {
        if (parseInt(endHours) > maxDateHours) {
          endHours = maxDateHours;
        }

        if (`${endHours}` === `${maxDateHours}` && this.selectedEndDate.getMinutes() > maxDateMinutes) {
          endMinutes = maxDateMinutes;
        }
      }

      dateClicked += ` ${endHours}:${endMinutes}`;
    }

    this.selectedEndDate = new Date(dateClicked);

    // Case where new selectedEndDate is smaller than selectedStartDate
    const selectedEndDateSmaller = this.#checkIfFirstDateSmaller(this.selectedEndDate, this.selectedStartDate);
    if (selectedEndDateSmaller) {
      this.selectedEndDate = this.selectedStartDate;
      this.selectedStartDate = new Date(dateClicked);

      this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    }

    this.#timesClickedDate = 0;
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
    this.#populateStartCalendar();
    this.#populateEndCalendar();
    this.#populateTimePickers();

    if (this.changeEndDateCallback) {
      this.changeEndDateCallback();
    }
  }

  /**
   * Method that takes care of grabing the title elements like the month name or year
   * and attach the click event to be able to navigate between granularities
   * @param {Object} calendarTitleElement The DOM element of the whole calendar title
   */
  #attachClickCalendarTitleEvent(calendarTitleElement) {
    const listOfTitleElements = calendarTitleElement.querySelectorAll('.calendarTitleElement');

    const clickEventFnct = (event) => {
      event.stopPropagation();

      const clickedValue = event.target.getAttribute('data-value');
      if (clickedValue === 'year' && this.#calendarGranularity === 'year') {
        return;
      }

      this.#calendarGranularity = clickedValue;

      if (this.#calendarGranularity !== 'hour') {
        this.#changeDisplayOfCalendarFooterContainers('none');
      }

      this.#populateStartCalendar();
      if (!this.singleCalendar) {
        this.#populateEndCalendar();
      }
      this.#setStateOfCalendarArrows();
    };

    listOfTitleElements.forEach((titleElement) => {
      titleElement.addEventListener('click', clickEventFnct);
    });
  }

  //#endregion

  /**
   * Method that takes care of populate the calendar display with the selected date
   * @param {Object} date The date object we are going to work with
   * @param {String} calendarSide The side of the calendar we have to populate
   */
  #setDateCalendarDisplay(date, calendarSide) {
    const dateFormatted = this.getDateFormattedByGranularity(date);

    let dateCalendarDisplayElement = this.selectedStartDateElement;

    if (calendarSide === 'right') {
      dateCalendarDisplayElement = this.selectedEndDateElement;
    }

    dateCalendarDisplayElement.innerHTML = dateFormatted.date;
  }

  //#region Ranges Logics

  /**
   * Method that takes care of populate the ranges
   */
  #populateRangesContainer() {
    if (this.hideRanges) {
      this.rangesContainer.style.display = 'none';
      return;
    }

    if (this.appendToDefaultRanges) {
      const updatedRanges = [...this.ranges];

      for (let i = 0; i < this.customRanges.length; i++) {
        const customRange = this.customRanges[i];
        if (customRange.position) {
          updatedRanges.splice(customRange.position, 0, customRange);
        } else {
          updatedRanges.push(customRange);
        }
      }

      this.ranges = updatedRanges;
    } else if (this.customRanges.length) {
      this.ranges = this.customRanges;
    }

    let listOfRangesHTML = `<ul class="calendar-ranges-list">`;

    for (let i = 0; i < this.ranges.length; i++) {
      let range = this.ranges[i];
      const isHidden = this.hiddenRanges.some((rangeToHide) => rangeToHide === range.label);
      const isDisabled = this.disabledRanges.some((rangeToDisable) => rangeToDisable === range.label);
      const style = isHidden ? 'style="display: none"' : '';
      const disabledAttr = isDisabled ? 'disabled' : '';

      listOfRangesHTML += `<li class="calendar-ranges-list-element" ${style} ${disabledAttr}>${range.label}</li>`;
    }

    listOfRangesHTML += `</ul>`;
    this.rangesContainer.innerHTML = listOfRangesHTML;

    const listElements = this.rangesContainer.querySelectorAll('.calendar-ranges-list-element');

    listElements.forEach((listElement) =>
      listElement.addEventListener('click', (event) => this.#clickRangeListElementEvent(event))
    );
  }

  #clickRangeListElementEvent(event) {
    const listRangeElement = event.target;
    const rangeText = listRangeElement.innerText;
    const rangeObj = this.ranges.find((range) => range.label === rangeText);

    if (!rangeObj) {
      return;
    }

    const isMinDateBigger = this.#checkIfFirstDateBigger(this.minDate, rangeObj.startDate);
    const isMaxDateSmaller = this.#checkIfFirstDateSmaller(this.maxDate, rangeObj.endDate);

    if (isMinDateBigger) {
      rangeObj.startDate = this.minDate;

      const isStartBigger = this.#checkIfFirstDateBigger(rangeObj.startDate, rangeObj.endDate);
      if (isStartBigger) {
        rangeObj.endDate = rangeObj.startDate;
      }
    }

    if (isMaxDateSmaller) {
      rangeObj.endDate = this.maxDate;

      const isEndSmaller = this.#checkIfFirstDateSmaller(rangeObj.endDate, rangeObj.startDate);
      if (isEndSmaller) {
        rangeObj.startDate = rangeObj.endDate;
      }
    }

    this.startDate = rangeObj.startDate;
    this.currentStartDate = rangeObj.startDate;
    this.selectedStartDate = rangeObj.startDate;

    this.endDate = rangeObj.endDate;
    this.currentEndDate = rangeObj.endDate;
    this.selectedEndDate = rangeObj.endDate;

    this.#timesClickedDate = 0;
    this.#calendarGranularity = this.granularity;

    this.#populateStartCalendar();
    this.#populateEndCalendar();
    this.#setStateOfCalendarArrows();
    this.#populateTimePickers();
    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');

    if (this.changeStartDateCallback) {
      this.changeStartDateCallback();
    }

    if (this.changeEndDateCallback) {
      this.changeEndDateCallback();
    }
  }

  //#endregion

  //#region Granularity Dropdown Logics

  #attachOnChangeGranularityDropdownEvent() {
    this.granularityDropdown.addEventListener('change', (event) => {
      const selectedGranularity = this.granularityDropdown.value;
      this.granularity = selectedGranularity;
      this.#calendarGranularity = selectedGranularity;

      this.#changingGranularityLogics();
    });
  }

  /**
   * Method that contains the logics needed when the granularity of the Date Range Picker is
   * changed
   * @param {Boolean} avoidCallbackExecution Indicates if we want to avoid the execution of the
   * changeGranularityCallback, this is mainly used to let the user choose if the want to
   * execute the callback when using the "setGranularity" method
   */
  #changingGranularityLogics(avoidCallbackExecution = false) {
    const timePickerVisibility = this.#calendarGranularity === 'hour' ? 'flex' : 'none';
    this.#changeDisplayOfCalendarFooterContainers(timePickerVisibility);
    this.#populateStartCalendar();
    this.#setStateOfCalendarArrows();
    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    if (!this.singleCalendar) {
      this.#populateEndCalendar();
      this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
    }

    if (this.singleCalendar && this.showFastNavigationArrows) {
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, true);
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, false);
    }

    if (this.changeGranularityCallback && !avoidCallbackExecution) {
      this.changeGranularityCallback();
    }
  }

  //#endregion

  //#region Hours and Minutes Dropdowns Logics

  /**
   * Method that takes care of showing or hiding the hours and minutes dropdowns when
   * the hour granularity is available and we move between granularities
   * @param {String} display The CSS display value (none|flex)
   */
  #changeDisplayOfCalendarFooterContainers(display) {
    const timePickerContainers = this.container.querySelectorAll('.calendar-footer');
    timePickerContainers.forEach((timePickerContainer) => {
      timePickerContainer.style.display = display;
    });
  }

  /**
   * Method that takes care of populating the hours and minute dropdowns
   * of the hour granularity
   */
  #populateTimePickers() {
    const hoursFormat = '24h';
    const startDateHoursDropdown = this.container.querySelector('.start-date-hours-dropdown');
    const startDateMinutesDropdown = this.container.querySelector('.start-date-minutes-dropdown');
    const endDateHoursDropdown = this.container.querySelector('.end-date-hours-dropdown');
    const endDateMinutesDropdown = this.container.querySelector('.end-date-minutes-dropdown');

    startDateHoursDropdown.innerHTML = '';
    startDateMinutesDropdown.innerHTML = '';
    if (endDateHoursDropdown) {
      endDateHoursDropdown.innerHTML = '';
      endDateMinutesDropdown.innerHTML = '';
    }

    const isStartEqualMin = this.#checkIfDatesSameDay(this.selectedStartDate, this.minDate);
    const isEndEqualMin = this.#checkIfDatesSameDay(this.selectedEndDate, this.minDate);
    const isStartEqualMax = this.#checkIfDatesSameDay(this.selectedStartDate, this.maxDate);
    const isEndEqualMax = this.#checkIfDatesSameDay(this.selectedEndDate, this.maxDate);
    const isStartEqualEnd = this.#checkIfDatesSameDay(this.selectedStartDate, this.selectedEndDate);

    const startDateHour = this.selectedStartDate.getHours();
    const startDateMinutes = this.selectedStartDate.getMinutes();
    const endDateHour = this.selectedEndDate.getHours();
    const endDateMinutes = this.selectedEndDate.getMinutes();
    const minDateHour = isStartEqualMin || isEndEqualMin ? this.minDate.getHours() : null;
    const minDateMinutes = isStartEqualMin || isEndEqualMin ? this.minDate.getMinutes() : null;
    const maxDateHour = isStartEqualMax || isEndEqualMax ? this.maxDate.getHours() : null;
    const maxDateMinutes = isStartEqualMax || isEndEqualMax ? this.maxDate.getMinutes() : null;

    for (let i = 0; i < 24; i++) {
      const hour = this.#verifyDateElementHasTwoDigits(i);
      const startOptionElement = document.createElement('option', { value: i });
      startOptionElement.innerText = hour;

      // If hour is the same as the hour of the start date, set as selected
      const startIsSelected = i === startDateHour;
      if (startIsSelected) {
        startOptionElement.setAttribute('selected', 'selected');
      }

      if (
        (isStartEqualMin && i < minDateHour) ||
        (isStartEqualMax && i > maxDateHour) ||
        (!this.singleCalendar && isStartEqualEnd && i > endDateHour)
      ) {
        startOptionElement.setAttribute('disabled', true);
      }

      startDateHoursDropdown.appendChild(startOptionElement);

      const endOptionElement = document.createElement('option', { value: i });
      endOptionElement.innerText = hour;

      // If hour is the same as the hour of the end date, set as selected
      const endIsSelected = i === endDateHour;
      if (endIsSelected) {
        endOptionElement.setAttribute('selected', 'selected');
      }

      if (
        (isEndEqualMin && i < minDateHour) ||
        (isEndEqualMax && i > maxDateHour) ||
        (isStartEqualEnd && i < startDateHour)
      ) {
        endOptionElement.setAttribute('disabled', true);
      }

      if (endDateHoursDropdown) {
        endDateHoursDropdown.appendChild(endOptionElement);
      }
    }

    for (let i = 0; i < 60; i++) {
      const minute = this.#verifyDateElementHasTwoDigits(i);
      const startOptionElement = document.createElement('option', { value: i });
      startOptionElement.innerText = minute;

      // If minute is the same as the minute of the start date, set as selected
      const startIsSelected = i === startDateMinutes;
      if (startIsSelected) {
        startOptionElement.setAttribute('selected', 'selected');
      }

      if (
        (isStartEqualMin && startDateHour === minDateHour && i < minDateMinutes) ||
        (isStartEqualMax && startDateHour === maxDateHour && i > maxDateMinutes) ||
        (!this.singleCalendar && isStartEqualEnd && startDateHour === endDateHour && i > endDateMinutes)
      ) {
        startOptionElement.setAttribute('disabled', true);
      }

      startDateMinutesDropdown.appendChild(startOptionElement);

      const endOptionElement = document.createElement('option', { value: i });
      endOptionElement.innerText = minute;

      // If minute is the same as the minute of the end date, set as selected
      const endIsSelected = i === endDateMinutes;
      if (endIsSelected) {
        endOptionElement.setAttribute('selected', 'selected');
      }

      if (
        (isEndEqualMin && endDateHour === minDateHour && i < minDateMinutes) ||
        (isEndEqualMax && endDateHour === maxDateHour && i > maxDateMinutes) ||
        (isStartEqualEnd && startDateHour === endDateHour && i < startDateMinutes)
      ) {
        endOptionElement.setAttribute('disabled', true);
      }

      if (endDateMinutesDropdown) {
        endDateMinutesDropdown.appendChild(endOptionElement);
      }
    }
  }

  #attachOnChangeHoursMinutesDropdownsEvent() {
    const hoursMinutesDropdownsElements = this.container.querySelectorAll('.calendar-time-picker select');
    hoursMinutesDropdownsElements.forEach((dropdownElement) => {
      dropdownElement.addEventListener('change', (event) => {
        const target = event.target;
        const value = target.value;
        const targetClass = target.classList.value;
        const isStart = targetClass.includes('start');
        const isHours = targetClass.includes('hours');

        if (isStart) {
          const currentStartDate = this.selectedStartDate;
          let modifiedDate = isHours ? currentStartDate.setHours(value) : currentStartDate.setMinutes(value);
          this.selectedStartDate = new Date(modifiedDate);

          /* 
            Let's handle the case where the selected start hour is the same as the end hour,
            the day is the same and the minutes set in the end calendar are smaller than the
            current start date minutes
          */
          const { startHours, endHours, endMinutes } = this.#getSelectedStartAndEndHoursMinutes();
          const isStartEqualEnd = this.#checkIfDatesSameDay(this.selectedStartDate, this.selectedEndDate);

          if (
            isStartEqualEnd &&
            startHours === endHours &&
            this.selectedStartDate.getMinutes() > parseInt(endMinutes)
          ) {
            this.selectedStartDate = new Date(this.selectedStartDate.setMinutes(endMinutes));
          }

          /*
            Let's handle the case where the selected start hour is the same as the min hour,
            the day is the same and the minutes set in the start calendar are smaller than the min date
            minutes
          */
          const isStartEqualmin = this.#checkIfDatesSameDay(this.selectedStartDate, this.minDate);
          const minDateHours = this.minDate ? this.minDate.getHours() : false;
          const minDateMinutes = this.minDate ? this.minDate.getMinutes() : false;

          if (
            this.minDate &&
            isStartEqualmin &&
            parseInt(startHours) === minDateHours &&
            this.selectedStartDate.getMinutes() < minDateMinutes
          ) {
            this.selectedStartDate = new Date(this.selectedStartDate.setMinutes(minDateMinutes));
          }

          const isStartEqualMax = this.#checkIfDatesSameDay(this.selectedStartDate, this.maxDate);
          const maxDateHours = this.maxDate ? this.maxDate.getHours() : false;
          const maxDateMinutes = this.maxDate ? this.maxDate.getMinutes() : false;

          /*
            This only happens for the single calendar.
            Let's handle the case where the selected start hour is the same as the max hour,
            the date is the same and the minutes of the max date are smaller than the current
            start date minutes.
          */
          if (
            this.singleCalendar &&
            this.maxDate &&
            isStartEqualMax &&
            parseInt(startHours) === maxDateHours &&
            this.selectedStartDate.getMinutes() > maxDateMinutes
          ) {
            this.selectedStartDate = new Date(this.selectedStartDate.setMinutes(maxDateMinutes));
          }
        } else {
          const currentEndDate = this.selectedEndDate;
          const modifiedDate = isHours ? currentEndDate.setHours(value) : currentEndDate.setMinutes(value);
          this.selectedEndDate = new Date(modifiedDate);

          /* 
            Let's handle the case where the selected end hour is the same as the start hour,
            the day is the same and the minutes set in the start calendar are bigger than the
            current end date minutes
          */
          const { startHours, startMinutes, endHours } = this.#getSelectedStartAndEndHoursMinutes();
          const isEndEqualStart = this.#checkIfDatesSameDay(this.selectedEndDate, this.selectedStartDate);

          if (
            isEndEqualStart &&
            endHours === startHours &&
            this.selectedEndDate.getMinutes() < parseInt(startMinutes)
          ) {
            this.selectedEndDate = new Date(this.selectedEndDate.setMinutes(startMinutes));
          }

          const isEndEqualMax = this.#checkIfDatesSameDay(this.selectedEndDate, this.maxDate);
          const maxDateHours = this.maxDate ? this.maxDate.getHours() : false;
          const maxDateMinutes = this.maxDate ? this.maxDate.getMinutes() : false;

          if (
            this.maxDate &&
            isEndEqualMax &&
            parseInt(endHours) === maxDateHours &&
            this.selectedEndDate.getMinutes() > maxDateMinutes
          ) {
            this.selectedEndDate = new Date(this.selectedEndDate.setMinutes(maxDateMinutes));
          }
        }

        this.#populateTimePickers();
        this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
        this.#setDateCalendarDisplay(this.selectedEndDate, 'right');

        if (isStart && this.changeStartDateCallback) {
          this.changeStartDateCallback();
        } else if (this.changeEndDateCallback) {
          this.changeEndDateCallback();
        }
      });
    });
  }

  #getSelectedStartAndEndHoursMinutes() {
    const startDateHoursDropdown = this.container.querySelector('.start-date-hours-dropdown');
    const startDateMinutesDropdown = this.container.querySelector('.start-date-minutes-dropdown');
    const endDateHoursDropdown = this.container.querySelector('.end-date-hours-dropdown');
    const endDateMinutesDropdown = this.container.querySelector('.end-date-minutes-dropdown');

    return {
      startHours: startDateHoursDropdown.value,
      startMinutes: startDateMinutesDropdown.value,
      endHours: endDateHoursDropdown ? endDateHoursDropdown.value : '',
      endMinutes: endDateMinutesDropdown ? endDateMinutesDropdown.value : '',
    };
  }

  //#endregion

  /**
   * Method that returns if a date cell is disabled taking into account the
   * min and max date and the listOfDisabledDates
   * @param {Object} date The date to check
   * @returns {String} The attribute that will be added to the DOM element
   */
  #getIfCalendarElementDisabled(date) {
    let disabled = '';

    if (this.listOfDisabledDates.length && this.#calendarGranularity === this.granularity) {
      let dateIsInTheDisabledDates = false;
      const formattedDateByGranularity = this.getDateFormattedByGranularity(date).date;

      if (this.granularity === 'hour') {
        for (let i = 0; i < this.listOfDisabledDates.length; i++) {
          let disabledDate = this.listOfDisabledDates[i];

          if (formattedDateByGranularity.includes(disabledDate)) {
            dateIsInTheDisabledDates = true;
          }
        }
      } else {
        dateIsInTheDisabledDates = this.listOfDisabledDates.includes(formattedDateByGranularity);
      }

      if (dateIsInTheDisabledDates) {
        disabled = 'disabled';
      }
    }

    if ((!this.minDate && !this.maxDate) || disabled === 'disabled') {
      return disabled;
    }

    switch (this.#calendarGranularity) {
      case 'hour':
      case 'day': {
        const isMinDateSameDay = this.#checkIfDatesSameDay(this.minDate, date);
        const isMaxDateSameDay = this.#checkIfDatesSameDay(this.maxDate, date);
        const isMinDateBigger = this.#checkIfFirstDateBigger(this.minDate, date);
        const isMaxDateSmaller = this.#checkIfFirstDateSmaller(this.maxDate, date);

        if (!isMinDateSameDay && !isMaxDateSameDay && (isMinDateBigger || isMaxDateSmaller)) {
          disabled = 'disabled';
        }
        break;
      }
      case 'week': {
        const dateWeek = this.#getWeekInfoOfDate(date);
        const minDateWeek = this.#getWeekInfoOfDate(this.minDate);
        const maxDateWeek = this.#getWeekInfoOfDate(this.maxDate);
        let isMinDateBigger = false;
        let isMaxDateSmaller = false;

        if (minDateWeek) {
          const { week, year } = minDateWeek;
          isMinDateBigger = (dateWeek.week < week && dateWeek.year === year) || dateWeek.year < year;
        }

        if (maxDateWeek) {
          const { week, year } = maxDateWeek;
          isMaxDateSmaller = (dateWeek.week > week && dateWeek.year === year) || dateWeek.year > year;
        }

        if (isMinDateBigger || isMaxDateSmaller) {
          disabled = 'disabled';
        }
        break;
      }
      case 'month': {
        const dateMonth = date.getMonth();
        const dateYear = date.getFullYear();
        const minDateMonth = this.minDate ? this.minDate.getMonth() : undefined;
        const minDateYear = this.minDate ? this.minDate.getFullYear() : undefined;
        const maxDateMonth = this.maxDate ? this.maxDate.getMonth() : undefined;
        const maxDateYear = this.maxDate ? this.maxDate.getFullYear() : undefined;
        const isMinDateBigger = (dateMonth < minDateMonth && dateYear === minDateYear) || dateYear < minDateYear;
        const isMaxDateSmaller = (dateMonth > maxDateMonth && dateYear === maxDateYear) || dateYear > maxDateYear;

        if (isMinDateBigger || isMaxDateSmaller) {
          disabled = 'disabled';
        }
        break;
      }
      case 'quarter': {
        const dateMonth = this.#verifyDateElementHasTwoDigits(date.getMonth() + 1);
        const dateYear = date.getFullYear();
        const minDateMonth = this.minDate
          ? this.#verifyDateElementHasTwoDigits(this.minDate.getMonth() + 1)
          : undefined;
        const minDateYear = this.minDate ? this.minDate.getFullYear() : undefined;
        const maxDateMonth = this.maxDate
          ? this.#verifyDateElementHasTwoDigits(this.maxDate.getMonth() + 1)
          : undefined;
        const maxDateYear = this.maxDate ? this.maxDate.getFullYear() : undefined;
        const { quarter: dateQuarter } = this.#getQuarterOfMonth(dateMonth);
        const { quarter: minDateQuarter } = this.#getQuarterOfMonth(minDateMonth);
        const { quarter: maxDateQuarter } = this.#getQuarterOfMonth(maxDateMonth);
        const isMinDateBigger = (dateQuarter < minDateQuarter && dateYear === minDateYear) || dateYear < minDateYear;
        const isMaxDateSmaller = (dateQuarter > maxDateQuarter && dateYear === maxDateYear) || dateYear > maxDateYear;

        if (isMinDateBigger || isMaxDateSmaller) {
          disabled = 'disabled';
        }
        break;
      }
      case 'semester': {
        const dateMonth = this.#verifyDateElementHasTwoDigits(date.getMonth() + 1);
        const dateYear = date.getFullYear();
        const minDateMonth = this.minDate
          ? this.#verifyDateElementHasTwoDigits(this.minDate.getMonth() + 1)
          : undefined;
        const minDateYear = this.minDate ? this.minDate.getFullYear() : undefined;
        const maxDateMonth = this.maxDate
          ? this.#verifyDateElementHasTwoDigits(this.maxDate.getMonth() + 1)
          : undefined;
        const maxDateYear = this.maxDate ? this.maxDate.getFullYear() : undefined;
        const { semester: dateSemester } = this.#getSemesterOfMonth(dateMonth);
        const { semester: minDateSemester } = this.#getSemesterOfMonth(minDateMonth);
        const { semester: maxDateSemester } = this.#getSemesterOfMonth(maxDateMonth);
        const isMinDateBigger = (dateSemester < minDateSemester && dateYear === minDateYear) || dateYear < minDateYear;
        const isMaxDateSmaller = (dateSemester > maxDateSemester && dateYear === maxDateYear) || dateYear > maxDateYear;

        if (isMinDateBigger || isMaxDateSmaller) {
          disabled = 'disabled';
        }
        break;
      }
      case 'year':
        const dateYear = date.getFullYear();
        const minDateYear = this.minDate ? this.minDate.getFullYear() : undefined;
        const maxDateYear = this.maxDate ? this.maxDate.getFullYear() : undefined;
        const isMinDateBigger = dateYear < minDateYear;
        const isMaxDateSmaller = dateYear > maxDateYear;

        if (isMinDateBigger || isMaxDateSmaller) {
          disabled = 'disabled';
        }
        break;
    }

    return disabled;
  }

  /**
   * Method that returns if a date cell is selected
   * @param {Object} date The date to check
   * @returns {String} The attribute that will be added to the DOM element
   */
  #getIfCalendarElementSelected(date) {
    let selected = '';

    if (!this.selectedStartDate) {
      return selected;
    }

    const formattedSelectedStartDate = this.getDateFormattedByGranularity(this.selectedStartDate, true);
    const formattedSelectedEndDate = this.getDateFormattedByGranularity(this.selectedEndDate, true);
    const formattedDate = this.getDateFormattedByGranularity(date, true);

    if (this.#calendarGranularity === this.granularity) {
      const selectedStartDateIsSame = formattedDate.date === formattedSelectedStartDate.date;
      const selectedEndDateIsSame = !this.singleCalendar && formattedDate.date === formattedSelectedEndDate.date;

      if (selectedStartDateIsSame || selectedEndDateIsSame) {
        selected = 'selected';
      }

      return { selected, selectedStartDateIsSame, selectedEndDateIsSame };
    }

    const selectedStartYear = this.selectedStartDate.getFullYear();
    const selectedEndYear = this.selectedEndDate.getFullYear();
    const dateYear = date.getFullYear();
    let selectedStartDateIsSame;
    let selectedEndDateIsSame;

    switch (this.#calendarGranularity) {
      case 'month': {
        const selectedStartMonth = this.selectedStartDate.getMonth();
        const selectedEndMonth = this.selectedEndDate.getMonth();
        const dateMonth = date.getMonth();
        selectedStartDateIsSame = selectedStartYear === dateYear && selectedStartMonth === dateMonth;
        selectedEndDateIsSame = !this.singleCalendar && selectedEndYear === dateYear && selectedEndMonth === dateMonth;

        if (selectedStartDateIsSame || selectedEndDateIsSame) {
          selected = 'selected';
        }
        break;
      }
      case 'year': {
        selectedStartDateIsSame = selectedStartYear === dateYear;
        selectedEndDateIsSame = !this.singleCalendar && selectedEndYear === dateYear;

        if (selectedStartDateIsSame || selectedEndDateIsSame) {
          selected = 'selected';
        }
        break;
      }
    }

    return { selected, selectedStartDateIsSame, selectedEndDateIsSame };
  }

  #setStartOrEndOfDay(event) {
    const clickedButtonSide = event.target.getAttribute('data-value');
    const isEnd = clickedButtonSide === 'end';
    const hoursSelectClass = `${clickedButtonSide}-date-hours-dropdown`;
    const minutesSelectClass = `${clickedButtonSide}-date-minutes-dropdown`;
    const listOfHoursOptions = this.container.querySelectorAll(`.${hoursSelectClass} option:not([disabled])`);
    let hour = listOfHoursOptions[0].value;

    /* 
      We are first setting the hours and populating the time picker because the first hour of the day
      available could have the minutes limited, like in the case of min and max dates
    */
    if (isEnd) {
      hour = listOfHoursOptions[listOfHoursOptions.length - 1].value;

      let updatedEndDate = new Date(this.selectedEndDate.setHours(hour));
      this.selectedEndDate = updatedEndDate;
    } else {
      let updatedStartDate = new Date(this.selectedStartDate.setHours(hour));
      this.selectedStartDate = updatedStartDate;
    }

    this.#populateTimePickers();

    const listOfMinutesOptions = this.container.querySelectorAll(`.${minutesSelectClass} option:not([disabled])`);
    let minute = listOfMinutesOptions[0].value;

    if (isEnd) {
      minute = listOfMinutesOptions[listOfMinutesOptions.length - 1].value;

      let updatedEndDate = new Date(this.selectedEndDate.setMinutes(minute));
      this.selectedEndDate = updatedEndDate;
    } else {
      let updatedStartDate = new Date(this.selectedStartDate.setMinutes(minute));
      this.selectedStartDate = updatedStartDate;
    }

    this.#populateTimePickers();
    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');

    if (!isEnd && this.changeStartDateCallback) {
      this.changeStartDateCallback();
    } else if (this.changeEndDateCallback) {
      this.changeEndDateCallback();
    }
  }

  //#region Fast Navigation Arrows Logics

  #attachClickFastNavigationArrows() {
    const fastNavigationArrows = this.container.querySelectorAll('.date-range-picker-fast-navigation-arrow');
    fastNavigationArrows.forEach((fastNavigationArrow) => {
      fastNavigationArrow.addEventListener('click', (event) => this.#clickFastNavigationArrow(event));
    });
  }

  #clickFastNavigationArrow(event) {
    const targetClass = event.target.closest('.date-range-picker-fast-navigation-arrow').classList.value;
    const isLeftArrow = targetClass.includes('left-arrow');
    const arrowToShow = isLeftArrow ? 'right' : 'left';

    const arrowNotClicked = this.container.querySelector(
      `.date-range-picker-fast-navigation-arrow.${arrowToShow}-arrow`
    );
    arrowNotClicked.style.display = 'flex';

    const currentDate = new Date(this.selectedStartDate);
    let newRenderingDate = new Date();

    switch (this.granularity) {
      case 'hour':
      case 'day':
        if (isLeftArrow) {
          newRenderingDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
        } else {
          newRenderingDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
        break;
      case 'week':
        if (isLeftArrow) {
          newRenderingDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
        } else {
          newRenderingDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        }
        break;
      case 'month':
        newRenderingDate = new Date(currentDate.setDate(1));
        if (isLeftArrow) {
          newRenderingDate = new Date(newRenderingDate.setMonth(newRenderingDate.getMonth() - 1));
        } else {
          newRenderingDate = new Date(newRenderingDate.setMonth(newRenderingDate.getMonth() + 1));
        }
        break;
      case 'quarter': {
        newRenderingDate = new Date(currentDate.setDate(1));
        const month = this.#verifyDateElementHasTwoDigits(newRenderingDate.getMonth() + 1);
        const { firstMonthQuarter } = this.#getQuarterOfMonth(month);
        if (isLeftArrow) {
          const monthToSet = parseInt(firstMonthQuarter) - 2;
          newRenderingDate = new Date(newRenderingDate.setMonth(monthToSet));
        } else {
          const monthToSet = parseInt(firstMonthQuarter) + 3;
          newRenderingDate = new Date(newRenderingDate.setMonth(monthToSet));
        }
        break;
      }
      case 'semester': {
        newRenderingDate = new Date(currentDate.setDate(1));
        const month = this.#verifyDateElementHasTwoDigits(newRenderingDate.getMonth() + 1);
        const { firstMonthSemester } = this.#getSemesterOfMonth(month);
        if (isLeftArrow) {
          const monthToSet = parseInt(firstMonthSemester) - 2;
          newRenderingDate = new Date(newRenderingDate.setMonth(monthToSet));
        } else {
          const monthToSet = parseInt(firstMonthSemester) + 6;
          newRenderingDate = new Date(newRenderingDate.setMonth(monthToSet));
        }
        break;
      }
      case 'year':
        if (isLeftArrow) {
          newRenderingDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
        } else {
          newRenderingDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
        }
        break;
    }

    this.startDate = new Date(newRenderingDate);
    this.currentStartDate = this.startDate;
    this.selectedStartDate = this.startDate;

    this.#populateStartCalendar();
    this.#setStateOfCalendarArrows();
    this.#setStateOfFastNavigationArrow(newRenderingDate, isLeftArrow);
    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
  }

  /**
   * Method used to hide the fast navigation arrow base in the min date or max date and the
   * date sent as parameter
   * @param {Object} dateToCompare The date object to compare
   * @param {Boolean} isLeftArrow Just indicates if is the left arrow
   */
  #setStateOfFastNavigationArrow(dateToCompare, isLeftArrow) {
    const formattedDateToCompare = this.getDateFormattedByGranularity(dateToCompare, true).date;
    const formattedMinDate = this.minDate ? this.getDateFormattedByGranularity(this.minDate, true).date : false;
    const formattedMaxDate = this.maxDate ? this.getDateFormattedByGranularity(this.maxDate, true).date : false;

    const arrowSide = isLeftArrow ? 'left' : 'right';
    const arrowClicked = this.container.querySelector(`.date-range-picker-fast-navigation-arrow.${arrowSide}-arrow`);
    let display = 'flex';

    if (
      (isLeftArrow && formattedDateToCompare === formattedMinDate) ||
      (!isLeftArrow && formattedDateToCompare === formattedMaxDate)
    ) {
      display = 'none';
    }

    arrowClicked.style.display = display;
  }

  //#endregion

  /**
   * Method that takes care of updating the different elements of the date
   * range picker, like the calendars, the hours and minutes dropdowns, the arrows and
   * the visible inputs
   */
  #updateDateRangePickerElementsAfterUpdatingDate() {
    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    this.#setStateOfCalendarArrows();
    this.#populateStartCalendar();
    if (!this.singleCalendar) {
      this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
      this.#populateEndCalendar();
    }
    this.#populateTimePickers();

    if (this.singleCalendar && this.showFastNavigationArrows) {
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, true);
      this.#setStateOfFastNavigationArrow(this.selectedStartDate, false);
    }
  }

  /**
   * Method that takes care of updating the CSS variables of the date picker
   * using the customStyleVariables from the user
   */
  #updateStyleOfDatePicker() {
    for (const styleVariable in this.customStyleVariables) {
      if (Object.prototype.hasOwnProperty.call(this.customStyleVariables, styleVariable)) {
        const value = this.customStyleVariables[styleVariable];
        this.container.querySelector('.main-date-range-picker-container').style.setProperty(styleVariable, value);
      }
    }
  }

  //#region Util Methods

  /**
   * Method that takes care of verifying that a dateElement as two digits, in the negative case
   * we attach a 0 before the dateElement.
   * @param {String|Number} dateElement The date element we have to verify, could be a month number or day
   * @returns {String} The date element with two digits
   */
  #verifyDateElementHasTwoDigits(dateElement) {
    return ('' + dateElement).length === 1 ? `0${dateElement}` : dateElement;
  }

  /**
   * Method that takes care of checking if a date is an String, if it is we
   * create a Date object from that String
   * @param {Object|String} property The date we are going to check
   */
  #checkValidityOfDateType(property) {
    if (typeof this[property] === 'string') {
      this[property] = new Date(this[property]);
    }
  }

  /**
   * Method that takes care if a parameter of the date picker exists, if not, the
   * default value is returned
   * @param {Boolean|String|Object} parameterValue The value of the parameter
   * @param {Boolean|String|Object} defaultValue The default value that the parameter has to have
   * @returns {Boolean|String|Object} If the parameterValue is null or undefined the defaultValue is
   * returned, if not, the parameterValue
   */
  #checkIfParameterExist(parameterValue, defaultValue) {
    if (parameterValue !== null && parameterValue !== undefined) {
      return parameterValue;
    }

    return defaultValue;
  }

  /**
   * Method used to check if two dates are the same day without taking into the hours and minutes
   * @param {Object} date1 First date to compare
   * @param {Object} date2 Second date to compare
   * @returns {Boolean} Indicates if the dates are equal
   */
  #checkIfDatesSameDay(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }

    const firstDate = new Date(new Date(date1).setHours(0, 0, 0, 0));
    const secondDate = new Date(new Date(date2).setHours(0, 0, 0, 0));

    return firstDate.valueOf() === secondDate.valueOf();
  }

  /**
   * Method to check if the first date sent as parameter is bigger than the second one
   * @param {Object} date1 First date to compare
   * @param {Object} date2 Second date to compare
   * @returns {Boolean} Indicates if the first date is bigger
   */
  #checkIfFirstDateBigger(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }

    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    const differenceOfValuesOf = firstDate.valueOf() - secondDate.valueOf();

    const isFirstDateBigger = differenceOfValuesOf > 0;
    return isFirstDateBigger;
  }

  /**
   * Method to check if the first date sent as parameter is smaller than the second one
   * @param {Object} date1 First date to compare
   * @param {Object} date2 Second date to compare
   * @returns {Boolean} Indicates if the first date is smaller
   */
  #checkIfFirstDateSmaller(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }

    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    const differenceOfValuesOf = firstDate.valueOf() - secondDate.valueOf();
    const isFirstDateSmaller = differenceOfValuesOf < 0;
    return isFirstDateSmaller;
  }

  /**
   * Method that takes care of checking if the dates sent are equals based in the selected
   * granularity, this method is used to verify that the arrows can still be clicked or
   * not
   * @param {Object} firstDate First date to compare
   * @param {Object} secondDate Second date to compare
   * @param {String} granularity The granularity that is currently rendering the calendar
   * @returns {Boolean} Indicates if the dates are equals
   */
  #checkIfDatesFromSameGranularityPeriod(firstDate, secondDate, granularity) {
    let areDateEquals = false;

    switch (granularity) {
      case 'hour':
      case 'day':
      case 'week': {
        const sameMonth = firstDate.getMonth() === secondDate.getMonth();
        const sameYear = firstDate.getFullYear() === secondDate.getFullYear();

        if (sameMonth && sameYear) {
          areDateEquals = true;
        }
        break;
      }
      case 'month':
      case 'quarter':
      case 'semester': {
        const sameYear = firstDate.getFullYear() === secondDate.getFullYear();

        if (sameYear) {
          areDateEquals = true;
        }
        break;
      }
      case 'year': {
        const yearsDifference = secondDate.getFullYear() - firstDate.getFullYear();

        if (yearsDifference < 10) {
          areDateEquals = true;
        }
        break;
      }
    }

    return areDateEquals;
  }

  /**
   * Method used to get the last day of the month from a date
   * @param {Object} date The date object we are going to work with
   * @returns {Number} The last day of the month
   */
  #getLastDayOfMonth(date) {
    let lastDayOfMonth = new Date(date);
    lastDayOfMonth.setMonth(new Date(lastDayOfMonth.setDate(1)).getMonth() + 1);
    lastDayOfMonth.setDate(0);
    lastDayOfMonth = lastDayOfMonth.getDate();

    return lastDayOfMonth;
  }

  /**
   * Method that takes care of returning the quarter of the month passed
   * as parameter
   * @param {String|Number} month The number of the month with two digits
   */
  #getQuarterOfMonth(month) {
    let firstMonthQuarter;

    // Let's handle the month to make sure the month is the first one of the quarter
    switch (month) {
      case '01':
      case '02':
      case '03':
        firstMonthQuarter = '01';
        break;
      case '04':
      case '05':
      case '06':
        firstMonthQuarter = '04';
        break;
      case '07':
      case '08':
      case '09':
        firstMonthQuarter = '07';
        break;
      case 10:
      case 11:
      case 12:
        firstMonthQuarter = 10;
        break;
    }

    let quarter;

    switch (firstMonthQuarter) {
      case '01':
        quarter = 'Q1';
        break;
      case '04':
        quarter = 'Q2';
        break;
      case '07':
        quarter = 'Q3';
        break;
      case 10:
        quarter = 'Q4';
        break;
    }

    return { quarter, firstMonthQuarter };
  }

  /**
   * Method that takes care of returning the semester of the month passed
   * as parameter
   * @param {String|Number} month The number of the month with two digits
   */
  #getSemesterOfMonth(month) {
    let firstMonthSemester;

    // Let's handle the month to make sure the month is the first one of the semester
    switch (month) {
      case '01':
      case '02':
      case '03':
      case '04':
      case '05':
      case '06':
        firstMonthSemester = '01';
        break;
      case '07':
      case '08':
      case '09':
      case 10:
      case 11:
      case 12:
        firstMonthSemester = '07';
        break;
    }

    let semester;

    if (firstMonthSemester === '01') {
      semester = 'H1';
    } else if (firstMonthSemester === '07') {
      semester = 'H2';
    }

    return { semester, firstMonthSemester };
  }

  /**
   * Get ISO 8601 week number and ISO week year or the US-style week number and year based in
   * the first day of the week set
   *
   * ISO 8601: Weeks start on Monday, week 1 is the week with Jan 4th
   * US-style: Weeks start on Sunday, week 1 contains January 1st
   * @param {Object} date The date object to get the week info
   */
  #getWeekInfoOfDate(date) {
    if (!date) {
      return undefined;
    }

    const firstDayOfWeek = this.firstDayOfWeek;

    // ISO 8601 version
    if (firstDayOfWeek !== 'Sunday') {
      const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

      // Nearest Thursday determines ISO year
      const day = tempDate.getUTCDay() || 7;
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - day);

      const isoYear = tempDate.getUTCFullYear();

      // First ISO week starts on the Monday of the week with Jan 4th
      const yearStart = new Date(Date.UTC(isoYear, 0, 1));
      const startDay = yearStart.getUTCDay() || 7;
      const isoYearStart = new Date(yearStart);
      isoYearStart.setUTCDate(isoYearStart.getUTCDate() + (startDay <= 4 ? 1 - startDay : 8 - startDay));

      const weekNumber = Math.ceil(((tempDate - isoYearStart) / 86400000 + 1) / 7);

      return {
        week: weekNumber,
        year: isoYear,
      };
    }

    const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = tempDate.getFullYear();

    // Find the first Sunday before or on Jan 1st
    const jan1 = new Date(year, 0, 1);
    const jan1Day = jan1.getDay(); // Sunday = 0, Saturday = 6
    const firstWeekStart = new Date(jan1);
    firstWeekStart.setDate(jan1.getDate() - jan1Day); // Go back to the Sunday

    // Calculate difference in days
    const diffInDays = Math.floor((tempDate - firstWeekStart) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;

    return {
      week: weekNumber,
      year: date.getFullYear(),
    };
  }

  /**
   * Method used to get the start and the end of the week from the date sent
   * @param {Object} date The date we are going to extract the week
   * @returns {Object} Contains the start and the end of the week
   */
  #getStartAndEndOfWeek(date) {
    const weekStartsOnSunday = this.firstDayOfWeek === 'Sunday';
    const current = new Date(date);
    const day = current.getDay();

    // Calculate how many days to subtract for the start of the week
    const diffToStart = weekStartsOnSunday ? -day : -((day + 6) % 7);

    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() + diffToStart);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  }

  #sendConsoleMessage(message, type) {
    switch (type) {
      case 'warning':
        console.warn(message);
        break;
      case 'error':
        break;
    }
  }

  //#endregion

  //#endregion
}

export default EverythingDateRangePicker;
