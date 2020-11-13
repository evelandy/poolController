import RPi.GPIO as GPIO
import time

cold = 27
hot = 22


def on():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(hot, GPIO.OUT)
    GPIO.output(hot, GPIO.HIGH)


def off():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(hot, GPIO.OUT)
    GPIO.output(hot, GPIO.LOW)
    GPIO.cleanup()
