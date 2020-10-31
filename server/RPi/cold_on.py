import RPi.GPIO as GPIO
import time

cold = 27
hot = 22


def on():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(cold, GPIO.OUT)
    GPIO.output(cold, GPIO.HIGH)


def off():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(cold, GPIO.OUT)
    GPIO.output(cold, GPIO.LOW)
    GPIO.cleanup()
