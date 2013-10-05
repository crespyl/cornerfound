<?php
global $result;
$result = array();
$result['status'] = 'ok';

$action = $_SERVER['REQUEST_URI'];
$action = explode('?',$action)[0];
$action = str_replace('/api/','',$action);

if( file_exists('api/'.$action.'.php') )
  {
    include "api/".$action.".php";
  }

else
  {
    $result['status'] = 'failure';
    $result['detail'] = 'no such action';
  }

echo json_encode($result);
?>