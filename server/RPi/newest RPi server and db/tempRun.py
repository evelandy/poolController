import time
import smbus
import datetime
from cold_on import on, off
from hot_on import on, off

bus = smbus.SMBus(1)

address = 0x4d

filterArray = [0, 0, 0, 0, 0, 0, 0, 0]


def filter(input_value):
    filterArray.append(input_value)
    filterArray.pop(0)
    result = float(sum(filterArray) / len(filterArray))
    stringFilterArray = [str(a) for a in filterArray]
    return result


def get_fahrenheit_val():
    data = bus.read_i2c_block_data(address, 1, 2)
    val = (data[0] << 8) + data[1]
    return val / 5.00 * 9.00 / 5.00 + 32.00


def run(tmp):
    on_off = False
    while True:
        time.sleep(2)
        temperature = get_fahrenheit_val()
        filtered_temperature = filter(temperature)

        if on_off == False and filtered_temperature > float(tmp):
            on()
#            print('on')
#            print(filtered_temperature)
            time.sleep(2)
            on_off = True
        elif on_off == True and filtered_temperature < float(tmp):
            off()
#            print('off')
#            print(filtered_temperature)
            time.sleep(2)
            on_off = False
#        else:
#            print(filtered_temperature)
    return 'good'


def main():
    run()


if __name__ == '__main__':
    main()
