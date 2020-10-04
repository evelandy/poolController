import sqlite3


# conn = sqlite3.connect('data.db')
# print('db opened!')
# conn.execute("""CREATE TABLE user(
#              id INTEGER PRIMARY KEY AUTOINCREMENT,
#              fname CHAR(80),
#              lname CHAR(80),
#              username CHAR(80) UNIQUE,
#              password CHAR(120),
#              email CHAR(80) UNIQUE,
#              address CHAR(80),
#              add2 CHAR(10),
#              city CHAR(40),
#              sta CHAR(4),
#              zipCode INTEGER,
#              phone INTEGER UNIQUE,
#              admin BOOL);""")
# print('Table created!')
# conn.close()


# conn = sqlite3.connect('data.db')
# cur = conn.execute('SELECT * FROM test')
# for row in cur:
#     print(row)
#
# tester = conn.execute('DESC test')
# print(tester)

"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger


scheduler = BlockingScheduler()


def show_txt():
    print('hello from show text!')


# scheduler.add_job(
#     func=show_txt,
#     trigger=IntervalTrigger(seconds=3)
# )
#
# scheduler.start()


f = 2
@scheduler.scheduled_job('interval', seconds=f)
def my_interval_job():
    print('Hello World!')


scheduler.start()


"""
