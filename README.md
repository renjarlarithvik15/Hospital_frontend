# Hospital Management System - Frontend

Modern, responsive web interface for the Hospital Management System. Built with HTML5, Bootstrap 5, JavaScript, and FontAwesome.

## Quick Links
- **Vercel Deployment**: Ready for zero-config deployment on Vercel.
- **Backend API**: Connects to the Spring Boot REST API hosted on Render.

## Deploy to Vercel (1-Click / Git Import)

1. Go to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select repository: `Hospital_frontend`.
3. In Build and Output Settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (Default root)
   - **Build Command**: None (leave empty)
   - **Output Directory**: None (leave empty)
4. Click **Deploy**.

## Configuring Backend URL

The frontend automatically detects whether you're running locally or on the cloud.
- **Localhost**: Points to `http://localhost:8080/api`
- **Production (Render)**: Set the active backend URL in `js/api.js`:
  ```javascript
  const DEFAULT_RENDER_BACKEND = 'https://<your-backend-app-name>.onrender.com/api';
  ```
- Or override on the fly without redeploying by entering this in the browser console:
  ```javascript
  localStorage.setItem('HMS_API_URL', 'https://<your-backend-app-name>.onrender.com/api');
  location.reload();
  ```
