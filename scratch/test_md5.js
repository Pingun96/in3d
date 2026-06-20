import SparkMD5 from 'spark-md5';
import fs from 'fs';

const data = fs.readFileSync('package.json');
// ArrayBuffer conversion
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

const spark = new SparkMD5.ArrayBuffer();
spark.append(arrayBuffer);
const md5Hash = spark.end();
console.log('MD5:', md5Hash);
