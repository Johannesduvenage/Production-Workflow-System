<?php
	
	error_reporting(E_ERROR | E_PARSE);
	$target_dir = "../Files/Uploaded/";
	$target_file = $target_dir . basename($_FILES["file"]["name"]);
	
	if($_FILES['file']['name'])
	{
		move_uploaded_file($_FILES['file']['tmp_name'],$target_file);
	}
	if($_FILES['file']['type'] === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	{
		if(preg_match("/lov/i", $_FILES["file"]["name"]))
			header('Location: convertLOV.php?filename='.$target_file);
		else
			header('Location: convertDatasheet.php?filename='.$target_file);
	}
	else if(preg_match("/(.)zip/", $_FILES["file"]["name"]))			// Checking if it is zip file
	{
		$zip = new ZipArchive;
		$res = $zip->open($target_file);
		if ($res === TRUE) 
		{
		  $zip->extractTo($target_dir);
		  $zip->close();
		  
		  //now removing the zip file from the server
		  unlink($target_file);
		}
		else
		{
		  echo "ZipExtractError";
		}
	}
?>