<?php
		error_reporting(E_ERROR | E_PARSE);
			require_once "../Classes/PHPExcel.php";//main library
			if($_GET["filename"])
			{
				$filename = $_GET["filename"];
					//first file processing
					$tmpfname1 = $filename;//Using variable to store excel file name
					$excelReader1 = PHPExcel_IOFactory::createReaderForFile($tmpfname1);// Used to find file format and initialize reader
					$excelObj1 = $excelReader1->load($tmpfname1);//object of reader
					$worksheet1 = $excelObj1->getSheet(0);//first sheet
					$lastRow1 = $worksheet1->getHighestRow();
					$lastCol1= $worksheet1->getHighestDataColumn();
					$colNum1 = PHPExcel_Cell::columnIndexFromString($lastCol1);//to obtain number of column in integer
					$excel_arr1=$worksheet1->toArray(null,true,true,false);

					//removing duplicate keyvalues 
					for($i=0;$i<$colNum1;$i++)
					{
						for($j=$i+1;$j<$colNum1;$j++)
						{
							if($excel_arr1[3][$i]===$excel_arr1[3][$j])
								$excel_arr1[3][$j]=preg_replace('/ /', '1', $excel_arr1[3][$j], 1);

						}
					}

					// First remove the file from the server as we have already converted stored the data
					unlink($filename);

					//json function start  here
					echo "[";
					for ($i=5;$i<$lastRow1;$i++)
					{
						echo "{";
						for ($j=0;$j<$colNum1;$j++)
						{
							$search  = array('[', ']', '.', '#', '$', '/', '-');
							$replace = array('(', ')', ',', '_', '_', '|', '|');
							$clear = str_replace($search, $replace, $excel_arr1[3][$j]);
						
							echo "\"".$clear."\":";
							if(is_numeric($excel_arr1[$i][$j]))
								{
									echo $excel_arr1[$i][$j];
								}
							else
								{
									$a=str_replace('"', '\'', $excel_arr1[$i][$j]); 
									echo "\"".$a."\"";
								}
							if($j!=$colNum1-1)
								{
									echo ",";
								}
						}
						echo "}";

						if($i!=$lastRow1-1)
						{
							echo ",";
						}
						else break;
					}
					echo "]";
			}
					/*
					$array1 = ["Lead time for the SKU - Home Delivery [No. of days]", "Neck/Collar (Refer LOV List)"];
					$array2 = array
							  (
							  array("Rushabh", "Wadkar"),
							  array("Manish", "Tandel"),
							  array("Yash", "Dorle"),
							  array("Rushit", "Pandya"),
							  array("Neha", "Sinha")
							  );

					echo "[";
					for($i=0;$i<count($array2);$i++)
					{
						echo "{";
						for($j=0;$j<count($array1);$j++)
						{
							echo "\"".$array1[$j]."\":\"".$array2[$i][$j]."\"";
							if($j!=count($array1)-1)
								echo ",";
						}
						echo "}";
						if($i!=count($array2)-1)
							echo ",";
					}
					echo "]";
					*/
?>