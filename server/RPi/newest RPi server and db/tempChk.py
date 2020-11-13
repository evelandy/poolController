import time
import smbus
import datetime


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


def run():
    final_temp = [0]
    for rn in range(12):
        temperature = get_fahrenheit_val()
        filtered_temperature = filter(temperature)
        final_temp.pop()
        final_temp.append(filtered_temperature)
    disp_temp = round(final_temp[0], 2)
    return disp_temp


def main():
    print(run())


if __name__ == '__main__':
    main()
