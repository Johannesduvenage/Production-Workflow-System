<?php
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

					
					// First remove the file from the server as we have already converted stored the data
					unlink($filename);

					//json function start  here
					echo "{";
					for ($i=1;$i<$lastRow1;$i++)
					{
									$a=str_replace('[', '(', $excel_arr1[$i][0]);
									$a=str_replace(']', ')', $a);
									$a=str_replace('.', ',', $a);
									$a=str_replace('#', '_', $a);
									$a=str_replace('$', '_', $a);
									$a=str_replace('/', '|', $a);
									$a=str_replace('-', '|', $a);
									echo "\"".$a." (Refer LOV List)"."\":";	//prints lhs
									

									if($i+1<$lastRow1)
									{
										if($excel_arr1[$i][0]===$excel_arr1[$i+1][0])//checks duplicate value
										{
											echo "\"";
											echo $excel_arr1[$i][1];//first duplicate value
											while($excel_arr1[$i][0]===$excel_arr1[$i+1][0])
											{
												echo ",";
												echo $excel_arr1[$i+1][1];
												$i++;
												if($i==$lastRow1-1)
													break;
											}
											echo "\"";
										}	//if ends here		

										elseif(is_numeric($excel_arr1[$i][1]))
										{
											echo $excel_arr1[$i][1];
										}//to avoid inverted comma for number
										else
										{
											echo "\"".$excel_arr1[$i][1]."\"";
										}
									}
									else
									{
										if(is_numeric($excel_arr1[$i][1]))
										{
											echo $excel_arr1[$i][1];
										}//to avoid inverted comma for number
										else
										{
											echo "\"".$excel_arr1[$i][1]."\"";
										}
									}
						

										if($i!=$lastRow1-1)
											echo ",";
										else
											break;
						}
						echo "}";
			}
?>