import serial
from time import sleep
import time

# Ganti port sesuai ESP32 Anda (Windows: 'COM3', Linux/Mac: '/dev/ttyUSB0')
ser = serial.Serial('COM6', 115200, timeout=1)
sleep(2)  # tunggu ESP32 selesai boot

def send_lyrics():
    """
    Setiap tuple: (teks_lirik, durasi_tampil_detik, char_delay_typing_effect)
    - teks_lirik      : string yang dikirim ke ESP32
    - durasi_tampil   : berapa detik lirik ini ditampilkan sebelum lirik berikutnya
    - char_delay      : delay antar karakter untuk efek "mengetik" di terminal PC
    """
    lyrics = [
        # (teks,                               durasi_tampil, char_delay)
        ("Ophelia...",                          3.0,           0.10),
        ("Keep it one hundred on the land",    1.8,           0.05),
        ("The sea",                             0.8,           0.05),
        ("The sky",                             0.8,           0.05),
        ("Pledge allegiance to your hands",    1.8,           0.05),
        ("Your team",                           0.8,           0.05),
        ("Your vibes",                          0.8,           0.05),
        ("Don't care where the hell you've been", 1.5,        0.04),
        ("Cause now",                           0.7,           0.05),
        ("You're mine",                         0.7,           0.05),
        ("It's 'bout to be the sleepless night", 1.5,         0.04),
        ("You've been dreaming of",             1.8,           0.05),
        ("The fate of Ophelia",                 3.0,           0.08),
        ("-----------",                         1.5,           0.05),
        ("Volcra.lab",                          4.0,           0.08),
    ]

    for (text, display_duration, char_delay) in lyrics:
        # Efek mengetik di terminal PC (opsional, tidak mempengaruhi ESP32)
        for char in text:
            print(char, end='', flush=True)
            sleep(char_delay)
        print()  # newline di terminal

        # Kirim lirik ke ESP32
        ser.write((text + "\n").encode('utf-8'))
        ser.flush()

        # Tunggu sesuai durasi tampil
        # Kurangi sedikit untuk kompensasi latency serial + animasi (~300ms)
        wait = max(0.1, display_duration - 0.3)
        time.sleep(wait)

    print("\n[Selesai mengirim semua lirik]")
    ser.close()

send_lyrics()