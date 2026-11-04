"""Normalize a built .docx so the only font named anywhere is Times New Roman.

The docx library's default theme names Calibri Light / Calibri as the major and
minor latin typefaces and carries a per-script fallback list. No run uses them
(every run sets Times New Roman), but a theme-font fallback can surface in other
renderers, so after every build run:

    python3 fix_fonts.py file1.docx [file2.docx ...]

It rewrites every typeface attribute in the theme parts to Times New Roman and
then audits the whole package (runs, styles, docDefaults, theme, fontTable) and
fails loudly if any other font name remains.
"""
import re, sys, zipfile, shutil, os

FONT = "Times New Roman"

def fonts_in(data: bytes) -> set:
    x = data.decode("utf-8", "ignore")
    names = set(re.findall(r'typeface="([^"]*)"', x))
    names |= set(re.findall(r'w:(?:ascii|hAnsi|eastAsia|cs)="([^"]*)"', x))
    names |= set(re.findall(r'<w:font w:name="([^"]*)"', x))
    return {n for n in names if n}

for path in sys.argv[1:]:
    zin = zipfile.ZipFile(path)
    items = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    for n in list(items):
        if n.startswith("word/theme/") and n.endswith(".xml"):
            x = items[n].decode("utf-8")
            x = re.sub(r'typeface="[^"]*"', f'typeface="{FONT}"', x)
            items[n] = x.encode("utf-8")
    tmp = path + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for n, b in items.items():
            z.writestr(n, b)
    shutil.move(tmp, path)
    allfonts = set()
    for n, b in items.items():
        if n.endswith(".xml"):
            allfonts |= fonts_in(b)
    bad = allfonts - {FONT}
    print(f"{os.path.basename(path)}: fonts now {sorted(allfonts)}", "OK" if not bad else f"FAIL {bad}")
    if bad:
        sys.exit(1)
