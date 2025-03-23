// import "./everything-date-range-picker.css";

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
        new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(0, 0, 0, 0)
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
      endDate: new Date(new Date(new Date().getFullYear() - 1, 11).setHours(23, 59)),
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

    console.log('containerId: ', containerId);
    console.log('this.container: ', this.container);
    console.log('options: ', options);

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
    this.showTimezoneChooser = options.showTimezoneChooser || false;
    this.granularity = options.granularity || 'hour';
    this.#calendarGranularity = this.granularity;
    this.singleCalendar = options.singleCalendar || false;
    this.ranges = options.ranges || this.#defaultRanges;
    this.spanOfSelecteableDays = options.spanOfSelecteableDays || null;
    this.firstDayOfWeek = options.firstDayOfWeek || 'Monday';
    this.showGranularityDropdown = options.showGranularityDropdown || false;

    // Lets make the different checks for the dates
    const isMinDateBigger = this.checkIfFirstDateBigger(this.minDate, this.startDate);

    if (isMinDateBigger) {
      this.startDate = new Date(this.minDate);
      this.currentStartDate = this.startDate;
      this.selectedStartDate = this.startDate;
    }

    const isStartDateBigger = this.checkIfFirstDateBigger(this.startDate, this.endDate);

    if (isStartDateBigger) {
      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    const isEndDateBigger = this.checkIfFirstDateBigger(this.endDate, this.maxDate);

    if (isEndDateBigger) {
      this.endDate = new Date(this.maxDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    const isEndDateSmaller = this.checkIfFirstDateSmaller(this.endDate, this.startDate);

    if (isEndDateSmaller) {
      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
      this.selectedEndDate = this.endDate;
    }

    this.initDatePicker();
  }

  #checkValidityOfDateType(property) {
    if (typeof this[property] === 'string') {
      this[property] = new Date(this[property]);
    }
  }

  initDatePicker() {
    const {
      startDateEqualsMinDate,
      startDateEqualsMaxDate,
      endDateEqualsMinDate,
      endDateEqualsMaxDate,
      startDateEqualsEndDate,
    } = this.#checkDatesToRenderArrows();

    const hideLeftCalendarPreviousArrow =
      startDateEqualsMinDate || endDateEqualsMinDate || (startDateEqualsEndDate && this.singleCalendar);

    const hideLeftCalendarNextArrow = endDateEqualsMaxDate || startDateEqualsMaxDate || startDateEqualsEndDate;

    const singleCalendar = `
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow left-calendar-previous-arrow"
              ${hideLeftCalendarPreviousArrow ? 'style="display: none"' : ''}> 
              <- 
            </div>
            <div class="start-date-calendar-month" style="flex: 1; text-align: center;">
            </div>
            <div class="calendar-arrow left-calendar-next-arrow"
              ${hideLeftCalendarNextArrow ? 'style="display: none"' : ''}>
              -> 
            </div>
          </div>
          <div class="start-date-calendar">
          </div>
        </div>
      </div>
    `;

    const hideRightCalendarPreviousArrow = endDateEqualsMinDate || startDateEqualsEndDate;

    const hideRightCalendarNextArrow = endDateEqualsMaxDate;

    const doubleCalendar = `
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow left-calendar-previous-arrow"
              ${hideLeftCalendarPreviousArrow ? 'style="display: none"' : ''}> 
              <- 
            </div>
            <div class="start-date-calendar-month" style="flex: 1; text-align: center;">
            </div>
            <div class="calendar-arrow left-calendar-next-arrow"
              ${hideLeftCalendarNextArrow ? 'style="display: none"' : ''}>
              -> 
            </div>
          </div>
          <div class="start-date-calendar">
          </div>
        </div>
      </div>
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow right-calendar-previous-arrow"
              ${hideRightCalendarPreviousArrow ? 'style="display: none"' : ''}>
              <-
            </div>
            <div class="end-date-calendar-month" style="flex: 1; text-align: center;">
            </div>
            <div class="calendar-arrow right-calendar-next-arrow"
              ${hideRightCalendarNextArrow ? 'style="display: none"' : ''}>
              ->
            </div>
          </div>
          <div class="end-date-calendar">
          </div>
        </div>
      </div>
      <div class="calendar ranges-container"> list </div>
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

    this.container.innerHTML = `
      <div class="main-date-range-picker-container">
        ${granularityDropdownHTML}
        <div class="date-range-picker-container">
          <div class="date-range-picker-display">
            <span class="calendar-icon">📅</span>
            <span class="selected-start-date">1</span>
            <span> → </span>
            <span class="selected-end-date">2</span>
            <span class="arrow-icon">▼</span>
          </div>
          <div class="date-range-picker-calendar-container">
            ${this.singleCalendar ? singleCalendar : doubleCalendar}  
          </div>
        </div>
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
      this.populateStartCalendar();
    } else {
      this.endCalendar = this.container.querySelector('.end-date-calendar');
      this.#endCalendarMonth = this.container.querySelector('.end-date-calendar-month');
      this.rangesContainer = this.container.querySelector('.ranges-container');

      this.populateStartCalendar();
      this.populateEndCalendar();
      this.populateRangesContainer();
    }

    this.display.addEventListener('click', () => this.toggleCalendar());
    document.addEventListener('click', (event) => this.documentClickHandler(event));

    // Add click event listener to the arrows to navigate the months
    const listOfCalendarArrows = this.container.querySelectorAll('.calendar-arrow');

    listOfCalendarArrows.forEach((calendarArrow) => {
      calendarArrow.addEventListener('click', (event) => this.changeRenderedCalendar(event));
    });

    this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
  }

  /**
   * Method to hide or show the calendar when clicking the container of .date-range-picker-display
   */
  toggleCalendar() {
    const currentDisplay = this.calendarContainer.style.display;
    this.calendarContainer.style.display = currentDisplay === 'flex' ? 'none' : 'flex';
  }

  /**
   * Method to hide the calendar when clicking anywhere in the screen except the date range picker
   * @param {Object} event The click object that contains the info of the event
   */
  documentClickHandler(event) {
    if (!this.container.contains(event.target)) {
      this.calendarContainer.style.display = 'none';
    }
  }

  /**
   * Method to change the rendered calendar of the clicked side, this method runs when the user clicks the
   * arrows rendered on the calendars
   * @param {Object} event The click object that contains the info of the event
   */
  changeRenderedCalendar(event) {
    event.stopPropagation();
    const clickedArrow = event.target;
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
        nextArrow.style.display = 'block';

        const rightCalendarPreviousArrow = this.calendarContainer.querySelector('.right-calendar-previous-arrow');
        rightCalendarPreviousArrow.style.display = 'block';
      }

      if (!isPreviousArrow) {
        const previousArrow = this.calendarContainer.querySelector('.left-calendar-previous-arrow');
        previousArrow.style.display = 'block';

        /* 
          In the case that the next arrow is clicked in the left calendar and the
          start and end date are equal, the previous arrow in the right calendar has to be
          disabled too
        */
        if (startDateEqualsEndDate) {
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
        nextArrow.style.display = 'block';

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
        previousArrow.style.display = 'block';

        const leftCalendarNextArrow = this.calendarContainer.querySelector('.left-calendar-next-arrow');
        leftCalendarNextArrow.style.display = 'block';
      }
    }
  }

  #calculateNewDate(dateToUse, isPreviousArrow) {
    let newDateToRender;

    switch (this.#calendarGranularity) {
      case 'hour':
      case 'day':
      case 'week': {
        const newMonth = isPreviousArrow ? dateToUse.getMonth() - 1 : dateToUse.getMonth() + 1;
        newDateToRender = new Date(dateToUse).setMonth(newMonth);
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

        const dateClicked = event.target.getAttribute('data-value');
        if (calendarSide === 'left') {
          this.currentStartDate = new Date(dateClicked);
        } else {
          this.currentEndDate = new Date(dateClicked);
        }

        this.#calendarGranularity = newGranularity;
        this.populateStartCalendar();
        this.populateEndCalendar();
        this.#setStateOfCalendarArrows();
        return;
      }

      this.saveClickedDate(event);
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
  saveClickedDate(event) {
    const dateClicked = event.target.getAttribute('data-value');

    console.log('this: ', this);
    console.log('this.#timesClickedDate: ', this.#timesClickedDate);

    if (this.singleCalendar || this.#timesClickedDate === 0) {
      this.selectedStartDate = new Date(dateClicked);
      this.#timesClickedDate = 1;
      this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
      return;
    }

    this.selectedEndDate = new Date(dateClicked);
    this.#timesClickedDate = 0;
    this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
  }

  #attachClickCalendarTitleEvent(calendarTitleElement) {
    const listOfTitleElements = calendarTitleElement.querySelectorAll('.calendarTitleElement');

    const clickEventFnct = (event) => {
      event.stopPropagation();

      const clickedValue = event.target.getAttribute('data-value');
      if (clickedValue === 'year' && this.#calendarGranularity === 'year') {
        return;
      }

      this.#calendarGranularity = clickedValue;
      this.populateStartCalendar();
      this.populateEndCalendar();
      this.#setStateOfCalendarArrows();
    };

    listOfTitleElements.forEach((titleElement) => {
      titleElement.addEventListener('click', clickEventFnct);
    });
  }

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
   * @returns {Object} The formatted date, the from date of the granularity selected and the to date
   */
  getDateFormattedByGranularity(date) {
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
        formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        from = `${year}-${month}-${day} ${hours}:${minutes}`;
        to = `${year}-${month}-${day} ${hours}:${minutes}`;
        break;
      case 'day':
        formattedDate = `${year}-${month}-${day}`;
        from = `${year}-${month}-${day} 00:00`;
        to = `${year}-${month}-${day} 23:59`;
        break;
      case 'month': {
        formattedDate = `${year}-${month}`;
        from = `${year}-${month}-01 00:00`;

        const lastDayOfMonth = this.#getLastDayOfMonth(date);
        to = `${year}-${month}-${lastDayOfMonth} 23:59`;
        break;
      }
      case 'quarter': {
        // Let's handle the month to make sure the month is the first one of the quarter
        switch (month) {
          case '02':
          case '03':
            month = '01';
            break;
          case '05':
          case '06':
            month = '04';
            break;
          case '08':
          case '09':
            month = '7';
            break;
          case 11:
          case 12:
            month = 10;
            break;
        }

        let quarter = 'Q1';

        switch (month) {
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

        formattedDate = `${year}-${quarter}`;
        from = `${year}-${month}-01 00:00`;

        const numberMonth = parseInt(month) - 1;
        const sumOfMonths = numberMonth + 3 > 12 ? 12 : numberMonth + 3;
        const lastMonthOfQuarter = this.#verifyDateElementHasTwoDigits(sumOfMonths);
        const lastDayOfLastMonth = this.#getLastDayOfMonth(`${year}-${lastMonthOfQuarter}-01`);
        to = `${year}-${lastMonthOfQuarter}-${lastDayOfLastMonth} 23:59`;
        break;
      }
      case 'semester': {
        // Let's handle the month to make sure the month is the first one of the semester
        switch (month) {
          case '02':
          case '03':
          case '04':
          case '05':
          case '06':
            month = '01';
            break;
          case '08':
          case '09':
          case 10:
          case 11:
          case 12:
            month = '07';
            break;
        }

        let semester = 'H1';

        if (month === '07') {
          semester = 'H2';
        }

        formattedDate = `${year}-${semester}`;
        from = `${year}-${month}-01 00:00`;

        const numberMonth = parseInt(month) - 1;
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

  #verifyDateElementHasTwoDigits(dateElement) {
    return ('' + dateElement).length === 1 ? `0${dateElement}` : dateElement;
  }

  /**
   * Method that takes care of populate the start calendar with the start date
   */
  populateStartCalendar() {
    const startDate = this.currentStartDate;
    const calendarHTML = this.#generateCalendar(startDate, 'left');
    this.startCalendar.innerHTML = calendarHTML;
    this.#attachClickCellEvent(this.startCalendar, 'left');
  }

  /**
   * Method that takes care of populate the end calendar with the end date
   */
  populateEndCalendar() {
    const endDate = this.currentEndDate;
    const calendarHTML = this.#generateCalendar(endDate, 'right');
    this.endCalendar.innerHTML = calendarHTML;
    this.#attachClickCellEvent(this.endCalendar, 'right');
  }

  /**
   * Method that takes care of populate the ranges
   */
  populateRangesContainer() {
    let listOfRangesHTML = `<ul class="calendar-ranges-list">`;

    for (let i = 0; i < this.#defaultRanges.length; i++) {
      let range = this.#defaultRanges[i];
      listOfRangesHTML += `<li class="calendar-ranges-list-element">${range.label}</li>`;
    }

    listOfRangesHTML += `</ul>`;
    this.rangesContainer.innerHTML = listOfRangesHTML;

    const listElements = this.rangesContainer.querySelectorAll('.calendar-ranges-list-element');

    listElements.forEach((listElement) =>
      listElement.addEventListener('click', (event) => this.clickRangeListElementEvent(event))
    );
  }

  clickRangeListElementEvent(event) {
    const listRangeElement = event.target;
    const rangeText = listRangeElement.innerText;
    const rangeObj = this.ranges.find((range) => range.label === rangeText);

    if (!rangeObj) {
      return;
    }

    this.startDate = rangeObj.startDate;
    this.currentStartDate = rangeObj.startDate;
    this.selectedStartDate = rangeObj.startDate;

    this.endDate = rangeObj.endDate;
    this.currentEndDate = rangeObj.endDate;
    this.selectedEndDate = rangeObj.endDate;

    this.#timesClickedDate = 0;
    this.#calendarGranularity = this.granularity;

    this.populateStartCalendar();
    this.populateEndCalendar();
    this.#setStateOfCalendarArrows();
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
        calendarHTML = this.#generateHoursDaysCalendar(date);
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
   * Method used to generate the calendar used for the hours and days granularity that displays
   * the days of the month
   * @param {Object} date The date object to use to generate the calendar
   * @returns The HTML of the calendar
   */
  #generateHoursDaysCalendar(date) {
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

      tableHeaderDaysHTML += `<th>${normalOrderOfDays[indexToGetDayOfWeek]}</th>`;
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
        const attributesToAdd = day ? `class="calendar-clickable-cell" data-value="${dateValue}"` : '';

        tableDaysHTML += `<td ${attributesToAdd}>${day}</td>`;
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
        const attributesToAdd = `class="calendar-clickable-cell" data-value="${dateValue}"`;

        tableMonthsHTML += `<td ${attributesToAdd}>${monthName}</td>`;

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
        const attributesToAdd = `class="calendar-clickable-cell" data-value="${dateValue}"`;

        tableQuartersHTML += `<td ${attributesToAdd}>Q${index}</td>`;

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
      const attributesToAdd = `class="calendar-clickable-cell" data-value="${dateValue}"`;

      tableSemestersHTML += `<td ${attributesToAdd}>H${i}</td>`;

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
        const attributesToAdd = `class="calendar-clickable-cell" data-value="${dateValue}"`;

        tableYearsHTML += `<td ${attributesToAdd}>${year}</td>`;

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
   * Method to check if the first date sent as parameter is bigger than the second one
   * @param {Object} date1 First date to compare
   * @param {Object} date2 Second date to compare
   * @returns {Boolean} Indicates if the first date is bigger
   */
  checkIfFirstDateBigger(date1, date2) {
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
  checkIfFirstDateSmaller(date1, date2) {
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

    let display = startDateEqualsMinDate ? 'none' : 'block';
    leftCalendarPreviousArrow.style.display = display;

    display = startDateEqualsEndDate || startDateEqualsMaxDate ? 'none' : 'block';
    leftCalendarNextArrow.style.display = display;

    display = startDateEqualsEndDate || endDateEqualsMinDate ? 'none' : 'block';
    rightCalendarPreviousArrow.style.display = display;

    display = endDateEqualsMaxDate ? 'none' : 'block';
    rightCalendarNextArrow.style.display = display;
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
      startDateEqualsMinDate = this.checkIfDatesEqualsBasedInGranularity(
        this.currentStartDate,
        this.minDate,
        granularity
      );

      if (this.currentEndDate && !this.singleCalendar) {
        endDateEqualsMinDate = this.checkIfDatesEqualsBasedInGranularity(
          this.currentEndDate,
          this.minDate,
          granularity
        );
      }
    }

    if (this.maxDate) {
      startDateEqualsMaxDate = this.checkIfDatesEqualsBasedInGranularity(
        this.currentStartDate,
        this.maxDate,
        granularity
      );

      if (this.currentEndDate && !this.singleCalendar) {
        endDateEqualsMaxDate = this.checkIfDatesEqualsBasedInGranularity(
          this.currentEndDate,
          this.maxDate,
          granularity
        );
      }
    }

    if (this.currentEndDate && !this.singleCalendar) {
      startDateEqualsEndDate = this.checkIfDatesEqualsBasedInGranularity(
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
   * Method that takes care of checking if the dates sent are equals based in the selected
   * granularity
   * @param {Object} firstDate First date to compare
   * @param {Object} secondDate Second date to compare
   * @param {String} granularity The granularity that is currently rendering the calendar
   * @returns {Boolean} Indicates if the dates are equals
   */
  checkIfDatesEqualsBasedInGranularity(firstDate, secondDate, granularity) {
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
    lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(0);
    lastDayOfMonth = lastDayOfMonth.getDate();

    return lastDayOfMonth;
  }

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

  #attachOnChangeGranularityDropdownEvent() {
    this.granularityDropdown.addEventListener('change', (event) => {
      const selectedGranularity = this.granularityDropdown.value;
      this.granularity = selectedGranularity;
      this.#calendarGranularity = selectedGranularity;

      this.populateStartCalendar();
      this.populateEndCalendar();
      this.#setStateOfCalendarArrows();
      this.#setDateCalendarDisplay(this.selectedStartDate, 'left');
      this.#setDateCalendarDisplay(this.selectedEndDate, 'right');
    });
  }
}

// export default EverythingDateRangePicker;
