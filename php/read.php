<?php
      header("Access-Control-Allow-Origin: *"); // Allow requests from any origin (not recommended for production)
      header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow specific HTTP methods
      header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
      
  
  $servername = "s198.goserver.host";  // Hostname des Datenbankservers
  $username = "web177_2";     // Benutzername für den Datenbankzugriff
  $password = "Ten.avaj99";     // Passwort für den Datenbankzugriff
  $dbname = "web177_db2";  // Name der Datenbank

    $db = new mysqli($servername, $username, $password, $dbname);
        
    $results = $db->query('SELECT * FROM Entries');
    $data = array();
    while ($row = $results->fetch_assoc()) {
        array_push($data, $row);
    }
    echo json_encode($data);
    $db->close();
