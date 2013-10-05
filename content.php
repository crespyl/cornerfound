<?php
function site_init()
{
  //basic setup
  define("CACHE_DIR", "/var/www/cache");
  define("TEMPLATE_DIR", "/var/www/templates");

  require_once("libs/markdown/markdown.php");
  require_once("libs/Mustache/Autoloader.php");
  Mustache_Autoloader::register();

  global $mustache_renderer;
  $mustache_renderer = 
    new Mustache_Engine(array(
			      "cache" => CACHE_DIR . "/mustache-templates/",
			      "loader"=> new Mustache_Loader_FilesystemLoader(TEMPLATE_DIR)
			      ));
  global $page;
  global $template;
  global $scripts;
  global $styles;
  $scripts = array('/js/cornerfound.js');
  $styles = array();

  $template = 'main';
  $page = array();
  $page['scripts'] = $scripts;
  $page['styles'] = $styles;
}

function add_script($script)
{
  global $scripts;

  if( !preg_match('/^http/', $script) )
    {
      $trace = debug_backtrace();
      $trace = $trace[0]['file'];
      $trace = str_replace($_SERVER['DOCUMENT_ROOT'],'',$trace);
      $trace = preg_replace('/([^\/]+\.php$)/','',$trace);

      $scripts[]= '/' . $trace . $script;
    }
  else
    $scripts[]= $script;
}

function add_style($style)
{
  global $styles;

  if( !preg_match('/^http/', $style) )
    {
      $trace = debug_backtrace();
      $trace = $trace[0]['file'];
      $trace = str_replace($_SERVER['DOCUMENT_ROOT'],'',$trace);
      $trace = preg_replace('/([^\/]+\.php$)/','',$trace);

      $styles[]= '/' . $trace . $style;
    }
  else
    $styles[]= $style;
}

function default_index()
{
  $post = array();
  $post['text'] = load_markdown_file("content/index.md");

  $sidebar = array();
  $sidebar['text'] = load_markdown_file("content/sidebar.md");

  global $page;
  $page['posts'] = array($post);
  $page['sidebar'] = array($sidebar);
}

function posts_index() 
{
  // Build a list of all posts
  $posts = array();

  foreach( scandir('content/words/') as $file )
    {
      if( preg_match('/\.md$/', $file) ) 
	{
	  $post = array(
			'title' => $file,
			'text'  => load_markdown_file('content/words/'.$file)
			);
	  array_push($posts, $post);
	}
    }

  global $page;
  $page['posts'] = $posts;
}

function words() 
{
  $matches = array();
  preg_match('/^\/words\/(.+)/', $_SERVER['REQUEST_URI'], $matches);

  if( !empty($matches) ) 
    {
    $postname = str_replace('..','',$matches[1]);
    $postfile = "content/words/".$postname.".md";

    if( !file_exists($postfile) ) 
      {
	posts_index();
	return;
      }

    $post = array();
    $post['text'] = load_markdown_file($postfile);

    global $page;
    $page['posts'] = array($post);
  }

  else 
    {
      // No post requested
      posts_index();
      return;
    }
}

function experiments_index()
{
  // Build a list of all experiments
  $text = '<ul>';

  foreach( scandir('content/experiments/') as $file )
    {
      if( $file !== '.' && $file !== '..' )
      if( is_dir('content/experiments/'.$file) )
	{
	  $text .= '<li>';
	  $text .= '<a href="/experiments/'.$file.'">'.$file.'</a>';
	  $text .= '</li>';
	}
    }

  $text .= '</ul>';

  global $page;
  $page['posts'][]= array('text'=>$text);
}

function experiments()
{
  $matches = array();
  preg_match('/^\/experiments\/(.+)/', $_SERVER['REQUEST_URI'], $matches);

  if( !empty($matches) ) 
    {
      $name = str_replace('..','',$matches[1]);
      $name = str_replace('/','', $name);

      $index = "content/experiments/".$name."/".$name.".php";

      if( !file_exists($index) )
	{
	  experiments_index();
	  return;
	}

      global $page;
      global $template;

      ob_start();
      include $index;
      $content = ob_get_contents();
      ob_end_clean();


      $template = 'experiment';
      $page['experiment'] = $content;
      return;
    }

  else 
    {
      // No specific experiment requested
      experiments_index();
      return;
    }
}


// Here begins the actual site logic //
site_init();

// Parse request uri for desired content
if
  (preg_match( '/^\/words/', $_SERVER['REQUEST_URI'])) { words(); }
else if
  (preg_match( '/^\/experiments/', $_SERVER['REQUEST_URI'])) { experiments(); }

// If all else fails, show an index page
else { default_index(); }


global $mustache_renderer;
global $page;
global $template;
global $scripts;
global $styles;

$page['scripts'] = $scripts;
$page['styles'] = $styles;

echo $mustache_renderer->render($template, $page);

?>
