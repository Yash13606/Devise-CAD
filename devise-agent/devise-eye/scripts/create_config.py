"""
One-time setup script for Devise Desktop Agent.
Run this script to generate the default configuration file before starting the agent.
"""

import json
import os
import sys
from pathlib import Path


def main():
    # Only for Windows currently as per requirements
    if sys.platform != "win32":
        print("This script is currently designed for Windows.")
        print("For other platforms, please refer to the documentation.")
        return

    config_dir = r"C:\ProgramData\Devise"
    config_path = os.path.join(config_dir, "config.json")

    template = {
        "firebase_project_id": "your-project-id",
        "firebase_api_key": "your-web-api-key",
        "service_account_path": r"C:\ProgramData\Devise\service_account.json",
        "org_id": "your-org-id",
        "device_id": "",
        "poll_interval": 30,
        "heartbeat_interval": 300,
        "deduplication_window": 300,
        "debug": False
    }

    print("Devise Desktop Agent - Configuration Setup")
    print("-" * 45)

    try:
        # Create directory if it doesn't exist
        os.makedirs(config_dir, exist_ok=True)
        print(f"[*] Ensuring config directory exists: {config_dir}")

        # Check if config already exists
        if os.path.exists(config_path):
            print(f"[!] Configuration file already exists at: {config_path}")
            choice = input("Do you want to overwrite it? (y/n): ")
            if choice.lower() != 'y':
                print("Aborting setup.")
                return

        # Write the config file
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(template, f, indent=2)
            
        print(f"[*] Successfully created configuration template at: {config_path}")
        print("\n" + "=" * 60)
        print("                             ACTION REQUIRED")
        print("=" * 60)
        print("1. Open the file:")
        print(f"   {config_path}")
        print("2. Fill in the following required values:")
        print("   - firebase_project_id")
        print("   - firebase_api_key")
        print("   - org_id")
        print(f"3. Place your Firebase service account JSON key file at:")
        print(f"   C:\\ProgramData\\Devise\\service_account.json")
        print("=" * 60 + "\n")

    except PermissionError:
        print("\n[!] ERROR: Permission denied.")
        print(f"Cannot create or write to {config_dir}.")
        print("Please run this script as an Administrator.")
        sys.exit(1)
    except Exception as e:
        print(f"\n[!] An unexpected error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
