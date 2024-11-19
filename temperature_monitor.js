var envTemps = [];
var targetTemps = [];
var timeStamps = [];
var displayedPoints = 1000; // 显示的最大数据点数
var yAxisMax = 60; // y 轴的初始最大值

function fetchTemperature() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var temperatures = JSON.parse(xhr.responseText);
            var envTemp = temperatures.env_temp;
            var targetTemp = temperatures.target_temp;
            var currentTime = new Date();

            document.getElementById('env-temp').innerHTML = '环境温度: ' + envTemp.toFixed(2) + ' C';
            document.getElementById('target-temp').innerHTML = '目标温度: ' + targetTemp.toFixed(2) + ' C';

            envTemps.push(envTemp);
            targetTemps.push(targetTemp);
            timeStamps.push(currentTime);

            // 找到当前最大温度
            var currentMaxTemp = Math.max(...envTemps, ...targetTemps);

            // 如果当前最大温度超过 y 轴最大值，更新 y 轴最大值
            if (currentMaxTemp > yAxisMax) {
                yAxisMax = Math.ceil(currentMaxTemp / 10) * 10; // 按 10 的倍数进行取整
            }

            drawGraph();
        }
    };
    xhr.open('GET', '/temperature', true);
    xhr.send();
}

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

setInterval(fetchTemperature, 1000);