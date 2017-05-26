SquareRoot = function(spec){
	var {
		element,
	} = spec;

	var squareCanvas = element.querySelector("#squareCanvas");
	var rootCanvas = element.querySelector("#rootCanvas");
	var operator = element.querySelector("#operator");

	var squareValue = math.complex(1, 0);
	var rootValue = math.complex(1, 0);

	var setSquareValue = function(SQUAREVALUE){
		squareValue = makeComplex(SQUAREVALUE);
		rootValue = makeComplex(math.sqrt(squareValue));
		squareDisplay.redraw();
		rootDisplay.redraw();
		refreshOperator();
	}
	var getSquareValue = function(){
		return squareValue;
	}

	var setRootValue = function(ROOTVALUE){
		rootValue = makeComplex(ROOTVALUE);
		squareValue = makeComplex(math.pow(rootValue, 2));
		squareDisplay.redraw();
		rootDisplay.redraw();
		refreshOperator();
	}
	var getRootValue = function(){
		return rootValue;
	}

	var refreshOperator = function(){
		var str = "";
		if (rootValue.im != 0) {
			var v = trunc(rootValue.im, 1);
			v = trail(v);
			str += v+"i &Cross; "+v+"i";
		}
		else {
			var v = trunc(rootValue.re, 1);
			v = trail(v);
			str += v+" &Cross; "+v;
		}
		str += " = "+trail(trunc(squareValue.re, 1));
		operator.innerHTML = str;
	}

	var squareDisplay = SquareDisplay({
		canvas: squareCanvas,
		setSquareValue,
		getSquareValue,
		setRootValue,
		getRootValue,
		interactive: true,//invertInteraction,
	});

	var rootDisplay = RootDisplay({
		canvas: rootCanvas,
		setSquareValue,
		getSquareValue,
		setRootValue,
		getRootValue,
		interactive: true,//!invertInteraction,
	});

	squareDisplay.redraw();
	rootDisplay.redraw();

	refreshOperator();

	return Object.freeze({

	});
}

SquareDisplay = function(spec){
	var {
		canvas,
		setSquareValue,
		getSquareValue,
		setRootValue,
		getRootValue,
		interactive,
	} = spec;

	var layer = Layer({
		name: "Square Canvas",
		canvas,
	});

	var maximum = 5;
	var resolution = parseInt(canvas.width);

	var draw = function(context){
		var squareValue = getSquareValue();

		var x = transformX(squareValue.re);
		var y = transformY(squareValue.im);
		var r = scaleX(0.25);

		context.beginPath();
		context.arc(x, y, r, 0, math.pi*2);
		if (interactive) context.fillStyle = "#08F";
		else context.fillStyle = "#888";
		context.fill();

		context.font = "30px Geneva Sans-Serif";
		var v = getSquareValue();
		var str = trunc(v.re, 1).toString();
		context.fillStyle = "#444";
		context.textBaseline = "top";
		context.textAlign = "center";
		context.fillText(str, transformX(0), transformY(maximum));

		console.log("Drawing at %s, %s", x, y);
	}

	var redraw = function(){
		layer.refresh();
		layer.draw();
	}
	
	var onMouseMove = function(event){
		if (interactive) {
			var value = untransformX(event.offsetX);
			value = trunc(value, 1);
			setSquareValue(value);
			return true;
		}
	}
	var onMouseDown = function(event){
		
	}
	var onMouseUp = function(event){
		
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

	var grid = Grid({
		maximum,
		resolution,
	});
	layer.addComponent(grid);

	grid.setShowY(false);

	layer.addComponent({
		draw,
		onMouseMove,
		onMouseDown,
		onMouseUp,
	});

	return Object.freeze({
		redraw,
	});
}

RootDisplay = function(spec){
	var {
		canvas,
		setSquareValue,
		getSquareValue,
		setRootValue,
		getRootValue,
		interactive,
	} = spec;

	var layer = Layer({
		name: "Root Canvas",
		canvas,
	});

	var maximum = 5;
	var resolution = parseInt(canvas.width);

	var draw = function(context){
		var rootValue = getRootValue();

		var x = transformX(rootValue.re);
		var y = transformY(rootValue.im);
		var r = scaleX(0.25);

		context.beginPath();
		context.arc(x, y, r, 0, math.pi*2);
		if (interactive) context.fillStyle = "#F80";
		else context.fillStyle = "#888";
		context.fill();

		context.font = "30px Geneva";
		var v = getRootValue();
		var str = "";
		if (v.im != 0) str += trunc(v.im, 1)+"i";
		else str += trunc(v.re, 1);
		context.fillStyle = "#444";
		context.textBaseline = "top";
		context.textAlign = "center";
		context.fillText(str, transformX(0), transformY(maximum));

		console.log("Drawing at %s, %s", x, y);
	}

	var redraw = function(){
		grid.setShowY(getRootValue().im != 0);
		layer.refresh();
		layer.draw();
	}

	var onMouseMove = function(event){
		if (interactive) {
			var value = untransformX(event.offsetX);
			value = trunc(value, 1);
			setRootValue(value);
			return true;
		}
	}
	var onMouseDown = function(event){
	}
	var onMouseUp = function(event){
		
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

	var grid = Grid({
		maximum,
		resolution,
	});
	layer.addComponent(grid);

	layer.addComponent({
		draw,
		onMouseMove,
		onMouseDown,
		onMouseUp,
	});

	return Object.freeze({
		redraw,
	});
}