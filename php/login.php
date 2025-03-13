<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');  // 設置回應為 JSON 格式

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "qrcode";

// 建立資料庫連線
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 確保使用 POST 請求傳送資料
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 檢查是否有接收到帳號和密碼
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $user = $_POST['username'];
        $pass = $_POST['password'];

        // 輸出接收到的帳號和密碼（用於調試）
        // echo json_encode(["received_username" => $user, "received_password" => $pass]);

        // 繼續處理資料庫查詢
        $sql = "SELECT ID, PASSWD FROM account WHERE ID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($id, $hashedPassword);

        if ($stmt->num_rows > 0) {
            $stmt->fetch();
            if (password_verify($pass, $hashedPassword)) {
                echo json_encode(["success" => true, "ID" => $id]);
            } else {
                echo json_encode(["success" => false, "message" => "wrong passwd","pass" => password_hash($pass, PASSWORD_DEFAULT), "hashedPassword" => $hashedPassword]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "account not exit"]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "no Id, passwd"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "invalid request"]);
}

$conn->close();
?>
