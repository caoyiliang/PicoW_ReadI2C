from machine import Pin
import time

class mrtd3011:
    def __init__(self, sda_pin=0, scl_pin=1):
        self.sda = Pin(sda_pin, Pin.OUT, Pin.PULL_UP)
        self.scl = Pin(scl_pin, Pin.OUT, Pin.PULL_UP)
        self.env_temp = 0.0
        self.target_temp = 0.0

    def sda_out(self):
        self.sda.init(Pin.OUT)

    def sda_in(self):
        self.sda.init(Pin.IN)

    def sda_high(self):
        self.sda.value(1)

    def sda_low(self):
        self.sda.value(0)

    def scl_high(self):
        self.scl.value(1)

    def scl_low(self):
        self.scl.value(0)

    def i2c_start(self):
        self.sda_out()
        self.sda_high()
        self.scl_high()
        time.sleep_us(5)
        self.sda_low()
        time.sleep_us(5)
        self.scl_low()
        time.sleep_us(5)

    def i2c_stop(self):
        self.sda_out()
        self.scl_low()
        self.sda_low()
        time.sleep_us(5)
        self.scl_high()
        time.sleep_us(5)
        self.sda_high()
        time.sleep_us(5)

    def i2c_write_byte(self, byte):
        self.sda_out()
        self.scl_low()
        sda_out_value = (byte & 0x80) >> 7
        time.sleep_us(5)
        for _ in range(8):
            if sda_out_value:
                self.sda_high()
            else:
                self.sda_low()
            time.sleep_us(5)
            self.scl_high()
            byte <<= 1
            sda_out_value = (byte & 0x80) >> 7
            time.sleep_us(5)
            self.scl_low()
            time.sleep_us(5)

        retry_counter = 0
        self.sda_in()
        time.sleep_us(5)
        self.scl_high()
        time.sleep_us(5)
        while self.sda.value():
            retry_counter += 1
            if retry_counter > 250:
                self.i2c_stop()
                return False
        time.sleep_us(5)
        self.scl_low()
        return True

    def i2c_read_byte(self, ack=True):
        byte = 0
        self.scl_low()
        self.sda_in()
        time.sleep_us(5)
        for _ in range(8):
            self.scl_high()
            byte = (byte << 1) | self.sda.value()
            time.sleep_us(5)
            self.scl_low()
            time.sleep_us(5)
        self.sda_out()
        time.sleep_us(5)
        self.scl_low()
        time.sleep_us(5)
        if ack:
            self.sda_low()
        else:
            self.sda_high()
        self.scl_high()
        time.sleep_us(5)
        return byte

    def read_temperature(self):
        u8_data = [0] * 7
        self.i2c_start()

        if not self.i2c_write_byte(0x20):
            print('写入错误: a')
            return
        if not self.i2c_write_byte(0x80):
            print('写入错误: b')
            return

        self.i2c_stop()
        self.i2c_start()

        self.i2c_write_byte(0x21)

        for i in range(6):
            u8_data[i] = self.i2c_read_byte(ack=True)
        u8_data[6] = self.i2c_read_byte(ack=False)  # 不发送 ACK 以结束读取
        
        self.i2c_stop()

        if self.crc_generating(u8_data, 6) == u8_data[6]:
            self.env_temp = ((((u8_data[1] >> 1) & 0x7F | ((u8_data[2] & 0x01) << 7)) << 8) |
                             ((u8_data[0] >> 1) & 0x7F | ((u8_data[1] & 0x01) << 7))) / 10
            self.target_temp = ((((u8_data[4] >> 1) & 0x7F | ((u8_data[5] & 0x01) << 7)) << 8) |
                                ((u8_data[3] >> 1) & 0x7F | ((u8_data[4] & 0x01) << 7))) / 10
            print('环境温度:', self.env_temp)
            print('目标温度:', self.target_temp)

    def crc_generating(self, data, length):
        crc = 0x00
        for byte in data[:length]:
            crc ^= byte
            for _ in range(8):
                if crc & 0x01:
                    crc >>= 1
                    crc ^= 0x8C
                else:
                    crc >>= 1
        return crc

    def get_temperatures(self):
        self.read_temperature()
        return self.env_temp, self.target_temp