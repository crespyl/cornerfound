<?php 

add_script('board.js');
add_style('board.scss');

echo '<div class="row" style="text-align: center">';


echo '<div class="controls block col-md-2">';

echo '<div class="btn btn-danger clear">X</div>';

echo '<div class="btn-group colors">';
echo '<div class="btn color-black" data-color="black">-</div>';
echo '<div class="btn color-green" data-color="green">-</div>';
echo '<div class="btn color-blue" data-color="blue">-</div>';
echo '<div class="btn color-red" data-color="red">-</div>';
echo '</div>';

echo '</div>';

echo '<div class="block col-md-9">';
echo '<canvas id="canvas" width="600" height="500" style="border: 1px solid black;"></canvas>';
echo '</div>';

echo '</div>';

?>
