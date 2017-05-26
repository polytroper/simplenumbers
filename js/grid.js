Grid = function(spec){
	var {
		maximum,
		resolution,
		interval = 1,
	} = spec;

	var showX = true;
	var showY = true;

	var draw = function(context){
		var x0 = transformX(-maximum+1);
		var x1 = transformX(maximum-1);
		var y0 = transformY(-maximum+1);
		var y1 = transformY(maximum-1);

		var x = transformX(0);
		var y = transformY(0);
		var w = scaleX(0.1);

		context.beginPath();

		if (showX) {
			context.moveTo(x0, y);
			context.lineTo(x1, y);
		}

		if (showY) {
			context.moveTo(x, y0);
			context.lineTo(x, y1);
		}

		var tickCount = 2*(maximum-2)/interval+2;
		for (var i = 0; i <= tickCount; i++) {
			if (showX) {
				var tickX = lerp(x0, x1, i/tickCount);
				context.moveTo(tickX, y-w);
				context.lineTo(tickX, y+w);
			}

			if (showY) {
				var tickY = lerp(y0, y1, i/tickCount);
				context.moveTo(x-w, tickY);
				context.lineTo(x+w, tickY);
			}
		}

		context.lineWidth = 1;
		context.strokeStyle = "#CCC";
		context.stroke();
	}

	var setShowX = function(SHOWX){
		showX = SHOWX;
	}

	var setShowY = function(SHOWY){
		showY = SHOWY;
	}

	var scaleX = function(v){
		return v*resolution/(maximum*2);
	}

	var scaleY = function(v){
		return v*resolution/(maximum*2);
	}

	var transformX = function(v){
		return remap(-maximum, maximum, 0, resolution, v);
	}

	var transformY = function(v){
		return remap(-maximum, maximum, resolution, 0, v);
	}

	var untransformX = function(v){
		return remap(0, resolution, -maximum, maximum, v);
	}

	var untransformY = function(v){
		return remap(resolution, 0, -maximum, maximum, v);
	}

	return Object.freeze({
		draw,
		setShowX,
		setShowY,
	});
}