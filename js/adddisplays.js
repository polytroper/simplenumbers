BinaryOperator = function(spec){
	var {
		element,
		operation = math.add,
	} = spec;

	var aCanvas = element.querySelector("#aCanvas");
	var bCanvas = element.querySelector("#bCanvas");
	var cCanvas = element.querySelector("#cCanvas");

	var operator = element.querySelector("#operator");
	var animation0 = element.parentNode.querySelector("#animation0");
	var animation1 = element.parentNode.querySelector("#animation1");
	var animation2 = element.parentNode.querySelector("#animation2");

	var operandValue = math.complex(1, 0);

	var inValues = [
		math.complex(-1, 2),
		math.complex(1, 2),

		math.complex(-2, 0),
		math.complex(-1.5, -0.5),
		math.complex(-1, -0.75),
		math.complex(-0.5, -0.9),
		math.complex(0, -1),
		math.complex(0.5, -0.9),
		math.complex(1, -0.75),
		math.complex(1.5, -0.5),
		math.complex(2, 0),
	];

	var outValues = [];
	var expression = null;

	var timerId = 0;
    var FPS = 30;
    var time = 0;
    var timeDelta = 1;

    var redraw = true;

    var animationTimestamp = 0;

    var start = function(){
        timeDelta = 1/FPS;
        timerId = setInterval(function() {
          update();
        }, 1000/FPS);

        update();
        window.requestAnimationFrame(step);
    }

    var step = function(timestamp) {
        if (redraw) {
            draw();
            redraw = false;
        }
        animationTimestamp = timestamp;
        window.requestAnimationFrame(step);
    }

    var draw = function() {
    	for (var i = 0; i < layers.length; i++) {
    		layers[i].draw();
    	}
    }

    var update = function() {
        time = time+timeDelta;

        if (expression != null) {
        	var v = expression.eval({t: time});
        	setOperandValue(v);
        	redraw = true;
        }

    	for (var i = 0; i < layers.length; i++) {
    		redraw = layers[i].update(time, timeDelta) || redraw;
    	}

    }

	var setOperandValue = function(OPERANDVALUE){
		operandValue = makeComplex(OPERANDVALUE);
		outValues.length = 0;
		for (var i = 0; i < inValues.length; i++) {
			outValues.push(operation(inValues[i], operandValue));
		}
    	for (var i = 1; i < layers.length; i++) {
    		layers[i].refresh();
    	}
	}
	var getOperandValue = function(){
		return operandValue;
	}

	var getInValues = function(){
		return inValues;
	}

	var getOutValues = function(){
		return outValues;
	}

	var onOperatorClick = function(){
		if (operation == math.multiply) {
			operation = math.divide;
			operator.innerHTML = "/";
		}
		else if (operation == math.divide) {
			operation = math.multiply;
			operator.innerHTML = "&Cross;";
		}
		else if (operation == math.add) {
			operation = math.subtract;
			operator.innerHTML = "&minus;";
		}
		else if (operation == math.subtract) {
			operation = math.add;
			operator.innerHTML = "&plus;";
		}

		setOperandValue(operandValue);
	}

	var onAnimation0Click = function(){
		expression = math.compile("sin(t*pi/4)");
	}

	var onAnimation1Click = function(){
		expression = math.compile("sin(t*pi/4)*i");
	}

	var onAnimation2Click = function(){
		expression = math.compile("e^(t*pi*i/4)");
	}

	var clearExpression = function(){
		expression = null;
	}

	var inDisplay = InDisplay({
		canvas: aCanvas,
		setOperandValue,
		getOperandValue,
		getInValues,
	});

	var operandDisplay = OperandDisplay({
		canvas: bCanvas,
		setOperandValue,
		getOperandValue,
		clearExpression,
	});

	var outDisplay = OutDisplay({
		canvas: cCanvas,
		setOperandValue,
		getOperandValue,
		getInValues,
		getOutValues,
	});

	var layers = [inDisplay.layer, operandDisplay.layer, outDisplay.layer];

	setOperandValue(math.complex(2, 2));

	operator.addEventListener("click", onOperatorClick);

	animation0.addEventListener("click", onAnimation0Click);
	animation1.addEventListener("click", onAnimation1Click);
	animation2.addEventListener("click", onAnimation2Click);
	onAnimation2Click();

	start();

	return Object.freeze({

	});
}

