<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set header to accept JSON
header('Content-Type: application/json');

// Get the request method
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'POST') {
    // Get the JSON data from request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    // Path to data.json file
    $dataFilePath = __DIR__ . '/data.json';

    // Write data to data.json file
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    if (file_put_contents($dataFilePath, $jsonContent) !== false) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Record saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write to data.json']);
    }
} elseif ($request_method === 'GET') {
    // GET request to retrieve all records
    $dataFilePath = __DIR__ . '/data.json';

    if (file_exists($dataFilePath)) {
        $jsonContent = file_get_contents($dataFilePath);
        $data = json_decode($jsonContent, true);
        http_response_code(200);
        echo json_encode($data);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'data.json not found']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
