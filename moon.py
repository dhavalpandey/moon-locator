from flask import Flask, request, jsonify
from skyfield.api import Topos, load
from datetime import datetime
import zoneinfo
import pytz
from flask_cors import CORS 

all_times = zoneinfo.available_timezones()

app = Flask(__name__)
eph = load('de421.bsp')  
CORS(app)
@app.route('/get-moon-location', methods=['POST'])
def get_moon_location():
    try:
        latitude = float(request.headers.get('latitude'))
        longitude = float(request.headers.get('longitude')) 
        elevation = float(request.headers.get('elevation'))  
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

        response = {
            "azimuth": float(f"{az.degrees:.2f}"),
            "elevation": float(f"{alt.degrees:.2f}"),
            "risen": risen,
            "distance": float(f"{distance.km:.2f}")
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