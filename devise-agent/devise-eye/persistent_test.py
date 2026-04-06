import socket
import time
import sys

domain = "chatgpt.com"
print(f"Holding connection to {domain}...")

# Create a raw socket and hold it open
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((domain, 443))
    print(f"Connection ESTABLISHED to {domain}. Holding for 45 seconds...")
    print("Check your agent terminal output to see the detection event pop up!")
    
    # 45s ensures we perfectly overlap the 30s polling cycle
    for i in range(45):
        time.sleep(1)
        sys.stdout.write(".")
        sys.stdout.flush()
    print("\nClosing connection...")
    s.close()
    
except Exception as e:
    print(f"Failed to connect: {e}")
