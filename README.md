# SCIF - Security & Cyber Threat Intelligence Fusion

## What is it??
A Self-hosted cyber threat intelligence dashboard. Aggregating IOC data, CVEs, live abuse feeds, and cert intel data into one interface.

## What does SCIF do?
- **IOC Pivot**: 
- **CVE tracker**:
- **Live feeds**:
- **Cert intel**:
- **Exposure scan**:
- **Workbook**:

# SETUP
 
## DOCKER (Recommended)
(Im still new to docker, so if theres a better way, Im all ears!)

```bash
git clone https://github.com/TheDong3rNeedsF00d/SCIF-Security-Cyber-Threat-Intelligence-Fusion
cd scif-dashboard
cp .env.example .env
# edit .env as you need.
docker-compose up --build
```

Open your browser to http://localhost:3001 

### Instructions
```bash
npm run install:all
cp .env.example server/.env
# edit server/.env
npm run dev
```

Client runs on :5173, the server on :3001.

## Configuration
`.env` controls everything:


```
DASHBOARD_PASSWORD=     # Leave this blank for open access(local use). This is where I did my testing.
ABUSEIPDB_KEY=
VIRUSTOTAL_KEY=
HIBP_KEY=
```

You can use different free resources like CISA, KEV, NVD, URLHaus, Threatfox, MalwareBazaar, crt.sh, IPInfo, shodan - internetdb etc. These work with no api keys needed. 
The current setup sources add abuse scoring, AV detections, and breach data. 

## Security Notes 

- API keys live in the `.env` file on the server. We dont send them to the browser for pickings!
- All upstream API calls are proxied through the backend.
- Rate limited per endpoint.
- You shouldn't expose your port 3001 to the webs without a password set and reverse proxy in front. (but you do you!)

## Stack
React + Vite (client)/ Express + SQLite (server)/ Docker Compose (For Deployment)

## License

MIT - Its Open Source, so please feel free to take and build!  Thats how we learn! 
