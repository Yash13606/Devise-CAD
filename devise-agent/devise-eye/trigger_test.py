"""A guaranteed triggered test using local loopback."""
import socket
import time
import threading

def run_dummy_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", 19999))
    server.listen(1)
    try:
        conn, addr = server.accept()
        time.sleep(40) # hold connection
        conn.close()
    except Exception:
        pass
    server.close()

if __name__ == "__main__":
    t = threading.Thread(target=run_dummy_server, daemon=True)
    t.start()
    time.sleep(1) # wait for server to start
    
    print("Opening test connection to 127.0.0.1 to trigger detection...")
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(("127.0.0.1", 19999))
    
    print("Holding for 40 seconds... Check main.py logs for 'TestAI'!")
    for i in range(40):
        time.sleep(1)
        print(".", end="", flush=True)
    print("\nClosing test.")
    client.close()
