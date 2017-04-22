<?php

include_once('../Classes/PHPColorThief/colorsofimage.class.php');

			$colors_of_image = new ColorsOfImage($_GET['image']);
			$colors = $colors_of_image->getProminentColors();

			echo "{";
			for($i=0;$i<count($colors);$i++)
			{
				echo "\"color".$i."\":\"".$colors[$i]."\"";
				if($i!=count($colors)-1)
					echo ",";
			}
			echo "}";
?>

