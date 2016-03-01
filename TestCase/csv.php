<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$file = fopen('csv_test.txt', 'r');
while ($data = fgetcsv($file)) { //每次读取CSV里面的一行内容
//    print_r($data); //此为一个数组，要获得每一个数据，访问数组下标即可
    $goods_list[] = $data;
}
print_r($goods_list);

fclose($file);


$file = fopen('output.txt', "w+");
foreach ($goods_list as $lineArray) {
    $jsString = "";
    foreach ($lineArray as $arr) {
        $jsString .= $arr . "\t";
    }
    $jsString = rtrim($jsString, "\t");
    $jsString .= "\r\n";
    fwrite($file, $jsString);
}

fclose($file);

?>