import json, pathlib, re
root = pathlib.Path(__file__).parent
tpl = (root / "src/index.html").read_text()
d = json.loads((root / "build/data.json").read_text())
vids = []
for line in (root / "videos.txt").read_text().splitlines():
    if not line.strip(): continue
    vid, c, g, dur, t = line.split("|", 4)
    t = re.sub(r"\(소리가 없는 영상입니다\.\)", "", t)
    t = re.sub(r"^\"?\s*(태성환경연구소|Taesung Environment Institute)\s*[_\-–]?\s*", "", t.strip()) or t
    t = re.sub(r"^[\s\-_\"]+|[\s\-_\"]+$", "", t).replace("_", " ")
    vids.append(dict(id=vid, c=c, g=g, d=dur, t=re.sub(r"\s+", " ", t)))
d["videos"] = vids
print("videos", len(vids))
data = json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
app = "\n".join((root / f"src/app{i}.js").read_text() for i in (1, 2, 3, 4)).replace("</script", "<\\/script")
out = tpl.replace("/*__DATA__*/", data).replace("/*__APP__*/", app)
(root / "build/index.html").write_text(out)
print("index.html", len(out) // 1024, "KB")
