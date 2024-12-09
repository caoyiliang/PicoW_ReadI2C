function adjustCanvasSize() {
    var canvas = document.getElementById('temp-canvas');
    var parent = canvas.parentNode;
    canvas.width = parent.clientWidth * 0.9;
    canvas.height = parent.clientHeight * 0.9;
    var ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
}

function drawCurve(ctx, data, color, start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (var i = start; i < data.length; i++) {
        var xPosition = paddingLeft + ((i - start) / (visiblePoints - 1)) * width;
        var yPosition = height + paddingTop - (data[i] / yAxisMax) * height;
        if (i === start) {
            ctx.moveTo(xPosition, yPosition);
        } else {
            ctx.lineTo(xPosition, yPosition);
        }
    }
    ctx.stroke();
}

function drawGraph() {
    var canvas = document.getElementById('temp-canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (envTemps.length === 0) {
        return;
    }

    var paddingLeft = 50;
    var paddingRight = 20;
    var paddingBottom = 40;
    var paddingTop = 20;

    var width = canvas.width / (window.devicePixelRatio || 1) - paddingLeft - paddingRight;
    var height = canvas.height / (window.devicePixelRatio || 1) - paddingBottom - paddingTop;
    
    var start = Math.max(envTemps.length - displayedPoints, 0);
    var visiblePoints = Math.min(envTemps.length - start, displayedPoints);

    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height + paddingTop);
    ctx.lineTo(paddingLeft + width, height + paddingTop);
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

    // Draw curves for each dataset with respective color coding
    drawCurve(ctx, envTemps, 'blue', start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax);
    drawCurve(ctx, targetTemps, 'red', start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax);
    drawCurve(ctx, pressures, 'green', start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax);
    drawCurve(ctx, temperatures, 'purple', start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax);
    drawCurve(ctx, maxTemperatures, 'black', start, visiblePoints, paddingLeft, paddingTop, width, height, yAxisMax);

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
    ctx.fillText('smp 温度', canvas.width / (window.devicePixelRatio || 1) - 100, 60);
    ctx.fillText('max 温度', canvas.width / (window.devicePixelRatio || 1) - 100, 75);

    var legendYPositions = [10, 25, 40, 55, 70];
    var colors = ['blue', 'red', 'green', 'purple', 'black'];

    for (var i = 0; i < legendYPositions.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = colors[i];
        ctx.moveTo(canvas.width / (window.devicePixelRatio || 1) - 120, legendYPositions[i]);
        ctx.lineTo(canvas.width / (window.devicePixelRatio || 1) - 105, legendYPositions[i]);
        ctx.stroke();
    }
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