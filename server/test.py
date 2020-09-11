import sqlite3


conn = sqlite3.connect('data.db')
print('db opened!')
conn.execute("""CREATE TABLE user(
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             username CHAR(80),
             password CHAR(120),
             admin BOOL);""")
print('Table created!')
conn.close()


# conn = sqlite3.connect('data.db')
# cur = conn.execute('SELECT * FROM data')
# for row in cur:
#     print(row)
#
# tester = conn.execute('DESC data')
# print(tester)
