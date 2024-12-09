import network
import socket
from i2c_mrtd3011 import mrtd3011
from i2c_smp3011 import smp3011
from spi_max31865 import MAX31865
import json

def setup_wifi():
    SSID = "wifi"
    PASSWORD = "11111111"
    ap = network.WLAN(network.AP_IF)
    ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'))
    ap.config(essid=SSID, password=PASSWORD)
    ap.active(True)
    while not ap.active():
        pass
    print('WiFi 热点已启动\n')

def start_server(mrtd,smp,maxt):
    PORT = 80
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('192.168.4.1', PORT))
    s.listen(1)
    print('等待客户端连接，端口:', PORT)

    def handle_client(client):
        request = client.recv(1024).decode('utf-8')
        lines = request.split('\n')
        first_line = lines[0]
        method, path, _ = first_line.split()

        if path == '/':
            html_response = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>环境监测</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            display: flex;
            flex-direction: column;
        }

        header {
            padding: 20px;
            text-align: center;
            flex: 0 0 auto;
            display: flex;
            flex-direction: column; /* Stack header items vertically */
            align-items: center;
            gap: 20px;
        }

        .groups-container {
            display: flex;
            flex-direction: row; /* Arrange groups in a row */
            gap: 20px;
            justify-content: center; /* Center groups horizontally */
        }

        .group {
            border: 1px solid black;
            padding: 10px;
            display: flex;
            flex-direction: column;
        }

        #content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        canvas {
            width: 90%;
            height: 90%;
            border: 1px solid black;
        }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>传感器读取</h1>
        </div>
        <div class="groups-container">
            <div class="group">
                <p id="env-temp">环境温度: 加载中...</p>
                <p id="target-temp">目标温度: 加载中...</p>
            </div>
            <div class="group">
                <p id="pressure">压力: 加载中...</p>
                <p id="temperature">smp 温度: 加载中...</p>
            </div>
            <div class="group">
                <p id="maxTemperature">max 温度: 加载中...</p>
            </div>
        </div>
        <div>
            <button id="export-btn">导出数据</button>
        </div>
    </header>
    <div id="content">
        <canvas id="temp-canvas"></canvas>
    </div>
    <script src="export_csv.js"></script>
    <script src="getSensorData.js"></script>
    <script src="drawChart.js"></script>
</body>
</html>
    """
            client.send("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n".encode() + html_response.encode())
        elif path == '/sensor':
            env_temp, target_temp = mrtd.get_temperatures()
            pressure, temperature = smp.get_pressure_temperature()
            maxTemperature = maxt.readTemperature()
            temp_data = json.dumps({'env_temp': env_temp, 'target_temp': target_temp, 'pressure': pressure, 'temperature': temperature, 'maxTemperature': maxTemperature})
            client.send("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n".encode() + temp_data.encode())
        elif path == '/getSensorData.js':
            with open('getSensorData.js', 'r') as js_file:
                js_content = js_file.read()
            client.send("HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\n\r\n".encode() + js_content.encode())
        elif path == '/drawChart.js':
            with open('drawChart.js', 'r') as js_file:
                js_content = js_file.read()
            client.send("HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\n\r\n".encode() + js_content.encode())
        elif path == '/export_csv.js':
            with open('export_csv.js', 'r') as js_file:
                js_content = js_file.read()
            client.send("HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\n\r\n".encode() + js_content.encode())
        else:
            client.send("HTTP/1.1 404 Not Found\r\n\r\n".encode())

        client.close()

    while True:
        client, addr = s.accept()
        print('客户端连接自:', addr)
        handle_client(client)

def main():
    mrtd = mrtd3011()
    smp = smp3011()
    maxt = MAX31865()
    setup_wifi()
    start_server(mrtd,smp,maxt)

if __name__ == '__main__':
    main()
