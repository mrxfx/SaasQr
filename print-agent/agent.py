"""
SaaS Multi-Tenant QR Printing Platform - Windows Print Agent (Mock)
===================================================================
This Python script simulates the Windows Print Agent that runs on the shop's
local counter PC, polls the print queue from the Render/Express API, and 
sends documents to the physical counter printer.

To run:
  1. Install Python 3.x
  2. Install requests: `pip install requests`
  3. Run: `python agent.py --shop mrxprint --server http://localhost:3000`
"""

import sys
import time
import argparse
import requests

def parse_arguments():
    parser = argparse.ArgumentParser(description="Windows Counter Printer Agent")
    parser.add_argument("--shop", required=True, help="Your Print Shop ID slug (e.g. mrxprint)")
    parser.add_argument("--server", default="http://localhost:3000", help="Base API Server URL")
    parser.add_argument("--interval", type=int, default=5, help="Polling interval in seconds")
    return parser.parse_args()

def poll_print_queue(server_url, shop_id):
    endpoint = f"{server_url}/api/print-queue?shopId={shop_id}"
    try:
        response = requests.get(endpoint, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("jobs", [])
        else:
            print(f"[Error] Failed to poll queue. Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[Connection Error] Cannot reach API server at {server_url}: {e}")
    return []

def update_job_status(server_url, order_id, status, error_msg=None):
    endpoint = f"{server_url}/api/print-queue/status"
    payload = {
        "orderId": order_id,
        "status": status,
        "printerError": error_msg
    }
    try:
        requests.post(endpoint, json=payload, timeout=10)
    except requests.exceptions.RequestException as e:
        print(f"[Error] Failed to update status for order {order_id}: {e}")

def simulate_print_job(job, server_url):
    job_id = job.get("id")
    file_name = job.get("fileName")
    copies = job.get("copies", 1)
    color_mode = job.get("colorMode", "bw")
    paper_size = job.get("paperSize", "A4")

    print("\n" + "="*50)
    print(f"📥 NEW PRINT JOB RECEIVED: {job_id}")
    print(f"   📄 File Name:  {file_name}")
    print(f"   🖨️  Copies:     {copies}")
    print(f"   🎨 Mode:       {color_mode.upper()}")
    print(f"   📐 Paper Size: {paper_size}")
    print("="*50)

    # 1. Update status to 'printing'
    print(f"⏳ [Status] Updating status to 'printing'...")
    update_job_status(server_url, job_id, "printing")
    time.sleep(2)

    # 2. Simulate download
    print(f"📥 [Process] Downloading document from cloud storage...")
    time.sleep(2)

    # 3. Simulate hardware communication
    print(f"🖨️  [Hardware] Sending print buffer to Local Printer USB Queue...")
    for page in range(1, copies + 1):
        print(f"   -> Spooling copy {page}/{copies} to paper tray...")
        time.sleep(1)

    # 4. Success / Complete
    print(f"✅ [Success] Job completed successfully!")
    update_job_status(server_url, job_id, "completed")
    print("="*50 + "\n")

def main():
    args = parse_arguments()
    print("="*60)
    print("🚀 WINDOWS COUNTER PRINTER ACTIVE AGENT INITIALIZED")
    print(f"   🏬 Shop ID:  {args.shop}")
    print(f"   🌐 Server:   {args.server}")
    print(f"   ⏱️  Polling:  Every {args.interval} seconds")
    print("="*60)
    print("Polling print queue... Press Ctrl+C to terminate.")

    while True:
        jobs = poll_print_queue(args.server, args.shop)
        if jobs:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Found {len(jobs)} print job(s) in queue!")
            for job in jobs:
                simulate_print_job(job, args.server)
        else:
            # Silent idle polling
            pass
        
        time.sleep(args.interval)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Windows Counter Print Agent shut down gracefully.")
        sys.exit(0)
