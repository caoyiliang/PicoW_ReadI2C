function adjustCanvasSize() {
    var canvas = document.getElementById('temp-canvas');
    var parent = canvas.parentNode;
    canvas.width = parent.clientWidth * 0.9;
    canvas.height = parent.clientHeight * 0.9;
    var ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
}

function drawGraph() {
    var canvas = document.getElementById('temp-canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (envTemps.length === 0) {
        return;
    }

    var paddingLeft = 50;   // Left padding
    var paddingRight = 20;  // Right padding
    var paddingBottom = 40; // Bottom padding
    var paddingTop = 20;    // Top padding

    // Calculate the drawable area, excluding padding
    var width = canvas.width / (window.devicePixelRatio || 1) - paddingLeft - paddingRight;
    var height = canvas.height / (window.devicePixelRatio || 1) - paddingBottom - paddingTop;
    
    var start = Math.max(envTemps.length - displayedPoints, 0);
    var visiblePoints = Math.min(envTemps.length - start, displayedPoints);

    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height + paddingTop); // y-axis
    ctx.lineTo(paddingLeft + width, height + paddingTop); // x-axis
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    for (var i = 0; i <= yAxisMax; i += 10) {
        var yPosition = height + paddingTop - (i / yAxisMax) * height;
        ctx.fillText(i, 5, yPosition + 3);
        ctx.beginPath();
        ctx.moveTo(paddingLeft - 5, yPosition);
        ctx.lineTo(paddingLeft + 5, yPosition);
        ctx.stroke();
    }

    // Draw environment temperature curve
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    for (var i = start; i < envTemps.length; i++) {
        var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
        var yPosition = height + paddingTop - (envTemps[i] / yAxisMax) * height;
        if (i === start) {
            ctx.moveTo(xPosition, yPosition);
        } else {
            ctx.lineTo(xPosition, yPosition);
        }
    }
    ctx.stroke();

    // Draw target temperature curve
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    for (var i = start; i < targetTemps.length; i++) {
        var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
        var yPosition = height + paddingTop - (targetTemps[i] / yAxisMax) * height;
        if (i === start) {
            ctx.moveTo(xPosition, yPosition);
        } else {
            ctx.lineTo(xPosition, yPosition);
        }
    }
    ctx.stroke();

    // Draw target pressure curve
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    for (var i = start; i < pressures.length; i++) {
        var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
        var yPosition = height + paddingTop - (pressures[i] / yAxisMax) * height;
        if (i === start) {
            ctx.moveTo(xPosition, yPosition);
        } else {
            ctx.lineTo(xPosition, yPosition);
        }
    }
    ctx.stroke();

    // Draw target temperature curve
    ctx.strokeStyle = 'purple';
    ctx.beginPath();
    for (var i = start; i < temperatures.length; i++) {
        var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
        var yPosition = height + paddingTop - (temperatures[i] / yAxisMax) * height;
        if (i === start) {
            ctx.moveTo(xPosition, yPosition);
        } else {
            ctx.lineTo(xPosition, yPosition);
        }
    }
    ctx.stroke();

    // Draw time labels
    if (timeStamps.length > 0) {
        var timeInterval = Math.floor(visiblePoints / 5) || 1;
        for (var i = start; i < envTemps.length; i += timeInterval) {
            var time = timeStamps[i];
            var timeStr = time.getHours() + ':' 
                        + String(time.getMinutes()).padStart(2, '0') + ':' 
                        + String(time.getSeconds()).padStart(2, '0');
            var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
            ctx.fillText(timeStr, xPosition, height + paddingTop + 20);
        }
    }

    // Legend
    ctx.fillStyle = 'black';
    ctx.fillText('环境温度', canvas.width / (window.devicePixelRatio || 1) - 100, 15);
    ctx.fillText('目标温度', canvas.width / (window.devicePixelRatio || 1) - 100, 30);
    ctx.fillText('压力', canvas.width / (window.devicePixelRatio || 1) - 100, 45);
    ctx.fillText('smp温度', canvas.width / (window.devicePixelRatio || 1) - 100, 60);

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.moveTo(canvas.width / (window.devicePixelRatio || 1) - 120, 10);
    ctx.lineTo(canvas.width / (window.devicePixelRatio || 1) - 105, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(canvas.width / (window.devicePixelRatio || 1) - 120, 25);
    ctx.lineTo(canvas.width / (window.devicePixelRatio || 1) - 105, 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.moveTo(canvas.width / (window.devicePixelRatio || 1) - 120, 40);
    ctx.lineTo(canvas.width / (window.devicePixelRatio || 1) - 105, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    ctx.moveTo(canvas.width / (window.devicePixelRatio || 1) - 120, 55);
    ctx.lineTo(canvas.width / (window.devicePixelRatio || 1) - 105, 55);
    ctx.stroke();
}

// 调用调整画布大小的函数
window.onload = function() {
    adjustCanvasSize();
    drawGraph();
};

window.onresize = function() {
    adjustCanvasSize();
    drawGraph();
};
