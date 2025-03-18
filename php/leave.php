<?php

// 假設你已經有一個 MySQL 連線 $conn
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');  // 設置回應為 JSON 格式
$conn = new mysqli("localhost", "root", "", "qrcode");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 檢查是否有接收到
    if (isset($_POST['ID']) && isset($_POST['DATE']) && isset($_POST['NOTE'])) {
        $id = $_POST['ID'];
        $date = $_POST['DATE'];
        $status = "leave";
        $note = $_POST['NOTE'];

        $sql = "INSERT INTO attendance_db (ID, DATE, STATUS, NOTE) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $id, $date,$status,$note);
        // 執行 SQL 插入操作
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "請假成功！"]);
        } else {
            echo json_encode(["success" => false, "message" => "錯誤：" . $stmt->error]);
        }

        // 關閉資料庫連線
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "no data"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "invalid request"]);
}

$conn->close();
?>
