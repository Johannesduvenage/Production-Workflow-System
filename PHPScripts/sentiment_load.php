<?php
	require '../Classes/PHPInsight/Autoloader.php';

	PHPInsight\Autoloader::register();
	$sentiment = new \PHPInsight\Sentiment();

	if($_GET['text'])
	{
		$scores = $sentiment->score($_GET['text']);
		$class = $sentiment->categorise($_GET['text']);
		if($class==="neg")
			$category = "Negative";
		else if($class==="neu")
			$category = "Neutral";
		else if($class==="pos")
			$category = "Positive";
		else
			$category = "Unknown";

		echo "{";
				echo "\"messageText\": \"".$_GET['text']."\",";
				echo "\"CategorizedAs\": \"".$category."\",";
				echo "\"CategorizationAmount\": \"".$scores[$class]."\",";
				echo "\"Negative\": \"".$scores['neg']."\",";
				echo "\"Neutral\": \"".$scores['neu']."\",";
				echo "\"Positive\": \"".$scores['pos']."\"";
		echo "}";
	}

?>