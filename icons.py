from PIL import Image, ImageDraw
YALE = (13, 59, 102)
CHIFFON = (250, 240, 202)
CHIFFON_D = (240, 224, 160)
def make(size, scale, path):
    S = 2048
    im = Image.new('RGB', (S, S), YALE); d = ImageDraw.Draw(im)
    cx = cy = S / 2; s = scale
    def rr(x0, y0, x1, y1, r, fill): d.rounded_rectangle([cx + x0*s, cy + y0*s, cx + x1*s, cy + y1*s], r*s, fill=fill)
    # plate
    d.ellipse([cx-480*s, cy-480*s, cx+480*s, cy+480*s], fill=CHIFFON)
    d.ellipse([cx-370*s, cy-370*s, cx+370*s, cy+370*s], fill=CHIFFON_D)
    d.ellipse([cx-350*s, cy-350*s, cx+350*s, cy+350*s], fill=CHIFFON)
    # fork (left)
    fx = -730
    for dx in (-66, 0, 66): rr(fx+dx-19, -560, fx+dx+19, -140, 19, CHIFFON)
    rr(fx-85, -230, fx+85, -110, 55, CHIFFON)
    rr(fx-28, -150, fx+28, 560, 28, CHIFFON)
    # spoon (right)
    sx = 730
    d.ellipse([cx+(sx-95)*s, cy-570*s, cx+(sx+95)*s, cy-150*s], fill=CHIFFON)
    rr(sx-28, -220, sx+28, 560, 28, CHIFFON)
    # check mark = meal planned / done
    w = int(74*s)
    pts = [(cx-165*s, cy+10*s), (cx-45*s, cy+135*s), (cx+180*s, cy-120*s)]
    d.line(pts, fill=YALE, width=w, joint='curve')
    for p in (pts[0], pts[2]):
        d.ellipse([p[0]-w/2, p[1]-w/2, p[0]+w/2, p[1]+w/2], fill=YALE)
    im.resize((size, size), Image.LANCZOS).save(path)
make(192, 1.0, 'icons/icon-192.png'); make(512, 1.0, 'icons/icon-512.png')
make(512, 0.78, 'icons/maskable-512.png'); make(180, 1.0, 'icons/apple-touch-icon.png'); make(32, 1.0, 'icons/favicon-32.png')
