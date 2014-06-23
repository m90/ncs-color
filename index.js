(function(root, factory){
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.returnExports = factory();
	}

})(this, function(){

	function convert(n){

		var
		ncs = n.slice(n.match(/^NCS\sS/) !== null ? 5 : 3).trim()
		, RGB = {}
		, Sn = parseInt(ncs.substr(0,2), 10)
		, Cn = parseInt(ncs.substr(2,2), 10)
		, C1 = ncs.substr(5,1)
		, N = parseInt(ncs.substr(6,2), 10) || 0;

		if (C1 !== 'N'){

			var
			S = (1.05 * Sn - 5.25)
			, C = Cn
			, Sx = Sn < 10 ? '0' + Sn : Sn
			, Cx = Cx < 10 ? '0' + Cn : Cn
			, Nx = N < 10 ? '0' + N : N
			, C1x = parseInt(C1, 10)
			, C2x
			, Ra
			, x1
			, Ba
			, x2
			, x3
			, x4
			, x5
			, Ga
			, x6
			, x7
			, x8
			, Rc
			, Gc
			, Bc
			, top
			, ss;

			if (C1 === ' R') {
				C2x = 'B';
			} else if (C1 === 'B') {
				C2x = 'G';
			} else if (C1 === 'G') {
				C2x = 'Y';
			} else {
				C2x = 'R';
			}

			// determine red
			if (C1 === 'Y' && N <= 60) {
				Ra = 1;
			} else if (( C1 === 'Y' && N > 60) || ( C1 === 'R' && N <= 80)) {
				if (C1 === 'Y') {
					x1 = N - 60;
				} else {
					x1 = N + 40;
				}
				Ra = ((Math.sqrt(14884 - Math.pow(x1, 2))) - 22) / 100;
			} else if ((C1 === 'R' && N > 80) || (C1 === 'B')) {
				Ra = 0;
			} else if (C1 === 'G') {
				x1 = (N - 170);
				Ra = ((Math.sqrt(33800 - Math.pow(x1, 2))) - 70) / 100;
			}

			// determine blue
			if (C1 === 'Y' && N <= 80) {
				Ba = 0;
			} else if (( C1 === 'Y' && N > 80) || ( C1 === 'R' && N <= 60)) {
				if (C1=='Y') {
					x2 = (N - 80) + 20.5;
				} else {
					x2 = (N + 20) + 20.5;
				}
				Ba = (104 - (Math.sqrt(11236 - Math.pow(x2, 2)))) / 100;
			} else if ((C1 === 'R' && N > 60) || ( C1 === 'B' && N <= 80)) {
				if (C1 ==='R') {
					x3 = (N - 60 ) - 60;
				} else {
					x3 = (N + 40 ) - 60;
				}
				Ba = ((Math.sqrt(10000 - Math.pow(x3, 2))) - 10) / 100;
			} else if (( C1 === 'B' && N > 80) || ( C1 === 'G' && N <= 40)) {
				if (C1=='B') {
					x5 = (N - 80 ) - 131;
				} else {
					x5 = (N + 20 ) - 131;
				}
				Ba = (122 - (Math.sqrt(19881 - Math.pow(x5, 2)))) / 100;
			} else if (C1 === 'G' && N > 40) {
				Ba = 0;
			}

			// determine green
			if (C1 === 'Y') {
				Ga = ( 85 - 17/20 * N ) / 100;
			} else if ( C1 === 'R' && N <= 60 ) {
				Ga = 0;
			} else if ( C1 === 'R' && N > 60 ) {
				x6 = (N - 60) + 35;
				Ga = (67.5 - (Math.sqrt(5776 - Math.pow(x6, 2)))) / 100;
			} else if ( C1 === 'B' && N <= 60 ) {
				x8 = (1*N - 68.5);
				Ga = (6.5 + (Math.sqrt(7044.5 - Math.pow(x8, 2)))) / 100;
			} else if (( C1 === 'B' && N > 60) || ( C1 === 'G' && N <= 60)) {
				Ga = 0.9;
			} else if ( C1 === 'G' && N > 60 ) {
				x7 = (N - 60);
				Ga = ( 90 - (1/8 * x7 )) / 100;
			}

			// determine saturation
			x2 = (Ra + Ga + Ba)/3;
			Rc = ((x2 - Ra) * (100 - C) / 100) + Ra;
			Gc = ((x2 - Ga) * (100 - C) / 100) + Ga;
			Bc = ((x2 - Ba) * (100 - C) / 100) + Ba;

			// determine blackness
			if (Rc > Gc && Rc > Bc) {
				top = Rc;
			} else if (Gc > Rc && Gc > Bc) {
				top = Gc;
			} else if (Bc > Rc && Bc > Gc) {
				top = Bc;
			} else {
				top = (Rc + Gc + Bc) / 3;
			}

			ss = 1 / top;

			RGB.R = parseInt((Rc * ss * (100 - S) / 100) * 255, 10);
			RGB.G = parseInt((Gc * ss * (100 - S) / 100) * 255, 10);
			RGB.B = parseInt((Bc * ss * (100 - S) / 100) * 255, 10);

		} else {

			RGB.R = RGB.G = RGB.B = parseInt((1 - Sn / 100) * 255, 10);

		}
		return RGB;

	}

	function hexify(val){
		return val.toString(16).length > 1 ? val.toString(16) : '0' + val.toString(16);
	}


	function toHex(RGB){
		return '#' + hexify(RGB.R) +  hexify(RGB.G) + hexify(RGB.B);
	}

	function toRgb(RGB){
		return 'rgb(' + [RGB.R, RGB.G, RGB.B].join(',') + ')';
	}


	return {
		hex : function(val){
			return toHex(convert(val));
		}
		, rgb : function(val){
			return toRgb(convert(val));
		}
	}

});