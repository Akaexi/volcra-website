import serial
from time import sleep
import time

ser = serial.Serial('COM6', 115200, timeout=1)
sleep(2)

def send_lyrics():
    lyrics = [
        # ── Chorus — Choose Your Fighter (upbeat, ~120 BPM) ──────────────
        # (teks,                              durasi_tampil, char_delay)
        ("You can be a lover",               0.2,           0.062),
        ("or a fighter,",                    0.2,           0.062),
        ("Whatever you desire",              0.4,           0.062),
        ("Life is like a runway",            0.4,           0.062),
        ("And you're the designer",          0.5,           0.062),
        ("Wings of a butterfly",             0.4,           0.072),
        ("Eyes of a tiger",                  0.4,           0.072),
        ("Whatever you want",                0.4,           0.062),
        ("Baby, choose your fighter",        1.5,           0.062),

        # ── Pemisah ───────────────────────────────────────────────────────
        ("________________",                 0.1,           0.02),

        # ── Verse 1 — Kings & Queens (lebih lambat, ~100 BPM) ────────────
        ("Can't live without me,",           0.35,          0.055),
        ("you wanna, but you can't",         0.35,          0.055),
        ("nah-nah-nah...",                   0.6,           0.072),  # ada jeda di lagu
        ("Think it's funny, but honey,",     0.35,          0.055),
        ("Can't run this show on your own",  0.5,           0.052),

        # ── Pre-Chorus — Kings & Queens ───────────────────────────────────
        ("I can feel my body shake",         0.3,           0.062),
        ("there's only so much",             0.15,          0.052),
        ("I can take",                       0.15,          0.052),
        ("I'll show you how",                0.2,           0.052),
        ("a real queen behaves",             0.2,           0.052),
        ("oh...",                            1.0,           0.062),  # oh — ada jeda panjang
        ("No damsel in distress",            0.2,           0.072),
        ("don't need to save me",            1.0,           0.052),
        ("Once I start breathing fire",      0.2,           0.072),
        ("you can't tame me",                0.4,           0.052),
        ("And you might think",              0.2,           0.072),
        ("I'm weak without a sword",         0.2,           0.072),
        ("But if I had one,",                0.35,          0.072),
        ("it'd be bigger than yours",        0.35,          0.072),

        # ── Chorus — Kings & Queens ───────────────────────────────────────
        ("If all of the kings",              0.2,           0.062),
        ("had their queens on the throne",   0.2,           0.062),
        ("We would pop champagne",           0.2,           0.062),
        ("and raise a toast",                0.2,           0.062),
        ("To all of the queens",             0.2,           0.062),
        ("who are fighting alone",           0.2,           0.062),
        ("Baby, you're not",                 0.2,           0.062),
        ("dancin' on your own",              0.4,           0.062),

        # ── Outro ─────────────────────────────────────────────────────────
        ("-----------",                      1.5,           0.05),
        ("Volcra.lab",                       4.0,           0.08),
    ]

    for (text, display_duration, char_delay) in lyrics:
        for char in text:
            print(char, end='', flush=True)
            sleep(char_delay)
        print()

        ser.write((text + "\n").encode('utf-8'))
        ser.flush()

        wait = max(0.1, display_duration - 0.3)
        time.sleep(wait)

    print("\n[Selesai]")
    ser.close()

send_lyrics() 