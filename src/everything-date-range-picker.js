// import "./everything-date-range-picker.css";

class EverythingDateRangePicker {
  #defaultRanges = [
    { label: "Today", startDate: new Date(), endDate: new Date() },
    {
      label: "Yesterday",
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      label: "Last 7 Days",
      startDate: new Date(new Date().setDate(new Date().getDate() - 6)),
      endDate: new Date(),
    },
    {
      label: "Last 30 Days",
      startDate: new Date(new Date().setDate(new Date().getDate() - 29)),
      endDate: new Date(),
    },
    {
      label: "This Week",
      startDate: new Date(new Date().setDate(new Date().getDay())),
      endDate: new Date(),
    },
    {
      label: "Last Week",
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 14)),
    },
    {
      label: "This Month",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth()),
      endDate: new Date(),
    },
    {
      label: "Last Month",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth()),
    },
    {
      label: "Year to Date",
      startDate: new Date(new Date().getFullYear(), 0),
      endDate: new Date(),
    },
    {
      label: "Last Year",
      startDate: new Date(new Date().getFullYear() - 1, 0),
      endDate: new Date(new Date().getFullYear() - 1, 11),
    },
  ];

  #granularitiesAvailable = [
    "hours",
    "days",
    "weeks",
    "months",
    "quarters",
    "semesters",
    "years",
  ];

  #monthsStrings = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);

    console.log("containerId: ", containerId);
    console.log("this.container: ", this.container);
    console.log("options: ", options);

    this.startDate =
      options.startDate || new Date(new Date().setHours(0, 0, 0, 0));
    this.#checkValidityOfDataType("startDate");
    this.currentStartDate = this.startDate;
    this.endDate =
      options.endDate || new Date(new Date().setHours(23, 59, 59, 999));
    this.#checkValidityOfDataType("endDate");
    this.currentEndDate = this.endDate;
    this.minDate = options.minDate || null;
    this.#checkValidityOfDataType("minDate");
    this.maxDate = options.maxDate || null;
    this.#checkValidityOfDataType("maxDate");
    this.timezone = options.timezone || null;
    this.showTimezoneChooser = options.showTimezoneChooser || false;
    this.granularity = options.granularity || "hours";
    this.singleCalendar = options.singleCalendar || false;
    this.ranges = options.ranges || this.#defaultRanges;
    this.spanOfSelecteableDays = options.spanOfSelecteableDays || null;
    this.firstDayOfWeek = options.firstDayOfWeek || "Monday";

    // Lets make the different checks for the dates
    const isStartDateBigger = this.checkIfFirstDateBigger(
      this.startDate,
      this.endDate
    );

    if (isStartDateBigger) {
      console.log("bigger");
      this.startDate = new Date(this.endDate);
      this.currentStartDate = this.startDate;
    }

    const isStartDateSmaller = this.checkIfFirstDateSmaller(
      this.startDate,
      this.endDate
    );

    if (isStartDateSmaller) {
      console.log("smaller");
      this.endDate = new Date(this.startDate);
      this.currentEndDate = this.endDate;
    }

    this.initDatePicker();
  }

  #checkValidityOfDataType(property) {
    if (typeof this[property] === "string") {
      this[property] = new Date(this[property]);
    }
  }

  initDatePicker() {
    const singleCalendar = `
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow left-calendar-previous-arrow">
              <-
            </div>
            <div class="start-date-calendar-month">
            </div>
            <div class="calendar-arrow left-calendar-next-arrow">
              ->
            </div>
          </div>
          <div class="start-date-calendar">
          </div>
        </div>
      </div>
    `;

    const doubleCalendar = `
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow left-calendar-previous-arrow">
              <-
            </div>
            <div class="start-date-calendar-month">
            </div>
            <div class="calendar-arrow left-calendar-next-arrow">
              ->
            </div>
          </div>
          <div class="start-date-calendar">
          </div>
        </div>
      </div>
      <div class="calendar">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <div class="calendar-arrow right-calendar-previous-arrow">
              <-
            </div>
            <div class="end-date-calendar-month">
            </div>
            <div class="calendar-arrow right-calendar-next-arrow">
              ->
            </div>
          </div>
          <div class="end-date-calendar">
          </div>
        </div>
      </div>
      <div class="calendar ranges-container"> list </div>
    `;

    this.container.innerHTML = `
      <div class="date-range-picker-container">
        <div class="date-range-picker-display">
          <span class="calendar-icon">📅</span>
          <span class="selected-dates">Test...</span>
          <span class="arrow-icon">▼</span>
        </div>
        <div class="date-range-picker-calendar-container">
          ${this.singleCalendar ? singleCalendar : doubleCalendar}  
        </div>
      </div>
    `;

    this.display = this.container.querySelector(".date-range-picker-display");
    this.calendarContainer = this.container.querySelector(
      ".date-range-picker-calendar-container"
    );

    this.selectedDatesElement = this.container.querySelector(".selected-dates");

    this.startCalendar = this.container.querySelector(".start-date-calendar");
    this.#startCalendarMonth = this.container.querySelector(
      ".start-date-calendar-month"
    );

    // If the singleCalendar boolean is true we render only the start calendar
    if (this.singleCalendar) {
      this.populateStartCalendar();
    } else {
      this.endCalendar = this.container.querySelector(".end-date-calendar");
      this.#endCalendarMonth = this.container.querySelector(
        ".end-date-calendar-month"
      );
      this.rangesContainer = this.container.querySelector(".ranges-container");

      this.populateStartCalendar();
      this.populateEndCalendar();
      this.populateRangesContainer();
    }

    this.display.addEventListener("click", () => this.toggleCalendar());
    document.addEventListener("click", (event) =>
      this.documentClickHandler(event)
    );

    // Add click event listener to the arrows to navigate the months
    const listOfCalendarArrows =
      this.container.querySelectorAll(".calendar-arrow");
    listOfCalendarArrows.forEach((calendarArrow) => {
      calendarArrow.addEventListener("click", (event) =>
        this.changeRenderedCalendar(event)
      );
    });
  }

  /**
   * Method to hide or show the calendar when clicking the container of .date-range-picker-display
   */
  toggleCalendar() {
    const currentDisplay = this.calendarContainer.style.display;
    this.calendarContainer.style.display =
      currentDisplay === "flex" ? "none" : "flex";
  }

  /**
   * Method to hide the calendar when clicking anywhere in the screen except the date range picker
   * @param {Object} event The click object that contains the info of the event
   */
  documentClickHandler(event) {
    if (!this.container.contains(event.target)) {
      this.calendarContainer.style.display = "none";
    }
  }

  changeRenderedCalendar(event) {
    event.stopPropagation();
    const clickedArrow = event.target;
    const isLeftCalendar = clickedArrow.className.includes("left");
    const isPreviousArrow = clickedArrow.className.includes("previous");

    let dateToUse = this.currentStartDate;
    let calendarToUse = this.startCalendar;

    // If is the right calendar
    if (!isLeftCalendar) {
      dateToUse = this.currentEndDate;
      calendarToUse = this.endCalendar;
    }

    let newDateToRender;

    if (isPreviousArrow) {
      newDateToRender = new Date().setMonth(dateToUse.getMonth() - 1);
    } else {
      newDateToRender = new Date().setMonth(dateToUse.getMonth() + 1);
    }

    newDateToRender = new Date(newDateToRender);

    if (isLeftCalendar) {
      this.currentStartDate = new Date(newDateToRender);
    } else {
      this.currentEndDate = new Date(newDateToRender);
    }

    let calendarHTML = this.#generateCalendar(
      newDateToRender,
      isLeftCalendar ? "left" : "right"
    );
    calendarToUse.innerHTML = calendarHTML;
  }

  /**
   * Method that takes care of populate the start calendar with the start date
   */
  populateStartCalendar() {
    const startDate = this.startDate;
    let calendarHTML = this.#generateCalendar(startDate, "left");
    this.startCalendar.innerHTML = calendarHTML;
  }

  /**
   * Method that takes care of populate the end calendar with the end date
   */
  populateEndCalendar() {
    const endDate = this.endDate;
    let calendarHTML = this.#generateCalendar(endDate, "right");
    this.endCalendar.innerHTML = calendarHTML;
  }

  /**
   * Method that takes care of populate the ranges
   */
  populateRangesContainer() {
    let listOfRangesHTML = `<ul>`;

    for (let i = 0; i < this.#defaultRanges.length; i++) {
      let range = this.#defaultRanges[i];
      listOfRangesHTML += `<li>${range.label}</li>`;

      console.log(`-------${range.label}--------`);
      console.log(`startDate: `, range.startDate);
      console.log(`endDate: `, range.endDate);
    }

    listOfRangesHTML += `</ul>`;
    this.rangesContainer.innerHTML = listOfRangesHTML;
  }

  /**
   * Method that takes care of generating the HTML of the calendar
   * @param {Object} date The date object to use to generate the calendar
   * @param {String} sideOfCalendar The side of the calendar we are rendering (left, right)
   * @returns The HTML of the calendar
   */
  #generateCalendar(date, sideOfCalendar) {
    const month = date.getMonth();
    const monthName = this.#monthsStrings[month];
    let firstDayOfMonthInWeek = new Date(date);
    firstDayOfMonthInWeek = new Date(firstDayOfMonthInWeek.setDate(1)).getDay();
    let lastDayOfMonth = new Date(date);
    lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(0);
    lastDayOfMonth = lastDayOfMonth.getDate();

    // Get the index of the week for the day the user selected as first day of the week
    let indexOfFirstDayOfWeek =
      this.#dayOfWeekNumberRelationObj[this.firstDayOfWeek];

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
    const normalOrderOfDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

    for (let i = 0; i < weeksOfMonth.length; i++) {
      let week = weeksOfMonth[i];
      tableDaysHTML += `<tr>`;
      for (let j = 0; j < week.length; j++) {
        let day = week[j] || "";
        tableDaysHTML += `<td>${day}</td>`;
      }
      tableDaysHTML += `</tr>`;
    }

    if (sideOfCalendar === "left") {
      this.#startCalendarMonth.innerHTML = monthName;
    } else {
      this.#endCalendarMonth.innerHTML = monthName;
    }

    let calendarHTML = `
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
   * Method to check if the first date sent as parameter is bigger than the second one
   * @param {Object} date1 First date to compare
   * @param {Object} date2 Second date to compare
   * @returns {Boolean} Indicates if the first date is bigger
   */
  checkIfFirstDateBigger(date1, date2) {
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
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    const differenceOfValuesOf = firstDate.valueOf() - secondDate.valueOf();
    const isFirstDateSmaller = differenceOfValuesOf < 0;
    return isFirstDateSmaller;
  }
}

// export default EverythingDateRangePicker;
