<?php

function recursive_index($root_dir, $dir, $file_limit, $depth) 
{
  if( !file_exists($root_dir .'/'. $dir) ) 
    return 'nofile';

  else
    {
      $dir_contents = array(
			    'files' => array(),
			    'subdirs' => array()
			    );
      $num_files = 0;
      foreach( scandir($root_dir .'/'. $dir) as $filename )
	{
	  if( $filename == '.' || $filename == '..' )
	    continue;

	  $filepath = "$root_dir/$dir/$filename";
	  if( is_dir($filepath) ) {
	    if( $depth > 0 )
	      $dir_contents['subdirs'][$filename] = recursive_index($root_dir .'/'. $dir, $filename, $depth-1);
	    else
	      $dir_contents['subdirs'][$filename] = array();
	  }
	  else if( $num_files <= $file_limit ) {
	    $dir_contents['files'][]= $filename;
	    $num_files += 1;
	  }
	}

      return $dir_contents;
    }
}

$root_dir = $_SERVER['DOCUMENT_ROOT'];

$dir = $_GET['dir'];
$dir = str_replace('..','',$dir);
$file_limit = $_get['file_limit'];
$depth = intval($_GET['depth']);

if( empty($file_limit) ) $file_limit = 5;
if( empty($depth) ) $depth = 2;

$result['contents'] = recursive_index($root_dir, $dir, $file_limit, $depth);

?>
