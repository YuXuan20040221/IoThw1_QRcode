document.addEventListener("DOMContentLoaded", function () {
    const monthTitle = document.querySelector(".month-title");
    const daysContainer = document.querySelector(".days");
    const prevMonthBtn = document.querySelector(".prev-month");
    const nextMonthBtn = document.querySelector(".next-month");
    const leaveBtn = document.getElementById("submit-leave");

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

    async function fetchAttendanceData() {
        const webAppUrl = "http://localhost/IoT/fetch_attendance.php";  // 改為本地 PHP API
        try {
            let response = await fetch(webAppUrl);
            let data = await response.json();
            processAttendanceData(data);
        } catch (error) {
            console.error("錯誤:", error);
        }
    }
    
    function processAttendanceData(rows) {
        let employeeId = document.getElementById("employeeId").textContent;
        let attendance = {};
    
        rows.forEach(row => {
            if (row.ID === employeeId) {
                attendance[row.DATE] = row.STATUS;
            }
        });
    
        updateCalendar(attendance);
    }

    function updateCalendar(attendance) {
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
            let dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayDiv.dataset.date = dateStr;

            // 標記今天的日期
            if (
                day === currentDate.getDate() &&
                currentMonth === currentDate.getMonth() &&
                currentYear === currentDate.getFullYear()
            ) {
                dayDiv.classList.add("today");
            }

            //標記請假
            if (attendance[dateStr]) {
                if(attendance[dateStr] === "leave"){
                    dayDiv.classList.add("leave");
                }else if (attendance[dateStr] === "late") {
                    dayDiv.classList.add("late");
                }
            }

            dayDiv.addEventListener("click", function() {
                document.getElementById("leave-date").value = this.dataset.date;
                document.getElementById("leave-modal").style.display = "block";
            });

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
        fetchAttendanceData();
    });

    nextMonthBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        fetchAttendanceData();
    });

    leaveBtn.addEventListener("click", function(event) {
        event.preventDefault();
        let empId = sessionStorage.getItem("emp_id");;
        let leaveDate = document.getElementById("leave-date").value;
        let leaveReason = document.getElementById("leave-reason").value;
        
        if (!leaveDate || !leaveReason) {
            alert("請填寫完整的請假資料！");
            return;
        }
        
        let formData = new URLSearchParams();
        formData.append("ID", empId);
        formData.append("DATE", leaveDate);
        formData.append("NOTE", leaveReason);

        fetch('http://localhost/IoT/leave.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  
            alert(data.message);
        })
        .catch(error => {
            console.error('錯誤:', error);
        });
    });

    fetchAttendanceData();
});
