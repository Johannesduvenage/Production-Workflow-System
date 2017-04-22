<?php
	error_reporting(E_ALL);
	ini_set('display_errors', TRUE);
	ini_set('display_startup_errors', TRUE);
	date_default_timezone_set('Europe/London');
	if (PHP_SAPI == 'cli')
		die('This example should only be run from a Web Browser');

	require_once '../Classes/PHPFirebase/firebaseLib.php';
	require_once '../Classes/PHPExcel.php';
	$file_name = $_GET['filename'];
	$company_name = $_GET['companyname'];
	const DEFAULT_URL = 'https://alphaqa-4a235.firebaseio.com/';
	const DEFAULT_TOKEN = 'FXwNberzLH8CZuQhNGIoE4mVtOjpXoGSjffp80Iw';
	$DEFAULT_PATH = '/FileData/'.$file_name.'/completed';
	$firebase = new \Firebase\FirebaseLib(DEFAULT_URL, DEFAULT_TOKEN);

	// --- reading the stored string ---
	$fileCompletedData = json_decode($firebase->get($DEFAULT_PATH), true);

	$titleArray = array();
	foreach ($fileCompletedData as $key => $value) {
	    foreach ($fileCompletedData[$key] as $key => $value) {
	    	array_push($titleArray, $key);
	    }
	    break;
	}

	// Create new PHPExcel object
	$objPHPExcel = new PHPExcel();
	// Set document properties
	$objPHPExcel->getProperties()->setCreator("Rushabh Wadkar - The Developer")
								 ->setTitle("Quality Assessment by ALPHA QA")
								 ->setSubject("Company : ".$company_name)
								 ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
								 ->setKeywords("QA Quality Angular Production")
								 ->setCategory("QA Assessment");

	$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');	            
	$objSheet1 = $objPHPExcel->getSheet(0);

	for($col = 0; $col < count($titleArray); $col++)
	{
		$colString = PHPExcel_Cell::stringFromColumnIndex($col);
		$objSheet1->getCell($colString.'1')->setValue($titleArray[$col]);
		if($col === count($titleArray)-1)
			$end = $colString;
	}

	$row = 2;
	$col = 0;
	foreach ($fileCompletedData as $key => $value) {
		$col = 0;
		foreach ($fileCompletedData[$key] as $key => $value) {

			$colString = PHPExcel_Cell::stringFromColumnIndex($col);
			$objSheet1->getCell($colString.$row)->setValue($value);

			if($key === "QAStatus"){
				if($value === "Fail"){
					$objPHPExcel->getActiveSheet()->getStyle('A'.$row.':'.$end.$row)->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID)->getStartColor()->setARGB(PHPExcel_Style_Color::COLOR_RED);
				}
			}
			$col++;
		}
		$row++;
	}


	// Rename worksheet
	$objPHPExcel->getActiveSheet()->setTitle('File Download');

	// Set active sheet index to the first sheet, so Excel opens this as the first sheet
	$objPHPExcel->setActiveSheetIndex(0);
	// Redirect output to a client’s web browser (Excel2007)
	header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	header('Content-Disposition: attachment;filename="output_'.$file_name.'_download.xlsx"');
	header('Cache-Control: max-age=0');
	// If you're serving to IE 9, then the following may be needed
	header('Cache-Control: max-age=1');
	// If you're serving to IE over SSL, then the following may be needed
	header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
	header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // always modified
	header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
	header ('Pragma: public'); // HTTP/1.0

	$objWriter->save('php://output');
	
?>