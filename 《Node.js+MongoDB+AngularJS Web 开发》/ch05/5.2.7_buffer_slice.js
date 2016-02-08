var numbers = new Buffer("123456789");
console.log(numbers.toString());
var slice = numbers.slice(3, 6);
console.log(slice.toString());

// 编辑切片的数据会修改源数据
slice[0] = '#'.charCodeAt(0);
slice[slice.length - 1] = '#'.charCodeAt(0);
console.log(slice.toString());
console.log(numbers.toString());

// 123456789
// 456
// #5#
// 123#5#789