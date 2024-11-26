var envTemps = [];
var targetTemps = [];
var pressures = [];
var temperatures = [];
var timeStamps = [];
var displayedPoints = 1000; // 显示的最大数据点数
var yAxisMax = 60; // y 轴的初始最大值

function fetchTemperature() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var sensor = JSON.parse(xhr.responseText);
            var envTemp = sensor.env_temp;
            var targetTemp = sensor.target_temp;
            var pressure = sensor.pressure;
            var temperature = sensor.temperature;
            var currentTime = new Date();

            document.getElementById('env-temp').innerHTML = '环境温度: ' + envTemp.toFixed(2) + ' C';
            document.getElementById('target-temp').innerHTML = '目标温度: ' + targetTemp.toFixed(2) + ' C';
            document.getElementById('pressure').innerHTML = '压力: ' + pressure.toFixed(2) + ' C';
            document.getElementById('temperature').innerHTML = 'smp温度: ' + temperature.toFixed(2) + ' C';

            envTemps.push(envTemp);
            targetTemps.push(targetTemp);
            timeStamps.push(currentTime);
            pressures.push(pressure);
            temperatures.push(temperature);

            // 找到当前最大温度
            var currentMaxTemp = Math.max(...envTemps, ...targetTemps);

            // 如果当前最大温度超过 y 轴最大值，更新 y 轴最大值
            if (currentMaxTemp > yAxisMax) {
                yAxisMax = Math.ceil(currentMaxTemp / 10) * 10; // 按 10 的倍数进行取整
            }

            drawGraph();
        }
    };
    xhr.open('GET', '/sensor', true);
    xhr.send();
}

setInterval(fetchTemperature, 1000);
