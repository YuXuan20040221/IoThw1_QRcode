document.addEventListener("DOMContentLoaded", function () {
    const monthTitle = document.querySelector(".month-title");
    const daysContainer = document.querySelector(".days");
    const prevMonthBtn = document.querySelector(".prev-month");
    const nextMonthBtn = document.querySelector(".next-month");

    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function updateCalendar() {
        monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        daysContainer.innerHTML = "";

        let daysInMonth = getDaysInMonth(currentYear, currentMonth);
        let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 取得當月 1 號是星期幾
        let prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1); // 取得前一個月的天數

        // **前一個月的補充日期**
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            let prevDayDiv = document.createElement("div");
            prevDayDiv.classList.add("day", "pre-mon");
            prevDayDiv.textContent = prevMonthDays - i;
            daysContainer.appendChild(prevDayDiv);
        }

        // **當月日期**
        for (let day = 1; day <= daysInMonth; day++) {
            let dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.textContent = day;

            // 標記今天的日期
            if (
                day === currentDate.getDate() &&
                currentMonth === currentDate.getMonth() &&
                currentYear === currentDate.getFullYear()
            ) {
                dayDiv.classList.add("today");
            }

            daysContainer.appendChild(dayDiv);
        }

        // **下一個月的補充日期**
        let totalDays = firstDayOfMonth + daysInMonth; // 計算目前行事曆內的總格數
        let nextMonthDays = 7 - (totalDays % 7); // 計算還要補多少天才能湊滿 7 的倍數
        if (nextMonthDays < 7) { // 只補充不滿的一週
            for (let i = 1; i <= nextMonthDays; i++) {
                let nextDayDiv = document.createElement("div");
                nextDayDiv.classList.add("day", "next-mon");
                nextDayDiv.textContent = i;
                daysContainer.appendChild(nextDayDiv);
            }
        }
    }

    prevMonthBtn.addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    nextMonthBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });

    updateCalendar();
});

const webAppUrl = "http://localhost/IoT/fetch_attendance.php";  // 改為本地 PHP API

async function fetchAttendanceData() {
    try {
        let response = await fetch(webAppUrl);
        let data = await response.json();

        console.log(data); 
        processAttendanceData(data);
    } catch (error) {
        console.error("錯誤:", error);
    }
}

function processAttendanceData(rows) {
    let employeeId = document.getElementById("employeeId").textContent;
    let attendance = {};

    rows.forEach(row => {
        if (row.employee_id === employeeId) {
            attendance[row.date] = row.status;
        }
    });

    updateCalendar(attendance);
}

function updateCalendar(attendance) {
    // ... 你的日曆渲染邏輯
    let days = document.querySelectorAll(".day");
    days.forEach(day => {
        let dateString = `2025-03-${String(day.textContent).padStart(2, "0")}`;
        if (attendance[dateString]) {
            day.classList.add(attendance[dateString] === "請假" ? "leave" : "present");
            day.textContent += ` (${attendance[dateString]})`;
        }
    });
}

fetchAttendanceData();