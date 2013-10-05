<?php

if(stripos($_SERVER['REQUEST_URI'], '/api') === 0) {
  include "api.php";
}

else {
  include "content.php";
}
?>