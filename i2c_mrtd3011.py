from machine import Pin,I2C

class mrtd3011:
    def __init__(self, sda_pin=0, scl_pin=1):
        self.i2c=I2C(0,sda=Pin(sda_pin),scl=Pin(scl_pin))
        self.env_temp = 0.0
        self.target_temp = 0.0

    def read_temperature(self):
        u8_data = bytearray(7)
        try:
            self.i2c.writeto(0x10, bytes([0x80]))            
            self.i2c.readfrom_into(0x10,u8_data)

        except OSError as e:
            print(f"Communication error: {e}")

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
