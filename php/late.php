<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');  

$conn = new mysqli("localhost", "root", "", "qrcode");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['ID'])) {
        $id = $_POST['ID'];
        
        // 檢查員工是否存在
        $check_sql = "SELECT * FROM attendance_db WHERE ID = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $id);
        $check_stmt->execute();
        $result = $check_stmt->get_result();
        
        if ($result->num_rows > 0) {
            // 如果員工存在，插入出勤紀錄
            date_default_timezone_set('Asia/Taipei');
            $date = date('Y-m-d');
            $time = date('H:i:s');
            $status = (strtotime($time) > strtotime("08:00:00")) ? "late" : "present";
            $sql = "INSERT INTO attendance_db (ID, DATE, TIME, STATUS) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $id, $date, $time, $status);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => $status === "late" ? "遲到！" : "正常上班"]);
            } else {
                echo json_encode(["success" => false, "message" => "錯誤：" . $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(["success" => false, "message" => "查無此人"]);
        }
        
        $check_stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "no data"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "invalid request"]);
}

$conn->close();
?>
