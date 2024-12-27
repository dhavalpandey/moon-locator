const canvas = document.getElementById("compass");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const currentDisplay = document.getElementById("current");
const targetDisplay = document.getElementById("target");
const permissionButton = document.getElementById("permission-button");
const compassCircle = document.querySelector(".compass-circle");
const myPoint = document.querySelector(".my-point");
const targetPoint = document.querySelector(".target-point");

const tolerance = 5;

let azimuthAligned = false;

const isIOS =
  navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  navigator.userAgent.match(/AppleWebKit/);

function calculatePosition(azimuth, elevation) {
  const radius = 150;
  const elevationFactor = Math.min(elevation / 90, 1);
  const distance = radius * (0.3 + 0.7 * elevationFactor);

  const radians = (azimuth - 90) * (Math.PI / 180);

  const x = 50 + ((distance * Math.cos(radians)) / radius) * 50;
  const y = 50 + ((distance * Math.sin(radians)) / radius) * 50;

  return { x, y };
}

async function requestMoonLocation(latitude, longitude, date_str) {
  const url = "http://127.0.0.1:5000/get-moon-location";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        time: date_str.toString(),
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error fetching moon location:", error);
    alert("Failed to retrieve moon location: " + error.message);
  }
}

function requestGeolocationPermission() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const dt_str = getTime();
        requestMoonLocation(latitude, longitude, dt_str)
          .then((moonData) => {
            if (moonData) {
              let { azimuth, elevation, distance, risen, next_rise, next_set } =
                moonData;
              azimuth = parseInt(azimuth);
              elevation = parseInt(elevation);

              if (risen) {
                plotTarget(azimuth, elevation);
                console.log(genRelativeTimeStr(next_set));
              } else {
                alert(genRelativeTimeStr(next_rise));
              }
            }
          })
          .catch((error) => {
            console.error("Error handling moon data:", error);
          });
      },
      (error) => {
        alert("Geolocation permissions denied.");
      },
    );
  } else {
    alert("Geolocation not supported by your browser");
  }
}

function requestDeviceOrientationPermission() {
  return new Promise((resolve, reject) => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            resolve(true);
          } else {
            alert("Permission to access device orientation was denied.");
            reject(new Error("Device orientation permission denied."));
          }
        })
        .catch(() => {
          alert("Device orientation permission request failed.");
          reject(new Error("Device orientation permission request failed."));
        });
    } else {
      resolve(true);
    }
  });
}

async function startCompass() {
  try {
    await requestDeviceOrientationPermission();
    if (!isIOS) {
      window.addEventListener("deviceorientationabsolute", handler, true);
    } else {
      window.addEventListener("deviceorientation", handler, true);
    }
  } catch (error) {
    alert(error);
  }
}

function handler(e) {
  let compass;
  if (isIOS) {
    compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  } else {
    compass = Math.abs(e.alpha - 360);
  }

  compassCircle.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;

  currentDisplay.textContent = `Current - Azimuth: ${compass.toFixed(
    2,
  )}° | Elevation: ${e.beta.toFixed(2)}°`;

  const userPosition = calculatePosition(compass, e.beta);
  myPoint.style.left = `${userPosition.x}%`;
  myPoint.style.top = `${userPosition.y}%`;

  checkAlignment(compass, e.beta);
}

function plotTarget(targetAzimuth, targetElevation) {
  const targetPosition = calculatePosition(targetAzimuth, targetElevation);

  targetDisplay.textContent = `Target - Azimuth: ${targetAzimuth.toFixed(
    0,
  )}° | Elevation: ${targetElevation.toFixed(0)}°`;
  targetPoint.style.left = `${targetPosition.x}%`;
  targetPoint.style.top = `${targetPosition.y}%`;
}

function checkAlignment(currentAzimuth, currentElevation) {
  const azDifference = Math.abs(targetAzimuth - currentAzimuth);
  const elDifference = Math.abs(targetElevation - currentElevation);

  const azAligned = azDifference < tolerance || azDifference > 360 - tolerance;
  const elAligned = elDifference < tolerance;

  if (azAligned && !azimuthAligned) {
    azimuthAligned = true;
    message.textContent = "Azimuth aligned! Now align the elevation.";
    message.style.color = "yellow";
  } else if (azAligned && elAligned) {
    message.textContent = "Target aligned!";
    message.style.color = "lime";
  } else {
    message.textContent =
      "Align your device towards the target direction and elevation.";
    message.style.color = "white";
  }
}

function init() {
  requestGeolocationPermission();
  permissionButton.addEventListener("click", startCompass);

  if (!isIOS) {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }
}

function startCompass() {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("Permission to access device orientation was denied.");
        }
      })
      .catch(() => alert("Device orientation permission request failed."));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
