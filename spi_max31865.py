from time import sleep,sleep_ms
from machine import SPI,Pin,SoftSPI

class MAX31865:
    def __init__(self,\r
                 sck=10,\r
                 mosi=11,\r
                 miso=12,\r
                 cs=13,\r
                 baudrate=1000000,\r
                 polarity=0,\r
                 phase=1,\r
                 firstbit=SPI.MSB,\r
                 debug=False,\r
                 compensation=0):
        '''
                默认
                baudrate=1000000 10M
                polarity=0
                phase =1
                MSB
                compensation=0
        '''

        self.cs = Pin(cs,Pin.OUT)
        self.max31865 = SoftSPI(baudrate=baudrate,\r
                               polarity=polarity,phase=phase,\r
                               firstbit=SPI.MSB,\r
                               sck=Pin(sck),\r
                               mosi=Pin(mosi),\r
                               miso=Pin(miso))
        self.compensation = compensation
        self.max31865.init()
        self.DEBUG = debug
        self.config()

    def config(self,value=b'\x80\xc3'):
        '''
            默认:
            连续转换 bias on
        '''
        self.cs.off()
        self.max31865.write(value)
        self.cs.on()
        pass

    def readConfig(self):
        '''
        读配置寄存器
        '''
        self.cs.off()
        self.max31865.write(b'\x00')
        config = self.max31865.read(1)
        self.cs.on()
        if self.DEBUG:
            print(config)
        return(config)

    def readADC(self):
        '''
        读ADC值
        '''
        self.cs.off()
        self.max31865.write(b'\x01')
        msb = self.max31865.read(1)
        lsb = self.max31865.read(1)
        self.cs.on()
        if self.DEBUG:
            print("\t->msb:"+str(msb)+";lsb:"+str(lsb))
        return(msb[0],lsb[0])

    def readHFault(self):
        '''
        读上界限寄存器
        '''
        self.cs.off()
        self.max31865.write(b'\x03')
        msb = self.max31865.read(1)
        lsb = self.max31865.read(1)
        self.cs.on()
        if self.DEBUG:
            print("\t->hfmsb:"+str(msb)+";hflsb:"+str(lsb))
        return(msb[0],lsb[0])

    def readLFault(self):
        '''
        读下界限寄存器
        '''
        self.cs.off()
        self.max31865.write(b'\x05')
        msb = self.max31865.read(1)
        lsb = self.max31865.read(1)
        self.cs.on()
        if self.DEBUG:
            print("\t->hfmsb:"+str(msb)+";hflsb:"+str(lsb))
        return(msb[0],lsb[0])

    def readFault(self):
        '''
        读错误
        '''
        self.cs.off()
        self.max31865.write(b'\x07')
        config = self.max31865.read(1)
        self.cs.on()
        if self.DEBUG:
            print("\tfault:",config)
        return(config)

    def readTemperature(self):
        '''
        读温度值
        '''
        m,l = self.readADC()
        adc_code = (((m*256)+l)>>1)
        temp = ((adc_code/32) -256)
        r_pt = ((adc_code*430)/32768)
        temperature = (2.57*r_pt-257+self.compensation)
        return(temperature)