import httpx
import time
import socket
import threading

domains = ["chatgpt.com", "claude.ai", "openai.com", "gemini.google.com", "huggingface.co"]

def connect(domain):
    try:
        print(f"Connecting to {domain}...")
        socket.gethostbyname(domain)
        with httpx.Client(timeout=10.0) as client:
            client.get(f"https://{domain}")
    except Exception as e:
        pass

print("Starting aggressive traffic generation (30 seconds)...")
start_time = time.time()
while time.time() - start_time < 30:
    for domain in domains:
        t = threading.Thread(target=connect, args=(domain,))
        t.start()
    time.sleep(2)

print("Traffic generation complete.")
