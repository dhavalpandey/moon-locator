
from skyfield.api import Topos, load
from datetime import datetime
import pytz

eph = load('de421.bsp')  

latitude = 51.4228224
longitude = -0.1998848  
elevation = 19     

location = Topos(latitude_degrees=latitude, longitude_degrees=longitude, elevation_m=elevation)

local_timezone = pytz.timezone('Europe/London')
local_time = datetime.now(local_timezone)
print(f"Local Time: {local_time.strftime('%Y-%m-%d %H:%M:%S')}")

ts = load.timescale()
t = ts.from_datetime(local_time)

earth = eph['earth']
moon = eph['moon']

observer = earth + location
moon_apparent = observer.at(t).observe(moon).apparent()

alt, az, distance = moon_apparent.altaz()

print(f"Azimuth: {az.degrees:.2f} degrees")
print(f"Elevation: {alt.degrees:.2f} degrees")

if alt.degrees > 0:
    print("Moon is risen")
else:
    print("Moon is not risen")
