import sys
from time import sleep
try:
    from rich import print as print
except Exception:
    import re
    def print(*args, sep=" ", end="\n", flush=False, **kwargs):
        text = sep.join(str(a) for a in args)
        # remove simple rich markup like [bold], [/bold], [cyan], etc.
        text = re.sub(r'\[/?[^\]]+\]', '', text)
        sys.stdout.write(text + end)
        if flush:
            sys.stdout.flush()

def hide_cursor():
    sys.stdout.write("\033[?25l")
    sys.stdout.flush()

def show_cursor():
    sys.stdout.write("\033[?25h")
    sys.stdout.flush()

def printLyrics():
    title = "== CHOOSE YOUR FIGHTER =="

    lines = [
        ("You can be a lover or a fighter,", 0.062),
        ("Whatever you desire", 0.062),
        ("Life is like a runway", 0.062),
        ("And you're the designer", 0.062),
        ("Wings of a butterfly", 0.062),
        ("Eyes of a tiger", 0.072),
        ("Whatever you want", 0.062),
        ("Baby, choose your fighter", 0.062)
    ]

    delays = [0.4, 0.4, 0.4, 0.5, 0.4, 0.4, 0.4, 0.4]

    hide_cursor()
    try:
        print(f"[bold cyan]{title}[/bold cyan]")

        for i, (line, char_delay) in enumerate(lines):
            for char in line:
                print(f"[bold white]{char}[/bold white]", end="", flush=True)
                sys.stdout.flush()
                sleep(char_delay)
            print()
            if i < len(delays):
                sleep(delays[i])
    finally:
        sleep(3)
        show_cursor()

printLyrics()