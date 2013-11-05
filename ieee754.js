/*

Copyright (c) 2013 DeNA Co., Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function buildFloatDecoder(numBytes, exponentBits, exponentBias) {

	var eMax = (1 << exponentBits) - 1;
	var significandBias = Math.pow(2, -(8 * numBytes - 1 - exponentBits));

	return function (bytes, offset) {

		// convert to binary string "00101010111011..."
		var leftBits = "";
		for (var i = 0; i != numBytes; ++i) {
			var t = bytes[i + offset].toString(2);
			t = "00000000".substring(t.length) + t;
			leftBits += t;
		}

		// shift sign bit
		var sign = leftBits.charAt(0) == "1" ? -1 : 1;
		leftBits = leftBits.substring(1);

		// obtain exponent
		var exponent = parseInt(leftBits.substring(0, exponentBits), 2);
		leftBits = leftBits.substring(exponentBits);

		// take action dependent on exponent
		if (exponent == eMax) {
			return sign * Infinity;
		} else if (exponent == 0) {
			exponent += 1;
			var significand = parseInt(leftBits, 2);
		} else {
			significand = parseInt("1" + leftBits, 2);
		}

		return sign * significand * significandBias * Math.pow(2, exponent - exponentBias);
	};
}

var decodeFloat32 = buildFloatDecoder(4, 8, 127);
var decodeFloat64 = buildFloatDecoder(8, 11, 1023);

/*
// test code for decodeFloat32

function encodeFloat32(n) {
	var bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setFloat32(0, n);
	return bytes;
}

function encodeFloat64(n) {
	var bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, n);
	return bytes;
}

function buildChecker(enc, dec) {
	return function (n, maxError) {
		var encoded = enc(n);
		var decoded = dec(encoded, 0);
		if (n === decoded) {
			console.log("ok:" + n);
		} else if (typeof maxError !== "undefined" && Math.abs(n - decoded) < maxError) {
			console.log("ok:" + n + " (got " + decoded + ")");
		} else {
			console.log("ng: expected " + n + " got " + decoded);
		}
	};
}

var check32 = buildChecker(encodeFloat32, decodeFloat32);
var check64 = buildChecker(encodeFloat64, decodeFloat64);

check32(0);
check32(1);
check32(1e8);
check32(1e-8, 1e-13);
check32(Infinity);
check32(-Infinity);
check32(3.4028234e38, 1e35);
check32(1.18e-38, 1e-39);
check32(1.4e-44, 1e-45);
check32(1/3, 1e-5);

check64(0);
check64(1);
check64(1e8);
check64(1e-8, 1e-13);
check64(Infinity);
check64(-Infinity);
check64(1.7976931348623157e308, 1e308);
check64(2.2250738585072014e-308, 1e-309);
check64(4.9406564584124654e-323, 5e-324);
check64(1/3, 1e-8);

//*/
