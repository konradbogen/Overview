<?php
        header("Access-Control-Allow-Origin: *"); // Allow requests from any origin (not recommended for production)
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow specific HTTP methods
        header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
        
    
    $servername = "s198.goserver.host";  // Hostname des Datenbankservers
    $username = "web177_2";     // Benutzername für den Datenbankzugriff
    $password = "Ten.avaj99";     // Passwort für den Datenbankzugriff
    $dbname = "web177_db2";  // Name der Datenbank

    
    $bracket = $_POST['bracket'];
    $content = $_POST['content'];
    $deleteQuery = "DELETE FROM Entries WHERE bracket='" . $bracket . "'";
    $deleteEdgeQuery =  "DELETE FROM Edges WHERE target='" . $bracket . "' OR source='" . $bracket . "'";
    
    $query = "INSERT INTO Entries (bracket, content) VALUES ('" . $bracket . "', '" . $content . "')";
    echo $query;
   
 
    $db = new mysqli($servername, $username, $password, $dbname);
    $db->query($deleteQuery);
    $db->query($deleteEdgeQuery);
    $db->query($query);
    $db->close();