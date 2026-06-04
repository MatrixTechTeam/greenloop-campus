// public/permissions.js
async function requestPermissions() {
  const userAgent = window.navigator.userAgent;
  const isApp =
    userAgent.indexOf("AppCreator24") !== -1 ||
    userAgent.indexOf("WebView") !== -1 ||
    userAgent.indexOf("Android") !== -1;

  console.log("User Agent:", userAgent);
  console.log("Is App/WebView:", isApp);

  if (isApp) {
    console.log("Running in WebView/App, requesting permissions...");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        console.log("Camera permission granted");
      } catch (err) {
        console.error("Camera permission denied:", err);
        if (err.name === "NotAllowedError") {
          showPermissionGuide();
        }
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location permission granted", position);
        },
        (error) => {
          console.error("Location permission denied:", error);
          if (error.code === error.PERMISSION_DENIED) {
            showPermissionGuide();
          }
        },
      );
    }
  }
}

function showPermissionGuide() {
  if (document.getElementById("permission-guide")) return;

  const guide = document.createElement("div");
  guide.id = "permission-guide";
  guide.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: #ff9800; color: white; padding: 15px; border-radius: 12px; z-index: 10000; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <strong>📱 Enable Permissions</strong><br>
            Go to <strong>App Settings → Permissions</strong><br>
            Enable <strong>Camera</strong> and <strong>Location</strong>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 8px; background: white; border: none; padding: 5px 12px; border-radius: 6px; color: #ff9800; cursor: pointer;">OK</button>
        </div>
    `;
  document.body.appendChild(guide);
}

setTimeout(requestPermissions, 1000);
