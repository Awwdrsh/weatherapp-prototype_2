<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connecting to the MySQL database
$serverName = "localhost";
$userName = "root";
$password = "";
$conn = mysqli_connect($serverName, $userName, $password);

// Check connection
if (!$conn) {
    die("Failed to connect: " . mysqli_connect_error());
}

// Creating database for the weather application
$createDatabase = "CREATE DATABASE IF NOT EXISTS weather";
if (!mysqli_query($conn, $createDatabase)) {
    die("Failed to create database: " . mysqli_error($conn));
}

// Selecting the created database
mysqli_select_db($conn, 'weather');

// Creating table for the database to store data
$createTable = "CREATE TABLE IF NOT EXISTS weather_info (
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CityName VARCHAR(255) PRIMARY KEY,
    ApiDate DATE,
    temp FLOAT NOT NULL,
    icon VARCHAR(255),
    main VARCHAR(255),
    Descriptions VARCHAR(255),
    humidity FLOAT NOT NULL,
    pressure FLOAT NOT NULL,
    wind FLOAT NOT NULL,
    direction FLOAT NOT NULL
);";
if (!mysqli_query($conn, $createTable)) {
    die("Failed to create table: " . mysqli_error($conn));
}

// Get the city from the URL parameter or default to "Kathmandu"
$city = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : "Kathmandu";

// Fetch data from the database for the city
$selectAllData = "SELECT * FROM weather_info WHERE CityName = '$city'";
$result = mysqli_query($conn, $selectAllData);

if (mysqli_num_rows($result) == 0) {
    // Fetch data from the OpenWeatherMap API
    $apiKey = 'c1cc05219aaf07f2289681e011217fe5';
    $url = "https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric";
    
    // Use cURL to fetch data from OpenWeatherMap API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === FALSE) {
        die("Failed to fetch data from API. URL: $url");
    }

    $data = json_decode($response, true);

    // Check if the API response is valid
    if (isset($data['cod']) && $data['cod'] != 200) {
        die("Error: " . $data['message']);
    }

    // Extract data from the API response
    $apiDate = date("Y-m-d"); // Using the current date
    $temp = $data['main']['temp'];
    $icon = $data['weather'][0]['icon'];
    $main = $data['weather'][0]['main'];
    $descriptions = $data['weather'][0]['description'];
    $humidity = $data['main']['humidity'];
    $pressure = $data['main']['pressure'];
    $wind = $data['wind']['speed'];
    $direction = $data['wind']['deg'];

    // Insert data into the database
    $insertData = "INSERT INTO weather_info (CityName, ApiDate, temp, icon, main, Descriptions, humidity, pressure, wind, direction)
    VALUES ('$city', '$apiDate', '$temp', '$icon', '$main', '$descriptions', '$humidity', '$pressure', '$wind', '$direction')";

    if (!mysqli_query($conn, $insertData)) {
        die("Failed to insert data: " . mysqli_error($conn));
    }
}

// Fetching data from the database based on the city name
$result = mysqli_query($conn, $selectAllData);
$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;
}

// Set the header before echoing the response
header('Content-Type: application/json');
echo json_encode($rows);
?>
