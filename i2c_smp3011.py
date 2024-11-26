from machine import I2C, Pin
import time

class smp3011:
    def __init__(self, id=1, sda_pin=14, scl_pin=15):
        self.i2c = I2C(id, scl=Pin(scl_pin), sda=Pin(sda_pin))
        self.address = 0x78

    def read_pressure_temperature(self):
        try:
            self.i2c.writeto(self.address, bytes([0xac]))
            time.sleep_ms(310)
            data = bytearray(6)
            self.i2c.readfrom_into(self.address, data)

            status = data[0]
            bridge_data = (data[1] << 16) | (data[2] << 8) | data[3]
            temp_data = (data[4] << 8) | data[5]

            bridge_percentage = bridge_data / 16777216
            temp_percentage = temp_data / 65536

            pressure = ((bridge_percentage - 0.15) / 0.7) * (120 - 20) + 20
            temperature = ((150 - (-40)) * temp_percentage) - 40

            return status, pressure, temperature
        except Exception as e:
            print(f"Error reading from SMP3011: {e}")
            return None, None, None

    def get_pressure_temperature(self):
        status, pressure, temperature = self.read_pressure_temperature()
        if status is not None:
            if not status & (1 << 5): 
                return pressure, temperature
            else:
                print("Device busy, waiting...")
        return None, None