InDisplay = function(spec){
	var {
		canvas,
		setOperandValue,
		getOperandValue,
		getInValues,
	} = spec;

	var layer = Layer({
		name: "Square Canvas",
		canvas,
	});

	var maximum = 5;
	var resolution = parseInt(canvas.width);
	var interactive = false;

	var draw = function(context){
		var inValues = getInValues();

		for (var i = 0; i < inValues.length; i++) {
			var x = transformX(inValues[i].re);
			var y = transformY(inValues[i].im);
			var r = scaleX(0.25);

			context.beginPath();
			context.arc(x, y, r, 0, math.pi*2);
			if (interactive) context.fillStyle = "#08F";
			else context.fillStyle = "#888";
			context.fill();
		}
	}

	var redraw = function(){
		layer.refresh();
		//layer.draw();
	}
	
	var onMouseMove = function(event){
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
		layer,
	});
}

OperandDisplay = function(spec){
	var {
		canvas,
		setOperandValue,
		getOperandValue,
		clearExpression,
	} = spec;

	var layer = Layer({
		name: "Root Canvas",
		canvas,
	});

	var maximum = 5;
	var resolution = parseInt(canvas.width);
	var interactive = true;

	var click = true;

	var draw = function(context){
		var operandValue = getOperandValue();

		var x = transformX(operandValue.re);
		var y = transformY(operandValue.im);
		var r = scaleX(0.25);

		context.beginPath();
		context.arc(x, y, r, 0, math.pi*2);
		if (click) context.fillStyle = "#F80";
		else context.fillStyle = "#08F";
		context.fill();

		drawArrow(context, math.complex(0, 0), operandValue, transformX, transformY, scaleX);

		context.font = "30px Geneva";
		var str = "";
		str += trunc(operandValue.re, 1)+" + ";
		str += trunc(operandValue.im, 1)+"i";
		context.fillStyle = "#444";
		context.textBaseline = "top";
		context.textAlign = "center";
		context.fillText(str, transformX(0), transformY(maximum));
	}

	var redraw = function(){
		layer.refresh();
		//layer.draw();
	}

	var onMouseMove = function(event){
		if (interactive && click) {
			var x = untransformX(event.offsetX);
			var y = untransformY(event.offsetY);
			value = math.complex(trunc(x, 1), trunc(y, 1));
			setOperandValue(value);
			clearExpression();
			return true;
		}
	}
	var onMouseDown = function(event){
		click = true;
		onMouseMove(event);
	}
	var onMouseUp = function(event){
		click = false;
		redraw();
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
		layer,
	});
}

OutDisplay = function(spec){
	var {
		canvas,
		setOperandValue,
		getOperandValue,
		getInValues,
		getOutValues,
	} = spec;

	var layer = Layer({
		name: "Square Canvas",
		canvas,
	});

	var maximum = 5;
	var resolution = parseInt(canvas.width);
	var interactive = false;

	var draw = function(context){
		var inValues = getInValues();
		var outValues = getOutValues();

		for (var i = 0; i < outValues.length; i++) {
			var x = transformX(outValues[i].re);
			var y = transformY(outValues[i].im);
			var r = scaleX(0.25);

			context.beginPath();
			context.arc(x, y, r, 0, math.pi*2);
			if (interactive) context.fillStyle = "#08F";
			else context.fillStyle = "#888";
			context.fill();
		}

		for (var i = 0; i < outValues.length; i++) {
			drawArrow(context, inValues[i], outValues[i], transformX, transformY, scaleX);
		}
	}

	var redraw = function(){
		layer.refresh();
		//layer.draw();
	}
	
	var onMouseMove = function(event){

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
		layer,
	});
}


var drawArrow = function(context, point0, point1, transformX, transformY, scaleX){
		var x0 = transformX(point0.re);
		var y0 = transformY(point0.im);

		var x1 = transformX(point1.re);
		var y1 = transformY(point1.im);

		var vec = point1.sub(point0);
		var vecX = scaleX(vec.re);
		var vecY = scaleX(vec.im);

		var dir = vec.sign();
		var tan = math.complex(-dir.im, dir.re);
		var pip = dir.mul(0.1);

		var start = point0.add(pip);
		var startX = transformX(start.re);
		var startY = transformY(start.im);

		var end = point1.sub(pip).sub(pip);
		var endX = transformX(end.re);
		var endY = transformY(end.im);

		context.lineWidth = 1;
		context.strokeStyle = "#D10";
		context.fillStyle = "#D10";

		context.beginPath();

		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.stroke();
		
		context.moveTo(x0, y0);
		context.arc(x0, y0, scaleX(0.1), 0, math.pi*2);
		context.fill();

		var corner0 = end.add(tan.mul(-0.1));
		var corner1 = end.add(tan.mul(0.1));

		context.moveTo(x1, y1);
		var corner0X = transformX(corner0.re);
		var corner0Y = transformY(corner0.im);
		context.lineTo(corner0X, corner0Y);

		var corner1X = transformX(corner1.re);
		var corner1Y = transformY(corner1.im);
		context.lineTo(corner1X, corner1Y);
		context.lineTo(x1, y1);
		context.fill();
}