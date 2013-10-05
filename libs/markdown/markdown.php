<?php
require_once('libs/markdown/php-markdown-extra-extended/markdown_extended.php');

function load_markdown_file($sourcefile) {
  $realpath = realpath($sourcefile);

  $cachefile = CACHE_DIR . '/markdown/' . str_replace('/', '_', $realpath);
  $html = "";

  if( file_exists($cachefile) && filemtime($cachefile) > filemtime($realpath)) {
    $html  = "<!-- markdown file $sourcefile loaded from cache -->";
    $html .= file_get_contents($cachefile);

  } else {

    require_once('libs/geshi/geshi.php');
    $code_regex = '\'<pre><code class="language-((\w|-|_)+)">(([^(</code></pre>)]|\w|\(|\)|\/)*)(</code></pre>)\'';
    
    $text = file_get_contents($sourcefile);
    $html = MarkdownExtended($text);

    $do_highlight = function($matches) {
      $lang = $matches[1];
      $code = htmlspecialchars_decode($matches[3]);

      $geshi = new GeSHi($code, $lang);
      $geshi->enable_classes();
      $geshi->set_header_type(GESHI_HEADER_DIV);
      $geshi->set_overall_class('source');
      $out = $geshi->parse_code();

      return $out;
    };

    $highlight = preg_replace_callback($code_regex, $do_highlight, $html);
    $html = $highlight;
    
    file_put_contents($cachefile, $html);

    $html = "<!-- markdown file $sourcefile freshly hashed just for you -->" . $html;
  }
  return $html;
}

?>
