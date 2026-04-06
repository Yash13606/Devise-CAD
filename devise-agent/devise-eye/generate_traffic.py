import httpx
import time
import socket

domains = ["chatgpt.com", "claude.ai", "openai.com"]
print("Generating traffic to AI domains...")

for i in range(10):
    domain = domains[i % len(domains)]
    print(f"[{i+1}/10] Connecting to {domain}...")
    try:
        # DNS resolution
        socket.gethostbyname(domain)
        # HTTP request
        with httpx.Client(timeout=5.0) as client:
            client.get(f"https://{domain}")
    except Exception as e:
        print(f"Error connecting to {domain}: {e}")
    time.sleep(5)

print("Traffic generation complete.")
