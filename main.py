import network
import socket
from i2c_mrtd3011 import mrtd3011
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

def start_server(mrtd):
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
<html>
<head>
    <meta charset="UTF-8">
    <title>温度监测</title>
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
            flex: 0 0 auto; /* Allow header to size naturally */
        }

        #content {
            flex: 1; /* Grow to fill the remaining space */
            display: flex;
            justify-content: center;
            align-items: center;
        }

        canvas {
            width: 90%; /* 90% of the parent's width */
            height: 90%; /* 90% of the parent's height */
            border: 1px solid black;
        }
    </style>
</head>
<body>
    <header>
        <h1>温度读取</h1>
        <p id="env-temp">环境温度: 加载中...</p>
        <p id="target-temp">目标温度: 加载中...</p>
    </header>
    <div id="content">
        <canvas id="temp-canvas"></canvas>
    </div>
    <script src="temperature_monitor.js"></script>
</body>
</html>
    """
            client.send("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n".encode() + html_response.encode())
        elif path == '/temperature':
            env_temp, target_temp = mrtd.get_temperatures()
            temp_data = json.dumps({'env_temp': env_temp, 'target_temp': target_temp})
            client.send("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n".encode() + temp_data.encode())
        elif path == '/temperature_monitor.js':
            with open('temperature_monitor.js', 'r') as js_file:
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
    mrtd = mrtd3011(sda_pin=0, scl_pin=1)
    setup_wifi()
    start_server(mrtd)

if __name__ == '__main__':
    main()