from flask import Flask, request, jsonify
from skyfield.api import Topos, load
from datetime import datetime, timedelta
from skyfield import almanac
import zoneinfo
import pytz
from flask_cors import CORS 

all_times = zoneinfo.available_timezones()

app = Flask(__name__)
eph = load('de421.bsp')  
CORS(app)

def get_next_moon_events(latitude, longitude, local_time):
    try:
        location = Topos(latitude_degrees=latitude, longitude_degrees=longitude)
        ts = load.timescale()
        t0 = ts.from_datetime(local_time)
        t1 = ts.from_datetime(local_time + timedelta(days=30))

        f = almanac.risings_and_settings(eph, eph['moon'], location)
        times, events = almanac.find_discrete(t0, t1, f)

        next_rise = None
        next_set = None
        for t, event in zip(times, events):
            if event == True and next_rise is None:
                next_rise = t.utc_datetime().isoformat()
            elif event == False and next_set is None:
                next_set = t.utc_datetime().isoformat()
            if next_rise and next_set:
                break

        response = {
            "next_rise": datetime.fromisoformat(next_rise),
            "next_set": datetime.fromisoformat(next_set)
        }

        return response
    except Exception as e:
        return {"error": str(e)}

@app.route('/get-moon-location', methods=['POST'])
def get_moon_location():
    try:
        latitude = float(request.headers.get('latitude'))
        longitude = float(request.headers.get('longitude')) 
        elevation = float(50)
        dt_str = str(request.headers.get('time'))
        local_time = datetime.fromisoformat(dt_str)

        location = Topos(latitude_degrees=latitude, longitude_degrees=longitude, elevation_m=elevation)
        ts = load.timescale()
        t = ts.from_datetime(local_time)

        earth = eph['earth']
        moon = eph['moon']
        observer = earth + location
        moon_apparent = observer.at(t).observe(moon).apparent()
        alt, az, distance = moon_apparent.altaz()

        risen = False
        if alt.degrees > 0:
            risen = True
        
        states = get_next_moon_events(latitude, longitude, local_time)
        response = {
            "azimuth": float(f"{az.degrees:.2f}"),
            "elevation": float(f"{alt.degrees:.2f}"),
            "risen": risen,
            "distance": float(f"{distance.km:.2f}"),
            "next_rise": states["next_rise"],
            "next_set": states["next_set"]
        }

        return jsonify(response), 200

    except TypeError:
        return jsonify({"error": "Missing header parameters."}), 400
    except ValueError:
        return jsonify({"error": "Invalid parameter type."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)