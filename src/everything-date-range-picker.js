// import "./everything-date-range-picker.css";

class EverythingDateRangePicker {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);

    console.log("containerId: ", containerId);
    console.log("this.container: ", this.container);
    console.log("options: ", options);

    this.selectedStartDate = options.selectedStartDate || null;
    this.selectedEndDate = options.selectedEndDate || null;

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
          <div class="calendar end-date-calendar"> test</div>
        </div>
      </div>
    `;

    this.display = this.container.querySelector(".date-range-picker-display");
    this.calendarContainer = this.container.querySelector(
      ".date-range-picker-calendar-container"
    );
    this.selectedDatesElement = this.container.querySelector(".selected-dates");
  }
}

// export default EverythingDateRangePicker;
