// import "./everything-date-range-picker.css";

class EverythingDateRangePicker {
  #defaultRanges = [
    { label: "Today", startDate: "", endDate: "" },
    { label: "Yesterday", startDate: "", endDate: "" },
    { label: "Last 7 Days", startDate: "", endDate: "" },
    { label: "Last 30 Days", startDate: "", endDate: "" },
    { label: "This Week", startDate: "", endDate: "" },
    { label: "Last Week", startDate: "", endDate: "" },
    { label: "This Month", startDate: "", endDate: "" },
    { label: "Last Month", startDate: "", endDate: "" },
    { label: "Year to Date", startDate: "", endDate: "" },
    { label: "Last Year", startDate: "", endDate: "" },
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

  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);

    console.log("containerId: ", containerId);
    console.log("this.container: ", this.container);
    console.log("options: ", options);

    this.startDate = options.startDate || null;
    this.endDate = options.endDate || null;
    this.minDate = options.minDate || null;
    this.maxDate = options.maxDate || null;
    this.timezone = options.timezone || null;
    this.showTimezoneChooser = options.showTimezoneChooser || false;
    this.granularity = options.granularity || "hours";
    this.singleCalendar = options.singleCalendar || false;
    this.ranges = options.ranges || this.#defaultRanges;
    this.spanOfSelecteableDays = options.spanOfSelecteableDays || null;
    this.firstDayOfWeek = options.firstDayOfWeek || "Monday";

    this.initDatePicker();
  }

  initDatePicker() {
    this.container.innerHTML = `
      <div class="date-range-picker-container">
        <div class="date-range-picker-display">
          <span class="calendar-icon">📅</span>
          <span class="selected-dates">Test...</span>
          <span class="arrow-icon">▼</span>
        </div>
        <div class="date-range-picker-calendar-container">
          <div class="calendar start-date-calendar"> test </div>
          <div class="calendar end-date-calendar"> test </div>
        </div>
      </div>
    `;

    this.display = this.container.querySelector(".date-range-picker-display");
    this.calendarContainer = this.container.querySelector(
      ".date-range-picker-calendar-container"
    );
    this.selectedDatesElement = this.container.querySelector(".selected-dates");

    this.display.addEventListener("click", () => this.toggleCalendar());
    document.addEventListener("click", (event) =>
      this.documentClickHandler(event)
    );
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
}

// export default EverythingDateRangePicker;
